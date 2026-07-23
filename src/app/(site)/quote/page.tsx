import { permanentRedirect } from "next/navigation";

/**
 * Legacy /quote wizard → canonical sales funnel.
 * next.config also redirects; this page is a belt-and-suspenders fallback.
 */
export default function QuotePage() {
  permanentRedirect("/get-my-price");
}
