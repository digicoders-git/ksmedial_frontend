import { createContext, useContext, useEffect, useState } from "react";
import { colorPalettes } from "../theme/palettes";



const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    return localStorage.getItem("theme") || "light";
  };

  const getInitialPalette = () => {
    return localStorage.getItem("palette") || "corporate";
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [palette, setPalette] = useState(getInitialPalette);

  useEffect(() => {
    const html = document.documentElement;

    if (theme === "dark") {
      html.classList.add("dark");
      html.setAttribute("data-theme", "dark");
    } else {
      html.classList.remove("dark");
      html.setAttribute("data-theme", "light");
    }

    localStorage.setItem("theme", theme);
    localStorage.setItem("palette", palette);
  }, [theme, palette]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const changePalette = (newPalette) => {
    if (colorPalettes[newPalette]) {
      setPalette(newPalette);
    }
  };

  // Get current palette with fallback
  const currentPalette = colorPalettes[palette] || colorPalettes.corporate;

  // Theme colors configuration
  const themeColors = {
    light: {
      mode: 'light',
      primary: currentPalette.primary,
      secondary: currentPalette.secondary,
      accent: currentPalette.accent,
      success: currentPalette.success,
      warning: currentPalette.warning,
      danger: currentPalette.danger,
      info: currentPalette.info,
      background: currentPalette.backgroundLight,
      surface: currentPalette.surfaceLight,
      text: currentPalette.textLight,
      textSecondary: currentPalette.secondary,
      border: currentPalette.borderLight,
      hover: {
        background: currentPalette.hoverLight,
        text: currentPalette.textLight,
      },
      active: {
        background: currentPalette.activeLight,
        text: currentPalette.primary,
      },
      onPrimary: '#ffffff',
    },
    dark: {
      mode: 'dark',
      primary: currentPalette.primary === "#017343" ? "#db2b1c" : currentPalette.primary,
      secondary: currentPalette.secondary,
      accent: currentPalette.accent,
      success: currentPalette.success === "#017343" ? "#db2b1c" : currentPalette.success,
      warning: currentPalette.warning,
      danger: currentPalette.danger,
      info: currentPalette.info,
      background: currentPalette.backgroundDark,
      surface: currentPalette.surfaceDark,
      text: currentPalette.textDark,
      textSecondary: currentPalette.secondary,
      border: currentPalette.borderDark,
      hover: {
        background: currentPalette.hoverDark,
        text: currentPalette.textDark,
      },
      active: {
        background: currentPalette.activeDark,
        text: currentPalette.surfaceDark,
      },
      onPrimary: '#ffffff',
    },
  };

  // Get current theme colors with fallback
  const currentThemeColors = themeColors[theme] || themeColors.light;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        palette,
        changePalette,
        themeColors: currentThemeColors,
        availablePalettes: Object.keys(colorPalettes)
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};