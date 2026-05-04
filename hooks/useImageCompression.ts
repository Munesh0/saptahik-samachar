"use client";

import { useState, useCallback } from "react";

interface CompressionResult {
  file: File;
  preview: string;
  originalSize: number;
  compressedSize: number;
}

export function useImageCompression() {
  const [compressing, setCompressing] = useState(false);

  const compressImage = useCallback(
    async (file: File, maxWidth: number = 1200, quality: number = 0.7): Promise<CompressionResult> => {
      setCompressing(true);

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File([blob], file.name, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  });
                  const preview = URL.createObjectURL(blob);
                  setCompressing(false);
                  resolve({
                    file: compressedFile,
                    preview,
                    originalSize: file.size,
                    compressedSize: blob.size,
                  });
                } else {
                  setCompressing(false);
                  reject(new Error("Compression failed"));
                }
              },
              "image/jpeg",
              quality
            );
          };
          img.onerror = () => {
            setCompressing(false);
            reject(new Error("Failed to load image"));
          };
        };
        reader.onerror = () => {
          setCompressing(false);
          reject(new Error("Failed to read file"));
        };
      });
    },
    []
  );

  return { compressImage, compressing };
}
