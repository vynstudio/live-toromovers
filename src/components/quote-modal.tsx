"use client";

/**
 * Global lead form popup — mirrors toromoveit.com / go.toromovers.net QuoteModal.
 * Open via openQuote(), #quote hash, or any a[href="#quote"] / data-open-quote.
 */

import { useEffect, useState } from "react";
import { GlobalLeadForm } from "./global-lead-form";
import { useLang } from "./lang-provider";
import { QUOTE_EVENT, type QuoteOpenDetail } from "@/lib/open-quote";

export function QuoteModal() {
  const { lang } = useLang();
  const es = lang === "es";
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [defaultService, setDefaultService] = useState("");
  const [source, setSource] = useState("site-modal");

  useEffect(() => {
    const openModal = (detail?: QuoteOpenDetail) => {
      if (detail?.serviceType) setDefaultService(detail.serviceType);
      if (detail?.source) setSource(detail.source);
      setFormKey((k) => k + 1);
      setOpen(true);
      document.documentElement.dataset.quoteOpen = "1";
    };

    const onEvent = (e: Event) => {
      const ce = e as CustomEvent<QuoteOpenDetail>;
      openModal(ce.detail);
    };

    window.addEventListener(QUOTE_EVENT, onEvent);

    if (window.location.hash === "#quote") openModal({ source: "site-hash" });
    const onHash = () => {
      if (window.location.hash === "#quote") openModal({ source: "site-hash" });
    };
    window.addEventListener("hashchange", onHash);

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const a = t?.closest?.(
        'a[href="#quote"], a[href$="#quote"], a[data-open-quote], button[data-open-quote]',
      ) as HTMLElement | null;
      if (!a) return;
      // Allow real /quote navigation only if explicitly data-full-quote
      if (a.getAttribute("data-full-quote") === "1") return;
      e.preventDefault();
      const svc = a.getAttribute("data-service") || undefined;
      const src = a.getAttribute("data-source") || "site-cta";
      openModal({ serviceType: svc, source: src });
    };
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener(QUOTE_EVENT, onEvent);
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick);
      delete document.documentElement.dataset.quoteOpen;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    delete document.documentElement.dataset.quoteOpen;
    if (typeof window !== "undefined" && window.location.hash === "#quote") {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }

  if (!open) return null;

  return (
    <div
      className="quote-modal-root"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-modal-title"
        className="quote-modal-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="quote-modal-handle" aria-hidden>
          <span />
        </div>

        <div className="quote-modal-head">
          <div className="quote-modal-head-text">
            <p className="quote-modal-eyebrow">
              {es ? "Cotización gratis" : "Free quote"}
            </p>
            <h2 id="quote-modal-title">
              {es ? "Pide tu cotización" : "Get your free quote"}
            </h2>
            <p className="quote-modal-sub">
              {es
                ? "Respuesta el mismo día · Sin costos ocultos"
                : "Same-day reply · No hidden fees"}
            </p>
          </div>
          <button
            type="button"
            className="quote-modal-close"
            aria-label={es ? "Cerrar" : "Close"}
            onClick={close}
          >
            ×
          </button>
        </div>

        <div className="quote-modal-body">
          <GlobalLeadForm
            key={formKey}
            idPrefix={`modal-${formKey}`}
            source={source}
            defaultService={defaultService}
          />
        </div>
      </div>
    </div>
  );
}
