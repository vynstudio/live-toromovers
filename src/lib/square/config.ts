/** Square Online Checkout config for Toro Movers deposits. */

export type SquareEnv = "sandbox" | "production";

export function squareEnvironment(): SquareEnv {
  const e = (process.env.SQUARE_ENVIRONMENT || "sandbox").toLowerCase();
  return e === "production" ? "production" : "sandbox";
}

export function squareBaseUrl(): string {
  return squareEnvironment() === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

export function squareAccessToken(): string | null {
  const t = process.env.SQUARE_ACCESS_TOKEN?.trim();
  return t || null;
}

export function squareLocationId(): string | null {
  const id = process.env.SQUARE_LOCATION_ID?.trim();
  return id || null;
}

/** Deposit amount in cents. Default $150. */
export function depositCents(): number {
  const raw = process.env.SQUARE_DEPOSIT_CENTS?.trim();
  const n = raw ? Number(raw) : 15000;
  if (!Number.isFinite(n) || n < 100) return 15000;
  return Math.round(n);
}

export function depositDollarsLabel(): string {
  return `$${(depositCents() / 100).toFixed(nFixed(depositCents()))}`;
}

function nFixed(cents: number) {
  return cents % 100 === 0 ? 0 : 2;
}

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://toromovers.net"
  );
}

export function squareConfigured(): boolean {
  return Boolean(squareAccessToken() && squareLocationId());
}
