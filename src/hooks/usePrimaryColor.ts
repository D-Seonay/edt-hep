// src/hooks/usePrimaryColor.ts
// Hook pour gérer la couleur primaire: état, persistance et application CSS

import { useEffect, useState } from "react";
import { applyPrimaryCssVars, parseHslStringToHex } from "@/utils/colorUtils";

const STORAGE_KEY = "primaryColor";

/**
 * Gère la couleur primaire:
 * - Charge depuis localStorage si présent, sinon depuis la variable CSS --primary
 * - Applique les variables CSS à chaque changement
 * - Persiste dans localStorage
 */
export const usePrimaryColor = (defaultHex: string = "#7c3aed") => {
  const [primaryColor, setPrimaryColor] = useState<string>(defaultHex);

  // Initialisation: localStorage -> CSS var fallback
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPrimaryColor(saved);
      applyPrimaryCssVars(saved);
      return;
    }

    const computed = getComputedStyle(document.documentElement).getPropertyValue("--primary");
    const val = computed && computed.trim();
    if (val) {
      const hex = parseHslStringToHex(val);
      if (hex) {
        setPrimaryColor(hex);
        return;
      }
    }

    // fallback: appliquer la valeur par défaut
    applyPrimaryCssVars(defaultHex);
  }, [defaultHex]);

  // Appliquer et persister à chaque changement
  const handlePrimaryColorChange = (hex: string) => {
    setPrimaryColor(hex);
    applyPrimaryCssVars(hex);
    localStorage.setItem(STORAGE_KEY, hex);
  };

  return { primaryColor, setPrimaryColor: handlePrimaryColorChange };
};
