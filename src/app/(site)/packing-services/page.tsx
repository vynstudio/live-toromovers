import { redirect } from "next/navigation";

/** Legacy URL → full-service. */
export default function PackingServicesRedirect() {
  redirect("/full-service-moving");
}
