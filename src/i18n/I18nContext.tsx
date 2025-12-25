/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, type ReactNode } from 'react';

// Import translation files
import en from './en.json';

// Type for the translation object
type Translations = typeof en;
type Language = 'en' | 'fr' | 'de' | 'es' | 'it';

// Map of available languages
const resources: Record<Language, Translations> = {
    en: en,
    // Add others as they are implemented. Fallback to EN for now.
    fr: en,
    de: en,
    es: en,
    it: en
};

interface I18nContextType {
    t: (key: string) => string;
    language: Language;
    setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Try to load from localStorage or default to 'en'
    const savedLang = localStorage.getItem('hyper-shards-lang') as Language;
    const [language, setLanguageState] = useState<Language>(savedLang || 'en');

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('hyper-shards-lang', lang);
    };

    // Helper to get nested keys via string "menu.start"
    const t = (key: string): string => {
        const keys = key.split('.');
        let current: Translations | string = resources[language];

        for (const k of keys) {
            if (typeof current === 'string') {
                return current;
            }
            if ((current as Record<string, unknown>)[k] === undefined) {
                // Fallback to English if missing in current language
                let fallback: Translations | string = resources['en'];
                for (const fallbackK of keys) {
                    if (typeof fallback === 'string') break;
                    fallback = (fallback as Record<string, unknown>)[fallbackK] as Translations | string;
                }
                return typeof fallback === 'string' ? fallback : key;
            }
            current = (current as Record<string, unknown>)[k] as Translations | string;
        }

        return typeof current === 'string' ? current : key;
    };

    return (
        <I18nContext.Provider value={{ t, language, setLanguage }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
};
