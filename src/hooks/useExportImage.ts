// useExportImage.ts
import { useCallback, useState } from "react";
import html2canvas from "html2canvas";

type Options = {
  filename?: string;           // ex: "edt-semaine-0.png"
  format?: "png" | "jpeg";     // défaut: png
  scale?: number;              // 1–3 pour la netteté; défaut: 2
  backgroundColor?: string | null; // null pour transparence; défaut: null
  onError?: (error: unknown) => void;
  onSuccess?: (dataUrl: string) => void;
};

export function useExportImage(options: Options = {}) {
  const [isExporting, setIsExporting] = useState(false);

  const exportImage = useCallback(
    async (node: HTMLElement | null) => {
      if (!node || isExporting) return;
      setIsExporting(true);
      try {
        const {
          filename,
          format = "png",
          scale = 2,
          backgroundColor = null,
          onError,
          onSuccess,
        } = options;

        const canvas = await html2canvas(node, {
          backgroundColor,
          scale,
          useCORS: true,
          logging: false,
        });

        const mime = format === "jpeg" ? "image/jpeg" : "image/png";
        const dataURL = canvas.toDataURL(mime);

        // Téléchargement
        const link = document.createElement("a");
        const dateStr = new Date().toLocaleDateString("fr-FR").replace(/\//g, "-");
        link.download = filename ?? `export-${dateStr}.${format}`;
        link.href = dataURL;
        link.click();

        onSuccess?.(dataURL);
      } catch (err) {
        onerror?.(err);
      } finally {
        setIsExporting(false);
      }
    },
    [isExporting, options]
  );

  return { exportImage, isExporting };
}
