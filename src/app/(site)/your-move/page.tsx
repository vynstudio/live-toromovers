import { redirect } from "next/navigation";

/** Legacy path → moving day checklist */
export default function YourMoveRedirectPage() {
  redirect("/move-day-checklist");
}
