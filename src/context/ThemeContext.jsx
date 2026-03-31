import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Default theme color
    const [primaryColor, setPrimaryColor] = useState(() => {
        return localStorage.getItem('rupiksha-theme-color') || '#2563eb'; // Default Blue-600
    });

    useEffect(() => {
        // Apply the color to CSS variables
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        
        // Generate and apply semi-transparent version for overlays
        const hexToRgba = (hex, alpha) => {
            let r = 0, g = 0, b = 0;
            if (hex.length === 4) {
                r = parseInt(hex[1] + hex[1], 16);
                g = parseInt(hex[2] + hex[2], 16);
                b = parseInt(hex[3] + hex[3], 16);
            } else if (hex.length === 7) {
                r = parseInt(hex.substring(1, 3), 16);
                g = parseInt(hex.substring(3, 5), 16);
                b = parseInt(hex.substring(5, 7), 16);
            }
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        document.documentElement.style.setProperty('--primary-color-light', hexToRgba(primaryColor, 0.15));
        document.documentElement.style.setProperty('--primary-color-20', hexToRgba(primaryColor, 0.2));
        document.documentElement.style.setProperty('--primary-color-10', hexToRgba(primaryColor, 0.1));
        document.documentElement.style.setProperty('--primary-color-5', hexToRgba(primaryColor, 0.05));
        
        localStorage.setItem('rupiksha-theme-color', primaryColor);
    }, [primaryColor]);

    const changeColor = (color) => {
        setPrimaryColor(color);
    };

    return (
        <ThemeContext.Provider value={{ primaryColor, changeColor }}>
            {children}
        </ThemeContext.Provider>
    );
};
