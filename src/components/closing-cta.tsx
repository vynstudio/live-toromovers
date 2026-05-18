"use client";

import { useLang } from "./lang-provider";
import { RequestButton } from "./request-button";
import { PHONE_TEL } from "@/lib/contact";

export function ClosingCta() {
  const { t } = useLang();
  return (
    <section className="block closing">
      <div className="block-inner">
        <div className="block-eyebrow">{t.closing.eyebrow}</div>
        <h2 className="block-h2">
          {t.closing.head} <em>{t.closing.headItalic}</em>
        </h2>
        <p className="block-sub">{t.closing.sub}</p>

        <div className="closing-cta-row">
          <RequestButton label={t.closing.primary} />
          <a href={PHONE_TEL} className="btn btn-outline">
            {t.closing.secondary}
          </a>
        </div>
      </div>
    </section>
  );
}
