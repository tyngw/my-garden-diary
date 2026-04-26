import type { CompressionSettings } from "@/lib/types";

export const defaultCompression: CompressionSettings = {
  width: 640,
  height: 480,
  quality: 80,
};

export async function compressImage(
  file: File,
  settings: CompressionSettings,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = settings.width;
  canvas.height = settings.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvasの初期化に失敗しました");
  }

  const scale = Math.max(
    settings.width / bitmap.width,
    settings.height / bitmap.height,
  );
  const drawWidth = bitmap.width * scale;
  const drawHeight = bitmap.height * scale;
  const x = (settings.width - drawWidth) / 2;
  const y = (settings.height - drawHeight) / 2;
  ctx.drawImage(bitmap, x, y, drawWidth, drawHeight);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("画像圧縮に失敗しました"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      settings.quality / 100,
    );
  });
}
