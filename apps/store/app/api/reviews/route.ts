import { NextRequest, NextResponse } from "next/server";
import { reviewSchema } from "@/lib/validations";
import { db } from "@/lib/db";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Donnees invalides" },
      { status: 400 },
    );
  }

  const { productId, authorName, authorEmail, rating, comment } = parsed.data;

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  const review = await db.review.create({
    data: {
      productId,
      authorName,
      authorEmail,
      rating,
      comment,
      status: "PENDING",
    },
  });

  return NextResponse.json(
    { id: review.id, message: "Votre avis a ete soumis et sera visible apres moderation." },
    { status: 201 },
  );
}
