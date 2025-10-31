// Utilitaires couleurs: convertisseurs et parseurs

export type Hsl = { h: number; s: number; l: number };

/**
 * Convertit une couleur hex en HSL.
 * Supporte les hex courts (#abc) et longs (#aabbcc).
 */
export const hexToHsl = (hexInput: string): Hsl => {
  let hex = hexInput.replace("#", "").trim();
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = h * 60;
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
};

/**
 * Convertit HSL en hex (#rrggbb).
 */
export const hslToHex = (h: number, s: number, l: number): string => {
  let sat = s / 100;
  let lig = l / 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) => {
    const color = lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };

  return `#${f(0)}${f(8)}${f(4)}`;
};

/**
 * Parse une string HSL CSS au format "h s% l%" et retourne un hex.
 * Exemple: "270 93% 53%" -> "#7c3aed"
 */
export const parseHslStringToHex = (s: string): string | undefined => {
  const parts = s.trim().split(/\s+/);
  if (parts.length >= 3) {
    const h = parseFloat(parts[0]);
    const sat = parseFloat(parts[1].replace("%", ""));
    const lig = parseFloat(parts[2].replace("%", ""));
    return hslToHex(h, sat, lig);
  }
  return undefined;
};

/**
 * Applique les variables CSS basées sur la couleur primaire.
 * Définit: --primary (en HSL), --gradient-primary (linear-gradient), --accent (h+10).
 */
export const applyPrimaryCssVars = (hex: string): void => {
  const { h, s, l } = hexToHsl(hex);
  const root = document.documentElement;
  root.style.setProperty("--primary", `${h} ${s}% ${l}%`);
  root.style.setProperty("--gradient-primary", `linear-gradient(135deg, ${hex} 0%, ${hex} 100%)`);
  root.style.setProperty("--accent", `${h + 10} ${s}% ${l}%`);
};
