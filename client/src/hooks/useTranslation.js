import { useLanguageStore } from "../store/languageStore";
import { translations } from "../utils/translations";

export function useTranslation() {
  const { language, toggleLanguage } = useLanguageStore();
  const t = (key) => translations[language][key] || key;
  return { t, language, toggleLanguage };
}
