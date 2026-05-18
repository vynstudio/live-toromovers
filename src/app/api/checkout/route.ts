import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Stripe is not configured. Set STRIPE_SECRET_KEY in environment to enable checkout.",
      },
      { status: 501 },
    );
  }

  // Wire actual Stripe Checkout session creation here when the key is added.
  // const stripe = new Stripe(secret);
  // const session = await stripe.checkout.sessions.create({ ... });
  // return NextResponse.json({ url: session.url });

  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ ok: true, received: body });
}
