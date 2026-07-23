import { permanentRedirect } from "next/navigation";

/**
 * Legacy paid /get-quote wizard → canonical sales funnel.
 * next.config also redirects; this page is a belt-and-suspenders fallback.
 */
export default function GetQuotePage() {
  permanentRedirect("/get-my-price");
}
