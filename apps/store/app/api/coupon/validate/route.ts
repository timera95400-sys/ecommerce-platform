import { NextRequest, NextResponse } from "next/server";
import { couponValidationSchema } from "@/lib/validations";
import { db } from "@/lib/db";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const parsed = couponValidationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Donnees invalides" },
      { status: 400 },
    );
  }

  const { code, orderTotal } = parsed.data;

  const coupon = await db.coupon.findUnique({ where: { code } });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: "Code promo invalide ou inactif" }, { status: 404 });
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: "Ce code promo a expire" }, { status: 410 });
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json(
      { error: "Ce code promo a atteint sa limite d'utilisations" },
      { status: 410 },
    );
  }

  if (coupon.minOrderAmount !== null && orderTotal < Number(coupon.minOrderAmount)) {
    return NextResponse.json(
      {
        error: `Montant minimum de commande requis : ${Number(coupon.minOrderAmount).toFixed(2)} EUR`,
      },
      { status: 422 },
    );
  }

  let discountAmount =
    coupon.type === "PERCENTAGE"
      ? (orderTotal * Number(coupon.value)) / 100
      : Number(coupon.value);

  discountAmount = Math.min(discountAmount, orderTotal);

  return NextResponse.json(
    {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
    },
    { status: 200 },
  );
}
