import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal, items = [] } = body;

    const cleanCode = String(code || "").trim().toUpperCase();
    if (!cleanCode) {
      return NextResponse.json({ valid: false, error: "Please enter a promo code." }, { status: 400 });
    }

    const promotion = await prisma.promotion.findFirst({
      where: { code: cleanCode, active: true },
    });

    if (!promotion) {
      return NextResponse.json({ valid: false, error: "Invalid promo code." }, { status: 404 });
    }

    const now = new Date();
    if (promotion.startsAt && promotion.startsAt > now) {
      return NextResponse.json({ valid: false, error: "This promo code is not active yet." }, { status: 400 });
    }
    if (promotion.endsAt && promotion.endsAt < now) {
      return NextResponse.json({ valid: false, error: "This promo code has expired." }, { status: 400 });
    }
    if (promotion.usageLimit !== null && promotion.usedCount >= promotion.usageLimit) {
      return NextResponse.json({ valid: false, error: "This promo code has reached its usage limit." }, { status: 400 });
    }

    const numSubtotal = Number(subtotal || 0);
    const minOrderVal = promotion.minimumOrderValue ? Number(promotion.minimumOrderValue) : 0;
    if (minOrderVal > 0 && numSubtotal < minOrderVal) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order value for code ${cleanCode} is ${minOrderVal} EGP. Add ${minOrderVal - numSubtotal} EGP more to apply.`,
      }, { status: 400 });
    }

    // Filter eligible items
    const eligibleItems = (Array.isArray(items) ? items : []).filter((item: any) => {
      if (promotion.scope === "order") return true;
      if (promotion.scope === "category") return item.category === promotion.targetValue;
      if (promotion.scope === "product") return item.productId === promotion.targetValue;
      if (promotion.scope === "color") return item.color === promotion.targetValue;
      if (promotion.scope === "material") return item.material === promotion.targetValue;
      return true;
    });

    const promotionBase = eligibleItems.length > 0
      ? eligibleItems.reduce((sum: number, item: any) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0)
      : numSubtotal;

    let discountAmount = 0;
    let isFreeShipping = false;

    if (promotion.type === "percentage") {
      discountAmount = promotionBase * (Number(promotion.value) / 100);
    } else if (promotion.type === "fixed") {
      discountAmount = Number(promotion.value);
    } else if (promotion.type === "free_shipping") {
      isFreeShipping = true;
    }

    discountAmount = Math.min(discountAmount, promotionBase);

    return NextResponse.json({
      valid: true,
      code: promotion.code,
      name: promotion.name,
      type: promotion.type,
      value: Number(promotion.value),
      discountAmount,
      isFreeShipping,
      message: promotion.type === "free_shipping"
        ? `Free shipping promo code ${promotion.code} applied!`
        : `Promo code ${promotion.code} applied! (-${discountAmount} EGP)`,
    });
  } catch (error) {
    console.error("Error validating promotion:", error);
    return NextResponse.json({ valid: false, error: "Unable to validate promo code." }, { status: 500 });
  }
}
