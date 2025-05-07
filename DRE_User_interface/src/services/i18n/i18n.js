import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import I18NextHttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n
  .use(I18NextHttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: `/locales/{{lng}}/{{ns}}.json?v=${new Date().getTime()}`, // Prevents caching
    },
    fallbackLng: "en",
 
    interpolation: {
      escapeValue: false,
    },
    cache: {
      enabled: false, // Disable caching
    }
    // ,
    // detection: {
    //   order: ["queryString", "cookie"],
    //   cache: ["cookie"],
    // },
  });

export default i18n;

 