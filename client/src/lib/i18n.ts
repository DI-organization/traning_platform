import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "@/locales/en/common.json";
import enNav from "@/locales/en/nav.json";
import enAuth from "@/locales/en/auth.json";
import enDashboard from "@/locales/en/dashboard.json";
import enTrainees from "@/locales/en/trainees.json";
import enProgram from "@/locales/en/program.json";
import enTasks from "@/locales/en/tasks.json";
import enSubmissions from "@/locales/en/submissions.json";
import enResources from "@/locales/en/resources.json";
import enAnalytics from "@/locales/en/analytics.json";
import enSettings from "@/locales/en/settings.json";
import enProfile from "@/locales/en/profile.json";
import enFeedback from "@/locales/en/feedback.json";

import arCommon from "@/locales/ar/common.json";
import arNav from "@/locales/ar/nav.json";
import arAuth from "@/locales/ar/auth.json";
import arDashboard from "@/locales/ar/dashboard.json";
import arTrainees from "@/locales/ar/trainees.json";
import arProgram from "@/locales/ar/program.json";
import arTasks from "@/locales/ar/tasks.json";
import arSubmissions from "@/locales/ar/submissions.json";
import arResources from "@/locales/ar/resources.json";
import arAnalytics from "@/locales/ar/analytics.json";
import arSettings from "@/locales/ar/settings.json";
import arProfile from "@/locales/ar/profile.json";
import arFeedback from "@/locales/ar/feedback.json";

export const supportedLanguages = ["en", "ar"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const namespaces = [
  "common",
  "nav",
  "auth",
  "dashboard",
  "trainees",
  "program",
  "tasks",
  "submissions",
  "resources",
  "analytics",
  "settings",
  "profile",
  "feedback",
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        nav: enNav,
        auth: enAuth,
        dashboard: enDashboard,
        trainees: enTrainees,
        program: enProgram,
        tasks: enTasks,
        submissions: enSubmissions,
        resources: enResources,
        analytics: enAnalytics,
        settings: enSettings,
        profile: enProfile,
        feedback: enFeedback,
      },
      ar: {
        common: arCommon,
        nav: arNav,
        auth: arAuth,
        dashboard: arDashboard,
        trainees: arTrainees,
        program: arProgram,
        tasks: arTasks,
        submissions: arSubmissions,
        resources: arResources,
        analytics: arAnalytics,
        settings: arSettings,
        profile: arProfile,
        feedback: arFeedback,
      },
    },
    fallbackLng: "en",
    supportedLngs: supportedLanguages as unknown as string[],
    defaultNS: "common",
    ns: namespaces as unknown as string[],
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
