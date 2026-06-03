import { useState, useCallback } from 'react';
import { translations, type TranslationKey } from '../i18n/translations';
import type { Language } from '@shared/types';

export function useLanguage() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('rh-lang');
    if (saved === 'en' || saved === 'es') return saved;
    return navigator.language.startsWith('es') ? 'es' : 'en';
  });

  const t = useCallback((key: TranslationKey): string => {
    return translations[lang][key] || key;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'en' ? 'es' : 'en';
      localStorage.setItem('rh-lang', next);
      return next;
    });
  }, []);

  return { lang, t, toggleLang };
}
