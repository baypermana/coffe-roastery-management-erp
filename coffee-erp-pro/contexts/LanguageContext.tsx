
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: { [key: string]: string | number }) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const interpolate = (str: string, params: { [key: string]: string | number }): string => {
  let result = str;
  for (const key in params) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(params[key]));
  }
  return result;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang === 'en' || savedLang === 'id') ? savedLang : 'id';
  });

  const [translations, setTranslations] = useState<{ [key: string]: any } | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        // Use absolute paths with fetch for robust file loading
        const [enResponse, idResponse] = await Promise.all([
          fetch('/locales/en.json'),
          fetch('/locales/id.json')
        ]);
        if (!enResponse.ok || !idResponse.ok) {
            throw new Error('Failed to fetch translation files');
        }
        const enData = await enResponse.json();
        const idData = await idResponse.json();
        setTranslations({ en: enData, id: idData });
      } catch (error) {
        console.error("Failed to load translation files:", error);
      }
    };
    
    fetchTranslations();
  }, []);


  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = useCallback((key: string, params?: { [key: string]: string | number }): string => {
    if (!translations) {
      return key; // Return key while translations are loading
    }
    
    const keys = key.split('.');
    let result = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        let fallbackResult = translations['en'];
        for (const fk of keys) {
             fallbackResult = fallbackResult?.[fk];
        }
        if(typeof fallbackResult === 'string') {
            const finalFallback = params ? interpolate(fallbackResult, params) : fallbackResult;
            return finalFallback;
        }
        return key;
      }
    }
    
    if (typeof result !== 'string') {
        return key;
    }
    
    const finalResult = params ? interpolate(result, params) : result;
    return finalResult;
  }, [language, translations]);

  // Prevent rendering children until translations are loaded to avoid UI flicker
  if (!translations) {
    return null; // Or return a loading spinner component
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
