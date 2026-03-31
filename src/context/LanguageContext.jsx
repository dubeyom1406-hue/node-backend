import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('rupiksha_lang') || 'en');

    useEffect(() => {
        localStorage.setItem('rupiksha_lang', language);
    }, [language]);

    const t = (key) => {
        if (!translations[language]) return key;
        return translations[language][key] || key;
    };

    const toggleLanguage = (lang) => {
        if (lang === 'en' || lang === 'hi') {
            setLanguage(lang);
        } else {
            setLanguage(prev => prev === 'en' ? 'hi' : 'en');
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
