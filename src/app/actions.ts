"use server";

import prisma from "@/lib/prisma";
import { Resend } from "resend";

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
  items: CheckoutItemInput[];
}

// Governorate Shipping Fees mapping
const SHIPPING_FEES: Record<string, number> = {
  "القاهرة": 50,
  "الجيزة": 50,
  "الإسكندرية": 60,
  "القليوبية": 70,
  "الشرقية": 70,
  "الدقهلية": 70,
  "المنوفية": 70,
  "الغربية": 70,
  "كفر الشيخ": 70,
  "دمياط": 70,
  "بورسعيد": 70,
  "الإسماعيلية": 70,
  "السويس": 70,
  "الفيوم": 90,
  "بني سويف": 90,
  "المنيا": 90,
  "أسيوط": 90,
  "سوهاج": 90,
  "قنا": 90,
  "الأقصر": 90,
  "أسوان": 90,
  "البحر الأحمر": 120,
  "الوادي الجديد": 120,
  "مطروح": 120,
  "شمال سيناء": 120,
  "جنوب سيناء": 120,
};

export async function createOrder(input: CreateOrderInput) {
  try {
    // 1. Validation
    if (!input.customerName || !input.customerPhone || !input.governorate || !input.city || !input.address || input.items.length === 0) {
      return { success: false, error: "الرجاء ملء جميع الحقول المطلوبة وإضافة منتجات للسلة." };
    }

    // 2. Resolve shipping fee
    const shippingCost = SHIPPING_FEES[input.governorate] ?? 70;

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
          error: `عذراً، المقاس المطلوب للحذاء "${variant.product.name}" باللون (${variant.color}) والمقاس (${variant.size}) غير متوفر بالكمية المطلوبة. المتوفر حالياً: ${variant.stock} فقط.`,
        };
      }

      const itemPrice = Number(variant.product.price);
      subtotal += itemPrice * item.quantity;

      dbItemsToCreate.push({
        productId: variant.productId,
        variantId: variant.id,
        productName: variant.product.name,
        size: variant.size,
        color: variant.color,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    const totalPrice = subtotal + shippingCost;

    // 4. Generate order number (DR-1001, etc.)
    const orderCount = await prisma.order.count();
    const orderNumber = `DR-${1000 + orderCount + 1}`;

    // 5. Database transaction (create order + deduct stock)
    const order = await prisma.$transaction(async (tx) => {
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
          shippingCost,
          totalPrice,
          items: {
            create: dbItemsToCreate,
          },
        },
      });

      // Deduct variant stock
      for (const item of input.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
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
      `
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
        from: process.env.RESEND_FROM_EMAIL || "DeRoma Store <onboarding@resend.dev>",
        to: process.env.ADMIN_ALERT_EMAIL || "elboraey.jop@gmail.com",
        subject: `طلب جديد في المتجر! #${orderNumber}`,
        html: emailHtml,
      });
      } catch (emailErr) {
        // Log error but don't fail the order if only the email fails.
        console.error("Failed to send alert email via Resend:", emailErr);
      }
    } else {
      console.warn("RESEND_API_KEY is not configured; skipping order email notification.");
    }

    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (dbErr) {
    console.error("Database checkout error:", dbErr);
    return { success: false, error: "حدث خطأ أثناء معالجة الطلب في قاعدة البيانات، الرجاء المحاولة مرة أخرى." };
  }
}
