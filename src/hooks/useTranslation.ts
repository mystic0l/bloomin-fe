import { useStore } from '../store';
import { translations } from '../i18n/translations';

export const useTranslation = () => {
  const language = useStore((state) => state.language);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  return { t, language };
};
