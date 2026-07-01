import { NextRequest, NextResponse } from "next/server";
import { newsletterSchema } from "@/lib/validations";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const { email } = parsed.data;
  const provider = process.env["NEWSLETTER_PROVIDER"];
  const apiKey = process.env["NEWSLETTER_API_KEY"];
  const listId = process.env["NEWSLETTER_LIST_ID"];

  if (!provider || !apiKey || !listId) {
    return NextResponse.json(
      { message: "Newsletter non configuree" },
      { status: 200 },
    );
  }

  try {
    if (provider === "brevo") {
      await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          listIds: [parseInt(listId, 10)],
          updateEnabled: true,
        }),
      });
    } else if (provider === "mailchimp") {
      const dataCenter = apiKey.split("-")[1];
      await fetch(
        `https://${dataCenter}.api.mailchimp.com/3.0/lists/${listId}/members`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email_address: email, status: "subscribed" }),
        },
      );
    }

    return NextResponse.json(
      { message: "Inscription reussie" },
      { status: 200 },
    );
  } catch (err) {
    console.error("Newsletter subscription error:", err);
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }
}
