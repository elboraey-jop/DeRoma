"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { getAllowedNextStatuses } from "@/lib/orderStatus";
import { consumeInventoryLots } from "@/lib/inventoryLots";
import { formatOrderNumber } from "@/lib/orderNumber";
import { sendOrderOwnerEmail } from "@/lib/orderEmail";
import { sendMetaServerEvent } from "@/lib/serverAnalytics";

type ManualOrderItem = { variantId: string; quantity: number; price?: number };
export type ManualOrderActionState = { error?: string };

function parseItems(value: FormDataEntryValue | null): ManualOrderItem[] {
  try {
    const items: unknown = JSON.parse(String(value || "[]"));
    if (!Array.isArray(items)) throw new Error();
    return items as ManualOrderItem[];
  } catch {
    throw new Error("Invalid order items.");
  }
}

async function restoreInventoryLots(tx: Parameters<typeof consumeInventoryLots>[0], variantId: string, quantity: number) {
  let remainingToRestore = quantity;
  const lots = await tx.inventoryLot.findMany({
    where: { variantId },
    orderBy: { receivedAt: "asc" },
  });
  for (const lot of lots) {
    if (remainingToRestore <= 0) break;
    const capacity = Math.max(0, lot.quantity - lot.remaining);
    const restored = Math.min(capacity, remainingToRestore);
    if (!restored) continue;
    await tx.inventoryLot.update({
      where: { id: lot.id },
      data: { remaining: { increment: restored } },
    });
    remainingToRestore -= restored;
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
    // A stale orders page can submit an id that was already removed or
    // replaced. Treat that submission as a no-op and let revalidation refresh
    // the list instead of exposing a server runtime error.
    if (!order) return [];
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

    // Use updateMany for the final write so a stale or double-submitted form
    // cannot surface Prisma's raw P2025 runtime error to the admin UI.
    const updated = await tx.order.updateMany({
      where: { id },
      data: { status },
    });
    if (updated.count !== 1) return [];
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
        eventSourceUrl: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://deroma.store"}/admin/orders/${order.id}`,
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

export async function createManualOrderAction(_previousState: ManualOrderActionState, formData: FormData): Promise<ManualOrderActionState> {
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
  const paymentSenderPhone = String(formData.get("paymentSenderPhone") || "").trim() || null;
  const orderSource = String(formData.get("orderSource") || "").trim();
  const notesInput = String(formData.get("notes") || "").trim();
  let itemsInput: ManualOrderItem[];
  try {
    itemsInput = parseItems(formData.get("itemsJson"));
  } catch {
    return { error: "أضف منتجًا صحيحًا واحدًا على الأقل إلى الطلب." };
  }

  if ((!firstName && !customerName) || !customerPhone || !governorate || !city || !address)
    return { error: "أكمل اسم العميل ورقم الهاتف والمحافظة والمدينة والعنوان بالتفصيل." };
  if (
    !Number.isFinite(shippingCost) ||
    shippingCost < 0 ||
    !Number.isFinite(requestedDiscount) ||
    requestedDiscount < 0
  )
    return { error: "مصاريف الشحن والخصم يجب أن تكون أرقامًا صحيحة غير سالبة." };
  if (
    !itemsInput.length ||
    itemsInput.some(
      (item) =>
        !item.variantId ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1,
    )
  )
    return { error: "أضف منتجًا واحدًا صالحًا على الأقل إلى الطلب." };
  if (
    new Set(itemsInput.map((item) => item.variantId)).size !== itemsInput.length
  )
    return { error: "لا يمكن إضافة نفس المقاس أو المنتج مرتين. عدّل الكمية بدلًا من ذلك." };
  if (!['cod', 'instapay', 'wallet', 'card'].includes(paymentMethod))
    return { error: "اختر طريقة دفع صحيحة." };

  let createdOrderId = "";
  try {
    const variants = await prisma.productVariant.findMany({
    where: { id: { in: itemsInput.map((item) => item.variantId) } },
    include: { product: true },
  });
    if (variants.length !== itemsInput.length)
      return { error: "أحد المنتجات المختارة لم يعد موجودًا. حدّث الصفحة وحاول مرة أخرى." };

    const subtotalPrice = itemsInput.reduce((sum, item) => {
    const variant = variants.find(
      (candidate) => candidate.id === item.variantId,
    )!;
    return sum + Number(item.price ?? variant.product.price) * Number(item.quantity);
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
        paymentSenderPhone: paymentMethod === "cod" ? null : paymentSenderPhone,
        paymentProofStatus: paymentMethod === "cod" ? "not_required" : "awaiting_whatsapp",
        status: paymentMethod === "cod" ? "pending" : "pending_payment",
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
              price: item.price ?? variant.product.price,
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
      include: { items: true },
    });
    });
    createdOrderId = order.id;

    await sendOrderOwnerEmail({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerPhone2: order.customerPhone2,
    governorate: order.governorate,
    city: order.city,
    address: order.address,
    notes: order.notes,
    subtotalPrice: Number(order.subtotalPrice),
    shippingCost: Number(order.shippingCost),
    totalPrice: Number(order.totalPrice),
    paymentMethod: order.paymentMethod,
    paymentSenderPhone: order.paymentSenderPhone,
    paymentProofStatus: order.paymentProofStatus,
    items: order.items.map((item) => ({
      productName: item.productName,
      color: item.color || "",
      size: item.size,
      quantity: item.quantity,
      price: Number(item.price),
    })),
    });

  } catch (error) {
    console.error("Failed to create manual order:", error);
    return {
      error: error instanceof Error ? error.message : "تعذر إنشاء الطلب. راجع البيانات وحاول مرة أخرى.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/financials");
  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
  redirect(`/admin/orders/${createdOrderId}`);
}

export async function updateOrderAction(_previousState: ManualOrderActionState, formData: FormData): Promise<ManualOrderActionState> {
  await requireAdmin();
  const id = String(formData.get("orderId") || "").trim();
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
  const paymentSenderPhone = String(formData.get("paymentSenderPhone") || "").trim() || null;
  const orderSource = String(formData.get("orderSource") || "").trim();
  const notesInput = String(formData.get("notes") || "").trim();
  let itemsInput: ManualOrderItem[];

  try {
    if (!id) return { error: "الطلب المطلوب تعديله غير موجود." };
    itemsInput = parseItems(formData.get("itemsJson"));
  } catch {
    return { error: "أضف منتجًا صحيحًا واحدًا على الأقل إلى الطلب." };
  }

  if (!customerName || !customerPhone || !governorate || !city || !address)
    return { error: "أكمل اسم العميل ورقم الهاتف والمحافظة والمدينة والعنوان بالتفصيل." };
  if (!Number.isFinite(shippingCost) || shippingCost < 0 || !Number.isFinite(requestedDiscount) || requestedDiscount < 0)
    return { error: "مصاريف الشحن والخصم يجب أن تكون أرقامًا صحيحة غير سالبة." };
  if (!itemsInput.length || itemsInput.some((item) => !item.variantId || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || (item.price !== undefined && (!Number.isFinite(Number(item.price)) || Number(item.price) < 0))))
    return { error: "أضف منتجًا واحدًا صالحًا على الأقل إلى الطلب." };
  if (new Set(itemsInput.map((item) => item.variantId)).size !== itemsInput.length)
    return { error: "لا يمكن إضافة نفس المقاس أو المنتج مرتين. عدّل الكمية بدلًا من ذلك." };
  if (!['cod', 'instapay', 'wallet', 'card'].includes(paymentMethod))
    return { error: "اختر طريقة دفع صحيحة." };

  try {
    await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!existingOrder) throw new Error("الطلب غير موجود أو تم حذفه بالفعل.");
      const variants = await tx.productVariant.findMany({
        where: { id: { in: itemsInput.map((item) => item.variantId) } },
        include: { product: true },
      });
      if (variants.length !== itemsInput.length) throw new Error("أحد المنتجات المختارة لم يعد موجودًا. حدّث الصفحة وحاول مرة أخرى.");

      const oldQuantities = new Map<string, number>();
      existingOrder.items.forEach((item) => oldQuantities.set(item.variantId, (oldQuantities.get(item.variantId) || 0) + item.quantity));
      const newQuantities = new Map<string, number>();
      itemsInput.forEach((item) => newQuantities.set(item.variantId, item.quantity));
      const isInventoryReserved = !["cancelled", "returned"].includes(existingOrder.status);

      if (isInventoryReserved) {
        const variantIds = new Set([...oldQuantities.keys(), ...newQuantities.keys()]);
        for (const variantId of variantIds) {
          const delta = (newQuantities.get(variantId) || 0) - (oldQuantities.get(variantId) || 0);
          if (delta > 0) {
            const reserved = await tx.productVariant.updateMany({ where: { id: variantId, stock: { gte: delta } }, data: { stock: { decrement: delta } } });
            if (reserved.count !== 1) {
              const variant = variants.find((item) => item.id === variantId);
              throw new Error(`Not enough stock for ${variant?.product.name || "the selected product"}.`);
            }
            await consumeInventoryLots(tx, variantId, delta);
          } else if (delta < 0) {
            await tx.productVariant.update({ where: { id: variantId }, data: { stock: { increment: Math.abs(delta) } } });
            await restoreInventoryLots(tx, variantId, Math.abs(delta));
          }
        }
      }

      const subtotalPrice = itemsInput.reduce((sum, item) => {
        const variant = variants.find((candidate) => candidate.id === item.variantId)!;
        return sum + Number(item.price ?? variant.product.price) * item.quantity;
      }, 0);
      const discountAmount = Math.min(requestedDiscount, subtotalPrice);
      const totalPrice = subtotalPrice - discountAmount + shippingCost;
      const notes = [orderSource && `Source: ${orderSource}`, notesInput].filter(Boolean).join("\n") || null;
      const nextPaymentProofStatus = paymentMethod === "cod"
        ? "not_required"
        : existingOrder.paymentProofStatus === "not_required"
          ? "awaiting_whatsapp"
          : existingOrder.paymentProofStatus;

      await tx.customer.upsert({
        where: { phone: customerPhone },
        create: { firstName, lastName, name: customerName, phone: customerPhone, phone2: customerPhone2, email: customerEmail, governorate, city, address },
        update: { firstName, lastName, name: customerName, phone2: customerPhone2, email: customerEmail, governorate, city, address },
      });
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      await tx.order.update({
        where: { id },
        data: {
          customerFirstName: firstName,
          customerLastName: lastName,
          customerName,
          customerPhone,
          customerPhone2,
          governorate,
          city,
          address,
          notes,
          subtotalPrice,
          discountAmount,
          shippingCost,
          totalPrice,
          paymentMethod,
          paymentSenderPhone: paymentMethod === "cod" ? null : paymentSenderPhone,
          paymentProofStatus: nextPaymentProofStatus,
          items: {
            create: itemsInput.map((item) => {
              const variant = variants.find((candidate) => candidate.id === item.variantId)!;
              const price = Number(item.price ?? variant.product.price);
              return {
                productId: variant.productId,
                variantId: variant.id,
                productName: variant.product.name,
                size: variant.size,
                color: variant.product.color || "",
                quantity: item.quantity,
                price,
                unitCost: Number(variant.product.wholesalePrice || 0) + Number(variant.product.additionalCost || 0),
              };
            }),
          },
        },
      });
    });
  } catch (error) {
    console.error("Failed to update order:", error);
    return { error: error instanceof Error ? error.message : "تعذر تحديث الطلب. راجع البيانات وحاول مرة أخرى." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/admin/orders/${id}/edit`);
  revalidatePath("/admin/financials");
  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
  redirect(`/admin/orders/${id}`);
}

export async function confirmOrderPaymentAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("orderId") || "");
  if (!id) throw new Error("Invalid order.");

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, paymentMethod: true, status: true },
  });
  if (!order) throw new Error("Order not found.");
  if (["cod", "cash_on_delivery"].includes(order.paymentMethod || "cod")) {
    throw new Error("Cash-on-delivery orders do not need payment confirmation.");
  }
  if (order.status !== "pending_payment") {
    throw new Error("This order is not waiting for payment confirmation.");
  }

  await prisma.order.update({
    where: { id },
    data: { status: "paid", paymentProofStatus: "verified", paymentProofSentAt: new Date() },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/financials");
}
