"use server";

import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { consumeInventoryLots } from "@/lib/inventoryLots";
import { formatOrderNumber } from "@/lib/orderNumber";
import {
  calculateShippingFee,
  ShippingSettingsData,
  ShippingZoneData,
} from "@/lib/shippingHelper";
import { getCustomerSession } from "@/lib/userAuth";
import {
  getGoogleEnhancedConversionData,
  sendMetaServerEvent,
} from "@/lib/serverAnalytics";

import { checkRateLimit, sanitizeInput } from "@/lib/rateLimit";

interface CheckoutItemInput {
  productId: string;
  variantId: string;
  quantity: number;
}

interface CreateOrderInput {
  customerFirstName?: string;
  customerLastName?: string;
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
    const cleanPhone = (input.customerPhone || "").replace(/[\s\-\+]/g, "").replace(/^20/, "");
    const cleanPhone2 = input.customerPhone2 ? input.customerPhone2.replace(/[\s\-\+]/g, "").replace(/^20/, "") : null;
    const egPhoneRegex = /^01[0125]\d{8}$/;

    // Rate Limiting (max 5 orders per phone per 10 minutes)
    const rateCheck = checkRateLimit(`order_${cleanPhone}`, 5, 600);
    if (!rateCheck.success) {
      return { success: false, error: "تم إرسال عدد كبير من الطلبات بنفس الرقم. الرجاء الانتظار قليلاً وتكرار المحاولة." };
    }

    const cleanFirstName = sanitizeInput((input.customerFirstName || input.customerName.split(" ")[0] || "").trim());
    const cleanLastName = sanitizeInput((input.customerLastName || input.customerName.split(" ").slice(1).join(" ") || "").trim());


    if (!cleanFirstName || cleanFirstName.length < 2) {
      return { success: false, error: "الاسم الأول يجب أن يتكون من حرفين على الأقل." };
    }
    if (!cleanLastName || cleanLastName.length < 2) {
      return { success: false, error: "الاسم الثاني يجب أن يتكون من حرفين على الأقل." };
    }
    if (!egPhoneRegex.test(cleanPhone)) {
      return { success: false, error: "رقم الهاتف الرئيسي يجب أن يكون رقم مصري صحيح مكون من 11 رقم (مثال: 01012345678)." };
    }
    if (cleanPhone2 && !egPhoneRegex.test(cleanPhone2)) {
      return { success: false, error: "رقم الهاتف البديل يجب أن يكون رقم مصري صحيح مكون من 11 رقم (مثال: 01112345678)." };
    }
    if (!input.governorate || !input.city) {
      return { success: false, error: "الرجاء اختيار المحافظة والمدينة." };
    }
    if (!input.address || input.address.trim().length < 5) {
      return { success: false, error: "العنوان التفصيلي يجب أن يتكون من 5 أحرف على الأقل." };
    }
    if (input.items.length === 0) {
      return { success: false, error: "حقيبة التسوق فارغة." };
    }

    // 2. Resolve shipping zones and settings from admin
    const [allZones, shippingSettings] = await Promise.all([
      prisma.shippingZone.findMany({
        where: { active: true },
        include: { exceptions: true },
      }),
      prisma.shippingSettings.findUnique({ where: { id: "default" } }),
    ]);

    const formattedZones: ShippingZoneData[] = allZones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      governorates: zone.governorates,
      fee: Number(zone.fee),
      freeShippingThreshold: zone.freeShippingThreshold
        ? Number(zone.freeShippingThreshold)
        : null,
      exceptions: zone.exceptions.map((e) => ({ city: e.city, fee: Number(e.fee) })),
    }));

    const formattedSettings: ShippingSettingsData = shippingSettings
      ? {
          freeShippingEnabled: shippingSettings.freeShippingEnabled,
          freeShippingThreshold: shippingSettings.freeShippingThreshold
            ? Number(shippingSettings.freeShippingThreshold)
            : null,
        }
      : null;

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

    let shippingCost = calculateShippingFee({
      governorate: input.governorate,
      city: input.city,
      subtotal,
      zones: formattedZones,
      settings: formattedSettings,
    });

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
    if (shippingSettings?.freeShippingEnabled && shippingSettings.freeShippingThreshold !== null && subtotal >= Number(shippingSettings.freeShippingThreshold)) shippingCost = 0;
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
        error: `الحد الأدنى لاستخدام الكود هو EGP ${Number(promotion.minimumOrderValue)}.`,
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

    const customerSession = await getCustomerSession();
    const requestHeaders = await headers();
    const requestCookies = await cookies();
    const forwardedFor = requestHeaders.get("x-forwarded-for");
    const clientIpAddress =
      forwardedFor?.split(",")[0]?.trim() ||
      requestHeaders.get("x-real-ip") ||
      null;
    const clientUserAgent = requestHeaders.get("user-agent");

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

      const firstName = input.customerFirstName || input.customerName.split(" ")[0] || "";
      const lastName = input.customerLastName || input.customerName.split(" ").slice(1).join(" ") || "";
      const fullCustomerName = `${firstName} ${lastName}`.trim() || input.customerName;

      await tx.customer.upsert({
        where: { phone: input.customerPhone },
        create: {
          firstName,
          lastName,
          name: fullCustomerName,
          phone: input.customerPhone,
          email: customerSession?.email || null,
          phone2: input.customerPhone2 || null,
          governorate: input.governorate,
          city: input.city,
          address: input.address,
        },
        update: {
          firstName,
          lastName,
          name: fullCustomerName,
          email: customerSession?.email || undefined,
          phone2: input.customerPhone2 || null,
          governorate: input.governorate,
          city: input.city,
          address: input.address,
        },
      });

      // Reserve a database-backed sequence value, then format the public number.
      const newOrder = await tx.order.create({
        data: {
          orderNumber: `DR-PENDING-${randomUUID()}`,
          userId: customerSession?.sub || null,
          customerFirstName: firstName,
          customerLastName: lastName,
          customerName: fullCustomerName,
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

      await tx.order.update({
        where: { id: newOrder.id },
        data: { orderNumber: formatOrderNumber(newOrder.orderSequence) },
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

      return { ...newOrder, orderNumber: formatOrderNumber(newOrder.orderSequence) };
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
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">EGP ${item.price * item.quantity}</td>
        </tr>
      `,
          )
          .join("");

        const emailHtml = `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #942E3A; border-bottom: 2px solid #942E3A; padding-bottom: 10px;">طلب جديد رقم ${order.orderNumber} ✨</h2>

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
            <p style="margin: 5px 0;"><strong>الإجمالي الفرعي:</strong> EGP ${subtotal}</p>
            <p style="margin: 5px 0;"><strong>تكلفة الشحن (${input.governorate}):</strong> EGP ${shippingCost}</p>
            <h3 style="margin: 10px 0 0 0; color: #942E3A;"><strong>الإجمالي الكلي:</strong> EGP ${totalPrice}</h3>
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
          subject: `طلب جديد في المتجر! #${order.orderNumber}`,
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

    const eventId = order.orderNumber;
    const enhancedConversionData = getGoogleEnhancedConversionData({
      email: customerSession?.email,
      phone: cleanPhone,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      city: input.city,
      state: input.governorate,
      country: "EG",
    });

    await sendMetaServerEvent({
      eventName: "Purchase",
      eventId,
      eventSourceUrl: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://deromastore.com"}/checkout/success`,
      value: totalPrice,
      orderNumber: order.orderNumber,
      items: dbItemsToCreate.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      customer: {
        email: customerSession?.email,
        phone: cleanPhone,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        city: input.city,
        state: input.governorate,
        country: "eg",
        clientIpAddress,
        clientUserAgent,
        fbp: requestCookies.get("_fbp")?.value,
        fbc: requestCookies.get("_fbc")?.value,
      },
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      eventId,
      enhancedConversionData,
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

export async function submitContactMessageAction(input: {
  name: string;
  phone: string;
  message: string;
}) {
  try {
    const cleanPhone = (input.phone || "").trim();
    const rateCheck = checkRateLimit(`contact_${cleanPhone}`, 3, 300);
    if (!rateCheck.success) {
      return { success: false, error: "Too many messages sent. Please wait a few minutes before trying again." };
    }

    const cleanName = sanitizeInput((input.name || "").trim());
    const cleanMessage = sanitizeInput((input.message || "").trim());

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: "Please enter a valid name (at least 2 characters)." };
    }
    if (!cleanPhone || cleanPhone.length < 6) {
      return { success: false, error: "Please enter a valid phone number." };
    }
    if (!cleanMessage || cleanMessage.length < 3) {
      return { success: false, error: "Please enter your message text." };
    }

    const messageRecord = await (prisma as any).contactMessage.create({
      data: {
        name: cleanName,
        phone: cleanPhone,
        message: cleanMessage,
        status: "unread",
      },
    });


    return { success: true, messageId: messageRecord.id };
  } catch (error) {
    console.error("Error submitting contact message:", error);
    return {
      success: false,
      error: "An error occurred while submitting your message. Please try again later.",
    };
  }
}
