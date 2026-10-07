/**
 * Toro Movers contact numbers.
 *
 * Public / callback (website, click-to-call, JSON-LD, customer-facing copy)
 * and OpenPhone outbound confirmation SMS sender:
 *   (689) 600-2720  →  OPENPHONE_FROM_NUMBER=+16896002720
 *
 * Do not hard-code another business number.
 * Never overwrite customer phones stored on leads.
 */

export const phoneDisplay = "(689) 600-2720";
export const phoneE164 = "+16896002720";
export const phoneTelHref = "tel:+16896002720";
export const phoneSmsHref = "sms:+16896002720";

/** OpenPhone/Quo `from` for automated confirmation SMS. Env must match this. */
export const openPhoneSmsFromE164 = "+16896002720";

/** Sender for OpenPhone Messages API. Same published line as phoneE164. */
export function resolveOpenPhoneSmsFrom(): string {
  return (
    process.env.OPENPHONE_FROM_NUMBER ||
    process.env.QUO_FROM_NUMBER ||
    openPhoneSmsFromE164
  );
}
