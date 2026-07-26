/**
 * Minimal Square REST helpers (no SDK — avoids BigInt/serialization issues).
 * Uses CreatePaymentLink (Quick Pay) for deposits.
 */

import {
  depositCents,
  squareAccessToken,
  squareBaseUrl,
  squareLocationId,
} from "./config";

const SQUARE_VERSION = "2025-01-23";

export type CreateDepositLinkInput = {
  reservationId: string;
  name: string;
  email?: string;
  phoneE164?: string;
  redirectUrl: string;
  serviceLabel?: string;
};

export type CreateDepositLinkResult =
  | {
      ok: true;
      paymentLinkId: string;
      orderId: string;
      url: string;
      amountCents: number;
    }
  | { ok: false; error: string; status?: number };

async function squareFetch(
  path: string,
  init: RequestInit & { method?: string } = {},
): Promise<Response> {
  const token = squareAccessToken();
  if (!token) throw new Error("SQUARE_ACCESS_TOKEN missing");
  return fetch(`${squareBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Square-Version": SQUARE_VERSION,
      ...(init.headers || {}),
    },
  });
}

export async function createDepositPaymentLink(
  input: CreateDepositLinkInput,
): Promise<CreateDepositLinkResult> {
  const locationId = squareLocationId();
  if (!locationId) {
    return { ok: false, error: "SQUARE_LOCATION_ID missing" };
  }
  if (!squareAccessToken()) {
    return { ok: false, error: "SQUARE_ACCESS_TOKEN missing" };
  }

  const amount = depositCents();
  const itemName = input.serviceLabel
    ? `Toro Movers deposit — ${input.serviceLabel}`
    : "Toro Movers — move deposit";

  const body: Record<string, unknown> = {
    idempotency_key: `deposit-${input.reservationId}`,
    quick_pay: {
      name: itemName.slice(0, 120),
      price_money: {
        amount,
        currency: "USD",
      },
      location_id: locationId,
    },
    checkout_options: {
      redirect_url: input.redirectUrl,
      ask_for_shipping_address: false,
      accepted_payment_methods: {
        apple_pay: true,
        google_pay: true,
        cash_app_pay: true,
      },
    },
    payment_note: `Toro deposit rid=${input.reservationId} ${input.name}`.slice(
      0,
      500,
    ),
  };

  const pre: Record<string, string> = {};
  if (input.email) pre.buyer_email = input.email;
  if (input.phoneE164) pre.buyer_phone_number = input.phoneE164;
  if (Object.keys(pre).length) body.pre_populated_data = pre;

  try {
    const res = await squareFetch("/v2/online-checkout/payment-links", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as {
      payment_link?: {
        id?: string;
        order_id?: string;
        url?: string;
      };
      errors?: { detail?: string; code?: string }[];
    };

    if (!res.ok || !json.payment_link?.url) {
      const detail =
        json.errors?.map((e) => e.detail || e.code).filter(Boolean).join("; ") ||
        `HTTP ${res.status}`;
      console.error("[square] createPaymentLink failed:", detail, json);
      return { ok: false, error: detail, status: res.status };
    }

    return {
      ok: true,
      paymentLinkId: json.payment_link.id || "",
      orderId: json.payment_link.order_id || "",
      url: json.payment_link.url,
      amountCents: amount,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "network_error";
    console.error("[square] createPaymentLink error:", msg);
    return { ok: false, error: msg };
  }
}

/** True if the Square order looks paid (has tenders / OPEN+). */
export async function isOrderPaid(orderId: string): Promise<boolean> {
  if (!orderId || !squareAccessToken()) return false;
  try {
    const res = await squareFetch(`/v2/orders/${encodeURIComponent(orderId)}`);
    if (!res.ok) return false;
    const json = (await res.json()) as {
      order?: {
        state?: string;
        tenders?: unknown[];
        net_amounts?: { total_money?: { amount?: number } };
      };
    };
    const order = json.order;
    if (!order) return false;
    if (Array.isArray(order.tenders) && order.tenders.length > 0) return true;
    // Paid checkout orders leave DRAFT → OPEN
    if (order.state === "OPEN" || order.state === "COMPLETED") return true;
    return false;
  } catch {
    return false;
  }
}
