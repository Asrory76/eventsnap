import QRCode from "qrcode";
import { ValidationError, AppError } from "@/lib/errors";

export type QrTargetMode = "camera" | "album";

export interface QrOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
  baseUrl?: string;
  mode?: QrTargetMode;
}

/**
 * Validasi dan pembersihan base URL host.
 */
function resolveBaseUrl(customBaseUrl?: string): string {
  if (customBaseUrl) {
    return customBaseUrl.trim().replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.trim().replace(/\/+$/, "");
  }
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return envUrl.trim().replace(/\/+$/, "");
}

/**
 * Validasi ID atau slug event.
 */
function validateEventIdentifier(eventIdOrSlug: string): string {
  const clean = eventIdOrSlug?.trim();
  if (!clean) {
    throw new ValidationError("ID atau slug event tidak boleh kosong.");
  }
  return encodeURIComponent(clean);
}

/**
 * Format URL akses kamera langsung (/events/[eventId]/camera) untuk tamu.
 * Membawa tamu langsung ke viewfinder kamera tanpa langkah navigasi manual.
 *
 * @param eventIdOrSlug - ID dokumen atau slug unik event
 * @param customBaseUrl - Base URL kustom opsional
 * @returns URL lengkap
 */
export function getEventCameraUrl(
  eventIdOrSlug: string,
  customBaseUrl?: string
): string {
  const encodedId = validateEventIdentifier(eventIdOrSlug);
  const base = resolveBaseUrl(customBaseUrl);
  return `${base}/events/${encodedId}/camera`;
}

/**
 * Format URL galeri album publik (/events/[eventId]).
 *
 * @param eventIdOrSlug - ID dokumen atau slug unik event
 * @param customBaseUrl - Base URL kustom opsional
 * @returns URL lengkap
 */
export function getEventAlbumUrl(
  eventIdOrSlug: string,
  customBaseUrl?: string
): string {
  const encodedId = validateEventIdentifier(eventIdOrSlug);
  const base = resolveBaseUrl(customBaseUrl);
  return `${base}/events/${encodedId}`;
}

/**
 * Format URL akses tamu untuk scan QR code.
 * Default ke mode 'camera' agar tamu langsung membuka antarmuka kamera smartphone.
 *
 * @param eventIdOrSlug - ID dokumen atau slug event
 * @param customBaseUrl - Base URL kustom opsional
 * @param mode - Target mode ('camera' | 'album')
 * @returns URL lengkap
 */
export function getEventGuestUrl(
  eventIdOrSlug: string,
  customBaseUrl?: string,
  mode: QrTargetMode = "camera"
): string {
  return mode === "camera"
    ? getEventCameraUrl(eventIdOrSlug, customBaseUrl)
    : getEventAlbumUrl(eventIdOrSlug, customBaseUrl);
}

/**
 * Buat QR Code format Data URL (Base64 PNG) beresolusi tinggi.
 * Cocok untuk preview <img src="..." /> maupun dicetak pada cetakan fisik/proyektor.
 *
 * @param eventIdOrSlug - ID dokumen atau slug event
 * @param options - Konfigurasi QR (dimensi, warna, mode URL)
 * @returns Data URL Base64 PNG
 */
export async function generateEventQrDataUrl(
  eventIdOrSlug: string,
  options?: QrOptions
): Promise<string> {
  try {
    const targetUrl = getEventGuestUrl(
      eventIdOrSlug,
      options?.baseUrl,
      options?.mode ?? "camera"
    );

    return await QRCode.toDataURL(targetUrl, {
      width: Math.max(100, options?.width ?? 600),
      margin: Math.max(0, options?.margin ?? 2),
      color: {
        dark: options?.darkColor ?? "#141210", // Charcoal tema PicMe
        light: options?.lightColor ?? "#FAF7F2", // Warm Ivory tema PicMe
      },
      errorCorrectionLevel: "H", // High correction level untuk toleransi scan kamera HP
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Gagal membuat gambar QR code: ${error instanceof Error ? error.message : "Kesalahan tidak diketahui"}`,
      "QR_GENERATION_FAILED",
      500,
      true,
      error
    );
  }
}

/**
 * Buat QR Code format vektor SVG string murni.
 *
 * @param eventIdOrSlug - ID dokumen atau slug event
 * @param options - Konfigurasi QR
 * @returns String SVG murni
 */
export async function generateEventQrSvg(
  eventIdOrSlug: string,
  options?: QrOptions
): Promise<string> {
  try {
    const targetUrl = getEventGuestUrl(
      eventIdOrSlug,
      options?.baseUrl,
      options?.mode ?? "camera"
    );

    return await QRCode.toString(targetUrl, {
      type: "svg",
      width: Math.max(100, options?.width ?? 400),
      margin: Math.max(0, options?.margin ?? 2),
      color: {
        dark: options?.darkColor ?? "#141210",
        light: options?.lightColor ?? "#FAF7F2",
      },
      errorCorrectionLevel: "H",
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Gagal menghasilkan SVG QR code: ${error instanceof Error ? error.message : "Kesalahan tidak diketahui"}`,
      "QR_GENERATION_FAILED",
      500,
      true,
      error
    );
  }
}
