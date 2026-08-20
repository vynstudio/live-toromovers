/**
 * Toro Movers contact numbers.
 *
 * Public / callback (website, click-to-call, JSON-LD, customer-facing copy):
 *   (321) 758-0094
 *
 * OpenPhone outbound confirmation SMS sender (until 321 SMS is tested + approved):
 *   (689) 600-2720  →  OPENPHONE_FROM_NUMBER=+16896002720
 *
 * Do not use the OpenPhone sender as the public number.
 * Do not set OPENPHONE_FROM_NUMBER to +13217580094 until SMS send/receive
 * on (321) 758-0094 is confirmed and the migration is approved.
 * Never overwrite customer phones stored on leads.
 */

export const phoneDisplay = "(321) 758-0094";
export const phoneE164 = "+13217580094";
export const phoneTelHref = "tel:+13217580094";
export const phoneSmsHref = "sms:+13217580094";

/** OpenPhone/Quo `from` for automated confirmation SMS. Env must match this. */
export const openPhoneSmsFromE164 = "+16896002720";

/** Sender for OpenPhone Messages API. Never the public (321) number until SMS migration is approved. */
export function resolveOpenPhoneSmsFrom(): string {
  return (
    process.env.OPENPHONE_FROM_NUMBER ||
    process.env.QUO_FROM_NUMBER ||
    openPhoneSmsFromE164
  );
}
