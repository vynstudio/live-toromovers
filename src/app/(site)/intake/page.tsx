import { redirect } from "next/navigation";

/** Legacy path — canonical form lives at /movingday-checklist */
export default function IntakeRedirectPage() {
  redirect("/movingday-checklist");
}
