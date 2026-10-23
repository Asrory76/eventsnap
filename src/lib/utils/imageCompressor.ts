/**
 * Client-Side Image Compression Helper menggunakan HTML5 Canvas API.
 * Mengurangi ukuran file gambar dari kamera HP (bisa 10MB+) menjadi ~500KB-1.5MB
 * tanpa penurunan kualitas visual yang signifikan.
 */

export interface CompressionOptions {
  maxDimension?: number; // Lebar/tinggi maksimal (default 2048px)
  quality?: number; // Kualitas kompresi 0.0 - 1.0 (default 0.85)
  mimeType?: "image/jpeg" | "image/webp";
}

export async function compressImage(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<Blob> {
  const {
    maxDimension = 2048,
    quality = 0.85,
    mimeType = "image/jpeg",
  } = options;

  // Jika dijalankan di server-side (SSR), kembalikan file asli
  if (typeof window === "undefined") {
    return file;
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Hitung dimensi baru proporsional jika melebihi batas maksimal
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        // Fallback ke file asli jika context canvas gagal
        resolve(file);
        return;
      }

      // Gambar ke canvas dengan smoothing high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // Jika hasil kompresi malah lebih besar dari file asli, gunakan file asli
            resolve(file);
          } else {
            resolve(blob);
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback ke file asli jika format tidak bisa di-render oleh browser Image
      resolve(file);
    };

    img.src = objectUrl;
  });
}
