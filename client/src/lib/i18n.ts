import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "@/locales/en/common.json";
import enNav from "@/locales/en/nav.json";
import enAuth from "@/locales/en/auth.json";
import arCommon from "@/locales/ar/common.json";
import arNav from "@/locales/ar/nav.json";
import arAuth from "@/locales/ar/auth.json";

export const supportedLanguages = ["en", "ar"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, nav: enNav, auth: enAuth },
      ar: { common: arCommon, nav: arNav, auth: arAuth },
    },
    fallbackLng: "en",
    supportedLngs: supportedLanguages as unknown as string[],
    defaultNS: "common",
    ns: ["common", "nav", "auth"],
    interpolation: { escapeValue: false },
    detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
  });

export function applyDocumentDirection(lang: string) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

i18n.on("languageChanged", applyDocumentDirection);
applyDocumentDirection(i18n.language ?? "en");

export default i18n;
