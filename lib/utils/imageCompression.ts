export interface CompressedPhoto {
  id: string;
  name: string;
  dataUrl: string;
  sizeKb: number;
  originalSizeKb: number;
}

export interface CompressOptions {
  maxDimension?: number;
  initialQuality?: number;
  targetMaxKb?: number;
}

function estimateDataUrlKb(dataUrl: string): number {
  const commaIdx = dataUrl.indexOf(",");
  const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  return Math.max(1, Math.round((base64.length * 3) / 4 / 1024));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode image file."));
    img.src = src;
  });
}

export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<CompressedPhoto> {
  const maxDimension = options.maxDimension ?? 1200;
  const initialQuality = options.initialQuality ?? 0.74;
  const targetMaxKb = options.targetMaxKb ?? 180;
  const originalSizeKb = Math.max(1, Math.round(file.size / 1024));

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    let { naturalWidth: width, naturalHeight: height } = img;

    if (width > maxDimension || height > maxDimension) {
      const ratio = Math.min(maxDimension / width, maxDimension / height);
      width = Math.max(1, Math.round(width * ratio));
      height = Math.max(1, Math.round(height * ratio));
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context unavailable.");
    }

    // Fill white background so transparent PNGs compress cleanly to JPEG
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    let quality = initialQuality;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    let sizeKb = estimateDataUrlKb(dataUrl);

    // Step down quality if still above target KB for lean DB storage
    while (sizeKb > targetMaxKb && quality > 0.42) {
      quality = Math.max(0.4, Number((quality - 0.12).toFixed(2)));
      dataUrl = canvas.toDataURL("image/jpeg", quality);
      sizeKb = estimateDataUrlKb(dataUrl);
    }

    return {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name || `photo-${Date.now()}.jpg`,
      dataUrl,
      sizeKb,
      originalSizeKb,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function compressImageFiles(
  files: FileList | File[],
  options: CompressOptions = {}
): Promise<CompressedPhoto[]> {
  const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
  const results: CompressedPhoto[] = [];
  for (const file of list) {
    const compressed = await compressImageFile(file, options);
    results.push(compressed);
  }
  return results;
}
