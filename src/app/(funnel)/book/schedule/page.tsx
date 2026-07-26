import { permanentRedirect } from "next/navigation";

/**
 * Legacy custom post-deposit schedule page.
 * Booking is now the official Square Appointments embed on /book.
 */
export default function BookScheduleRedirect() {
  permanentRedirect("/book");
}
