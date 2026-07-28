import { redirect } from "next/navigation";

/** Legacy path — keep for old SMS links. */
export default function JobSizeRedirectPage() {
  redirect("/your-move");
}
