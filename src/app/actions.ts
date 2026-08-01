"use server";

import { randomUUID } from "node:crypto";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { consumeInventoryLots } from "@/lib/inventoryLots";

interface CheckoutItemInput {
  productId: string;
  variantId: string;
  quantity: number;
}

interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerPhone2?: string;
  governorate: string;
  city: string;
  address: string;
  notes?: string;
  couponCode?: string;
  items: CheckoutItemInput[];
}

// Governorate Shipping Fees mapping
const SHIPPING_FEES: Record<string, number> = {
  القاهرة: 50,
  الجيزة: 50,
  الإسكندرية: 60,
  القليوبية: 70,
  الشرقية: 70,
  الدقهلية: 70,
  المنوفية: 70,
  الغربية: 70,
  "كفر الشيخ": 70,
  دمياط: 70,
  بورسعيد: 70,
  الإسماعيلية: 70,
  السويس: 70,
  الفيوم: 90,
  "بني سويف": 90,
  المنيا: 90,
  أسيوط: 90,
  سوهاج: 90,
  قنا: 90,
  الأقصر: 90,
  أسوان: 90,
  "البحر الأحمر": 120,
  "الوادي الجديد": 120,
  مطروح: 120,
  "شمال سيناء": 120,
  "جنوب سيناء": 120,
};

export async function createOrder(input: CreateOrderInput) {
  try {
    // 1. Validation
    if (
      !input.customerName ||
      !input.customerPhone ||
      !input.governorate ||
      !input.city ||
      !input.address ||
      input.items.length === 0
    ) {
      return {
        success: false,
        error: "الرجاء ملء جميع الحقول المطلوبة وإضافة منتجات للسلة.",
      };
    }

    // 2. Resolve shipping fee from admin settings, with legacy fallback.
    const shippingZone = await prisma.shippingZone.findFirst({
      where: { active: true, governorates: { has: input.governorate } },
    });
    let shippingCost = shippingZone
      ? Number(shippingZone.fee)
      : (SHIPPING_FEES[input.governorate] ?? 70);

    // 3. Process items and calculate total securely on server
    let subtotal = 0;
    const dbItemsToCreate: Array<{
      productId: string;
      variantId: string;
      productName: string;
      size: string;
      color: string;
      quantity: number;
      price: number;
      unitCost: number;
      category: string;
      material: string | null;
    }> = [];

    // Fetch product details and check stock
    for (const item of input.items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant) {
        return { success: false, error: "أحد المنتجات غير موجود في النظام." };
      }

      if (variant.stock < item.quantity) {
        return {
          success: false,
          error: `عذراً، المقاس المطلوب للحذاء "${variant.product.name}" باللون (${variant.product.color || "غير محدد"}) والمقاس (${variant.size}) غير متوفر بالكمية المطلوبة. المتوفر حالياً: ${variant.stock} فقط.`,
        };
      }

      const itemPrice = Number(variant.product.price);
      subtotal += itemPrice * item.quantity;

      dbItemsToCreate.push({
        productId: variant.productId,
        variantId: variant.id,
        productName: variant.product.name,
        size: variant.size,
        color: variant.product.color || "",
        quantity: item.quantity,
        price: itemPrice,
        unitCost:
          Number(variant.product.wholesalePrice || 0) +
          Number(variant.product.additionalCost || 0),
        category: variant.product.category,
        material: variant.product.material,
      });
    }

    const promotionCandidate = input.couponCode
      ? await prisma.promotion.findFirst({
          where: { code: input.couponCode.trim().toUpperCase(), active: true },
        })
      : null;
    const now = new Date();
    const promotion =
      promotionCandidate &&
      (!promotionCandidate.startsAt || promotionCandidate.startsAt <= now) &&
      (!promotionCandidate.endsAt || promotionCandidate.endsAt >= now) &&
      (promotionCandidate.usageLimit === null ||
        promotionCandidate.usedCount < promotionCandidate.usageLimit)
        ? promotionCandidate
        : null;
    if (input.couponCode?.trim() && !promotion)
      return { success: false, error: "كود الخصم غير صالح أو انتهت صلاحيته." };
    const eligibleItems = promotion
      ? dbItemsToCreate.filter((item) => {
          if (promotion.scope === "order") return true;
          if (promotion.scope === "category")
            return item.category === promotion.targetValue;
          if (promotion.scope === "product")
            return item.productId === promotion.targetValue;
          if (promotion.scope === "color")
            return item.color === promotion.targetValue;
          if (promotion.scope === "material")
            return item.material === promotion.targetValue;
          return false;
        })
      : [];
    const promotionBase = eligibleItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const meetsMinimum =
      !promotion?.minimumOrderValue ||
      subtotal >= Number(promotion.minimumOrderValue);
    if (promotion && !meetsMinimum)
      return {
        success: false,
        error: `الحد الأدنى لاستخدام الكود هو ${Number(promotion.minimumOrderValue)} ج.م.`,
      };
    if (promotion && promotion.type !== "free_shipping" && promotionBase <= 0)
      return {
        success: false,
        error: "كود الخصم لا ينطبق على المنتجات الموجودة في السلة.",
      };
    let discountAmount = 0;
    if (promotion && meetsMinimum) {
      if (promotion.type === "percentage")
        discountAmount = promotionBase * (Number(promotion.value) / 100);
      if (promotion.type === "fixed") discountAmount = Number(promotion.value);
      if (promotion.type === "free_shipping") shippingCost = 0;
      discountAmount = Math.min(discountAmount, promotionBase);
    }
    const totalPrice = Math.max(0, subtotal - discountAmount + shippingCost);

    // Generate a collision-resistant public reference without relying on a race-prone row count.
    const orderNumber = `DR-${randomUUID().slice(0, 8).toUpperCase()}`;

    // 5. Database transaction (create order + deduct stock)
    const order = await prisma.$transaction(async (tx) => {
      if (promotion) {
        const promotionUse = await tx.promotion.updateMany({
          where: {
            id: promotion.id,
            active: true,
            AND: [
              { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
              { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
              {
                OR: [
                  { usageLimit: null },
                  { usedCount: { lt: promotion.usageLimit ?? 0 } },
                ],
              },
            ],
          },
          data: { usedCount: { increment: 1 } },
        });
        if (promotionUse.count !== 1)
          throw new Error("Promotion is no longer available.");
      }

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerPhone2: input.customerPhone2 || null,
          governorate: input.governorate,
          city: input.city,
          address: input.address,
          notes: input.notes || null,
          subtotalPrice: subtotal,
          discountAmount,
          manual: false,
          paymentMethod: "cod",
          shippingCost,
          totalPrice,
          items: {
            create: dbItemsToCreate.map(
              ({ category, material, ...item }) => item,
            ),
          },
        },
      });

      // Reserve stock atomically so simultaneous checkouts cannot oversell.
      for (const item of input.items) {
        const reserved = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (reserved.count !== 1)
          throw new Error("Stock changed while the order was being placed.");
        await consumeInventoryLots(tx, item.variantId, item.quantity);
      }

      return newOrder;
    });

    // 6. Send notification email to admin using Resend.
    // Email is an optional side effect and must never prevent an order from
    // being created when the Resend key is not configured on a deployment.
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const itemsHtml = dbItemsToCreate
          .map(
            (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.color}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.size}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">${item.price * item.quantity} ج.م</td>
        </tr>
      `,
          )
          .join("");

        const emailHtml = `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #942E3A; border-bottom: 2px solid #942E3A; padding-bottom: 10px;">طلب جديد رقم ${orderNumber} ✨</h2>

          <h3 style="color: #333;">بيانات العميل:</h3>
          <p><strong>الاسم:</strong> ${input.customerName}</p>
          <p><strong>رقم الهاتف 1:</strong> ${input.customerPhone}</p>
          ${input.customerPhone2 ? `<p><strong>رقم الهاتف 2:</strong> ${input.customerPhone2}</p>` : ""}
          <p><strong>المحافظة:</strong> ${input.governorate}</p>
          <p><strong>المدينة/المنطقة:</strong> ${input.city}</p>
          <p><strong>العنوان بالتفصيل:</strong> ${input.address}</p>
          ${input.notes ? `<p><strong>ملاحظات العميل:</strong> ${input.notes}</p>` : ""}

          <h3 style="color: #333; margin-top: 30px;">تفاصيل الطلب:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f8f8f8;">
                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">المنتج</th>
                <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">اللون</th>
                <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">المقاس</th>
                <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">الكمية</th>
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">السعر</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 20px; text-align: left; padding: 15px; background-color: #f2d4d7; border-radius: 8px;">
            <p style="margin: 5px 0;"><strong>الإجمالي الفرعي:</strong> ${subtotal} ج.م</p>
            <p style="margin: 5px 0;"><strong>تكلفة الشحن (${input.governorate}):</strong> ${shippingCost} ج.م</p>
            <h3 style="margin: 10px 0 0 0; color: #942E3A;"><strong>الإجمالي الكلي:</strong> ${totalPrice} ج.م</h3>
          </div>

          <div style="margin-top: 30px; font-size: 11px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 15px;">
            هذا البريد مرسل تلقائياً من متجر DeRoma Shoes.
          </div>
        </div>
      `;

        await resend.emails.send({
          from:
            process.env.RESEND_FROM_EMAIL ||
            "DeRoma Store <onboarding@resend.dev>",
          to: process.env.ADMIN_ALERT_EMAIL || "elboraey.jop@gmail.com",
          subject: `طلب جديد في المتجر! #${orderNumber}`,
          html: emailHtml,
        });
      } catch (emailErr) {
        // Log error but don't fail the order if only the email fails.
        console.error("Failed to send alert email via Resend:", emailErr);
      }
    } else {
      console.warn(
        "RESEND_API_KEY is not configured; skipping order email notification.",
      );
    }

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalPrice,
      shippingCost,
      discountAmount,
    };
  } catch (dbErr) {
    console.error("Database checkout error:", dbErr);
    return {
      success: false,
      error:
        "حدث خطأ أثناء معالجة الطلب في قاعدة البيانات، الرجاء المحاولة مرة أخرى.",
    };
  }
}
