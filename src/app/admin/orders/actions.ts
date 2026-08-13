"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { getAllowedNextStatuses } from "@/lib/orderStatus";
import { consumeInventoryLots } from "@/lib/inventoryLots";
import { formatOrderNumber } from "@/lib/orderNumber";
import { sendMetaServerEvent } from "@/lib/serverAnalytics";

type ManualOrderItem = { variantId: string; quantity: number };

function parseItems(value: FormDataEntryValue | null): ManualOrderItem[] {
  try {
    const items: unknown = JSON.parse(String(value || "[]"));
    if (!Array.isArray(items)) throw new Error();
    return items as ManualOrderItem[];
  } catch {
    throw new Error("Invalid order items.");
  }
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("orderId") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status)
    throw new Error("Invalid order status.");

  const productIds = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new Error("Order not found.");
    if (order.status === status)
      return order.items.map((item) => item.productId);
    if (!getAllowedNextStatuses(order.status, order.paymentMethod).includes(status))
      throw new Error("This order can only move to its next step or be cancelled.");

    const isRestockedStatus = (s: string) => s === "cancelled" || s === "returned";

    if (!isRestockedStatus(order.status) && isRestockedStatus(status)) {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    if (isRestockedStatus(order.status) && !isRestockedStatus(status)) {
      for (const item of order.items) {
        const reserved = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (reserved.count !== 1)
          throw new Error(`Not enough stock to reopen ${item.productName}.`);
      }
    }

    await tx.order.update({ where: { id }, data: { status } });
    return order.items.map((item) => item.productId);
  });


  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
  for (const productId of new Set(productIds))
    revalidatePath(`/shop/${productId}`);

  if (["shipped", "delivered", "cancelled", "returned"].includes(status)) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (order) {
      await sendMetaServerEvent({
        eventName:
          status === "delivered"
            ? "OrderDelivered"
            : status === "cancelled"
            ? "OrderCancelled"
            : status === "returned"
            ? "OrderReturned"
            : "OrderShipped",
        eventId: `${order.orderNumber}-${status}`,
        eventSourceUrl: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://deromastore.com"}/admin/orders/${order.id}`,
        value: Number(order.totalPrice),
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        customer: {
          phone: order.customerPhone,
          firstName: order.customerFirstName,
          lastName: order.customerLastName,
          city: order.city,
          state: order.governorate,
          country: "eg",
        },
      });
    }
  }
}

export async function createManualOrderAction(formData: FormData) {
  await requireAdmin();
  const customerFirstName = String(formData.get("customerFirstName") || "").trim();
  const customerLastName = String(formData.get("customerLastName") || "").trim();
  const customerNameInput = String(formData.get("customerName") || "").trim();

  const firstName = customerFirstName || customerNameInput.split(" ")[0] || "";
  const lastName = customerLastName || customerNameInput.split(" ").slice(1).join(" ") || "";
  const customerName = `${firstName} ${lastName}`.trim() || customerNameInput;
  const customerPhone = String(formData.get("customerPhone") || "").trim();
  const customerPhone2 = String(formData.get("customerPhone2") || "").trim() || null;
  const customerEmail = String(formData.get("customerEmail") || "").trim().toLowerCase() || null;
  const governorate = String(formData.get("governorate") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const shippingCost = Number(formData.get("shippingCost") || 0);
  const requestedDiscount = Number(formData.get("discount") || 0);
  const paymentMethod = String(formData.get("paymentMethod") || "cod").trim();
  const orderSource = String(formData.get("orderSource") || "").trim();
  const notesInput = String(formData.get("notes") || "").trim();
  const itemsInput = parseItems(formData.get("itemsJson"));

  if ((!firstName && !customerName) || !customerPhone || !governorate || !city || !address)
    throw new Error("Customer and order details are required.");
  if (
    !Number.isFinite(shippingCost) ||
    shippingCost < 0 ||
    !Number.isFinite(requestedDiscount) ||
    requestedDiscount < 0
  )
    throw new Error("Shipping and discount must be valid positive numbers.");
  if (
    !itemsInput.length ||
    itemsInput.some(
      (item) =>
        !item.variantId ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1,
    )
  )
    throw new Error("Add at least one valid product to the manual order.");
  if (
    new Set(itemsInput.map((item) => item.variantId)).size !== itemsInput.length
  )
    throw new Error("Duplicate product variants are not allowed.");
  if (!['cod', 'instapay', 'wallet', 'card'].includes(paymentMethod))
    throw new Error("Invalid payment method.");

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: itemsInput.map((item) => item.variantId) } },
    include: { product: true },
  });
  if (variants.length !== itemsInput.length)
    throw new Error("One or more selected products no longer exist.");

  const subtotalPrice = itemsInput.reduce((sum, item) => {
    const variant = variants.find(
      (candidate) => candidate.id === item.variantId,
    )!;
    return sum + Number(variant.product.price) * Number(item.quantity);
  }, 0);
  const discountAmount = Math.min(requestedDiscount, subtotalPrice);
  const totalPrice = subtotalPrice - discountAmount + shippingCost;

  const order = await prisma.$transaction(async (tx) => {
    for (const item of itemsInput) {
      const reserved = await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: Number(item.quantity) } },
        data: { stock: { decrement: Number(item.quantity) } },
      });
      if (reserved.count !== 1) {
        const variant = variants.find(
          (candidate) => candidate.id === item.variantId,
        )!;
        throw new Error(
          `Not enough stock for ${variant.product.name} (${variant.product.color || "No color"} / ${variant.size}).`,
        );
      }
      await consumeInventoryLots(tx, item.variantId, Number(item.quantity));
    }

    await tx.customer.upsert({
      where: { phone: customerPhone },
      create: { firstName, lastName, name: customerName, phone: customerPhone, phone2: customerPhone2, email: customerEmail, governorate, city, address },
      update: { firstName, lastName, name: customerName, phone2: customerPhone2, email: customerEmail, governorate, city, address },
    });
    const notes = [orderSource && `Source: ${orderSource}`, notesInput].filter(Boolean).join("\n") || null;
    const createdOrder = await tx.order.create({
      data: {
        orderNumber: `DR-PENDING-${randomUUID()}`,
        customerFirstName: firstName,
        customerLastName: lastName,
        customerName,
        customerPhone,
        customerPhone2,
        governorate,
        city,
        address,
        shippingCost,
        totalPrice,
        subtotalPrice,
        discountAmount,
        notes,
        manual: true,
        paymentMethod,
        status: "pending",
        items: {
          create: itemsInput.map((item) => {
            const variant = variants.find(
              (candidate) => candidate.id === item.variantId,
            )!;
            return {
              productId: variant.productId,
              variantId: variant.id,
              productName: variant.product.name,
              size: variant.size,
              color: variant.product.color || "",
              quantity: Number(item.quantity),
              price: variant.product.price,
              unitCost:
                Number(variant.product.wholesalePrice || 0) +
                Number(variant.product.additionalCost || 0),
            };
          }),
        },
      },
    });
    return tx.order.update({
      where: { id: createdOrder.id },
      data: { orderNumber: formatOrderNumber(createdOrder.orderSequence) },
    });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
  redirect(`/admin/orders/${order.id}`);
}
