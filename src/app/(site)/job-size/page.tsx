import { redirect } from "next/navigation";

/** Legacy path → moving day checklist */
export default function JobSizeRedirectPage() {
  redirect("/move-day-checklist");
}
