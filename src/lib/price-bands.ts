// Lead-form option labels only — NO rates, NO hour estimates.
// Pricing and time are quoted by the owner on the call (never on-site).

export type ServiceKind = "full-service" | "labor" | "not-sure";
export type HomeSize = "studio-1br" | "2br" | "3br+" | "office" | "";

export const HOME_SIZE_LABELS: Record<Exclude<HomeSize, "">, string> = {
  "studio-1br": "Studio / 1BR",
  "2br": "2 bedrooms",
  "3br+": "3+ bedrooms",
  office: "Office / storage",
};

export const SERVICE_LABELS: Record<ServiceKind, string> = {
  "full-service": "Full-service (truck + crew)",
  labor: "Labor-only (you have a truck)",
  "not-sure": "Not sure yet",
};
