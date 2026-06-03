"use client";

import { useEffect, useState } from "react";

export type Lang = "th" | "en";

const KEY = "jjd_lang";
const EVENT = "jjd-lang-change";

export function getLang(): Lang {
  if (typeof window === "undefined") return "th";
  return (localStorage.getItem(KEY) as Lang) ?? "th";
}

export function setLang(lang: Lang) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, lang);
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("th");

  useEffect(() => {
    setLangState(getLang());
    const onChange = () => setLangState(getLang());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return [lang, (l: Lang) => { setLang(l); setLangState(l); }];
}

export function pick<T>(th: T, en: T, lang: Lang): T {
  return lang === "en" ? en : th;
}
