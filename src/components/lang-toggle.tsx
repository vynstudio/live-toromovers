"use client";

import { useLang } from "./lang-provider";

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`lang-pill${lang === "en" ? " active" : ""}`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <span className="lang-dot" aria-hidden>·</span>
      <button
        type="button"
        onClick={() => setLang("es")}
        className={`lang-pill${lang === "es" ? " active" : ""}`}
        aria-pressed={lang === "es"}
      >
        ES
      </button>
    </div>
  );
}
