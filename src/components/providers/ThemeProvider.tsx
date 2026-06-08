"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ColorMode = "light" | "dark";
export type DesignTheme = "classic" | "eva";
export type EvaLoaderStyle = "side" | "terminal";

interface ThemeContextValue {
  mode: ColorMode;
  design: DesignTheme;
  evaLoaderStyle: EvaLoaderStyle;
  setDesign: (design: DesignTheme, origin?: { x: number; y: number }) => void;
  setEvaLoaderStyle: (style: EvaLoaderStyle) => void;
  toggleEvaLoaderStyle: () => void;
  toggleMode: (origin?: { x: number; y: number }) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const MODE_KEY = "eq-color-mode";
const DESIGN_KEY = "eq-design-theme";
const EVA_LOADER_KEY = "eq-eva-loader-style";

/**
 * Read initial state from DOM or localStorage.
 */
function getInitialFromDOM(): { mode: ColorMode; design: DesignTheme; evaLoaderStyle: EvaLoaderStyle } {
  if (typeof document === "undefined") {
    return { mode: "dark", design: "classic", evaLoaderStyle: "side" };
  }
  const root = document.documentElement;
  const mode = (root.getAttribute("data-mode") as ColorMode) || "dark";
  const design = (root.getAttribute("data-design") as DesignTheme) || "classic";
  const evaLoaderStyle = (localStorage.getItem(EVA_LOADER_KEY) as EvaLoaderStyle) || "side";
  return { mode, design, evaLoaderStyle };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ColorMode>(() => getInitialFromDOM().mode);
  const [design, setDesignState] = useState<DesignTheme>(() => getInitialFromDOM().design);
  const [evaLoaderStyle, setEvaLoaderStyleState] = useState<EvaLoaderStyle>(() => getInitialFromDOM().evaLoaderStyle);

  useEffect(() => {
    document.documentElement.setAttribute("data-mode", mode);
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-design", design);
    localStorage.setItem(DESIGN_KEY, design);
  }, [design]);

  useEffect(() => {
    localStorage.setItem(EVA_LOADER_KEY, evaLoaderStyle);
  }, [evaLoaderStyle]);

  const toggleMode = useCallback(
    (origin?: { x: number; y: number }) => {
      const root = document.documentElement;
      const nextMode: ColorMode = mode === "dark" ? "light" : "dark";

      if (origin) {
        root.style.setProperty("--vt-x", `${origin.x}px`);
        root.style.setProperty("--vt-y", `${origin.y}px`);
      }

      setMode(nextMode);
    },
    [mode]
  );

  const setDesign = useCallback(
    (nextDesign: DesignTheme, origin?: { x: number; y: number }) => {
      const root = document.documentElement;
      if (origin) {
        root.style.setProperty("--vt-x", `${origin.x}px`);
        root.style.setProperty("--vt-y", `${origin.y}px`);
      }

      setDesignState(nextDesign);
    },
    []
  );

  const setEvaLoaderStyle = useCallback((style: EvaLoaderStyle) => {
    setEvaLoaderStyleState(style);
  }, []);

  const toggleEvaLoaderStyle = useCallback(() => {
    setEvaLoaderStyleState((prev) => (prev === "side" ? "terminal" : "side"));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        design,
        evaLoaderStyle,
        setDesign,
        setEvaLoaderStyle,
        toggleEvaLoaderStyle,
        toggleMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

export const NO_FLASH_THEME_SCRIPT = `
(function () {
  try {
    var mode = localStorage.getItem("${MODE_KEY}") || "dark";
    var design = localStorage.getItem("${DESIGN_KEY}") || "classic";
    document.documentElement.setAttribute("data-mode", mode);
    document.documentElement.setAttribute("data-design", design);
  } catch (e) {}
})();
`;
