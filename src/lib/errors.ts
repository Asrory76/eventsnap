/**
 * Standarisasi Error Handling untuk PicMe (EventSnap).
 * Menyediakan AppError class serta mapping terpusat untuk error Firebase SDK (Auth, Firestore, Storage).
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    code = "INTERNAL_ERROR",
    statusCode = 500,
    isOperational = true,
    originalError?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.originalError = originalError;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class PicMeError extends AppError {
  constructor(
    message: string,
    code = "PICME_ERROR",
    statusCode = 400,
    originalError?: unknown
  ) {
    super(message, code, statusCode, true, originalError);
    this.name = "PicMeError";
  }
}

export class QuotaExceededError extends AppError {
  constructor(message = "Kuota foto untuk event ini telah penuh.", originalError?: unknown) {
    super(message, "QUOTA_EXCEEDED", 403, true, originalError);
    this.name = "QuotaExceededError";
  }
}

export class EventClosedError extends AppError {
  constructor(message = "Event ini sedang tidak aktif atau telah berakhir.", originalError?: unknown) {
    super(message, "EVENT_CLOSED", 403, true, originalError);
    this.name = "EventClosedError";
  }
}

export class EventNotFoundError extends AppError {
  constructor(message = "Event tidak ditemukan.", originalError?: unknown) {
    super(message, "EVENT_NOT_FOUND", 404, true, originalError);
    this.name = "EventNotFoundError";
  }
}

export class InvalidMediaError extends AppError {
  constructor(message = "Format atau ukuran media tidak valid.", originalError?: unknown) {
    super(message, "INVALID_MEDIA", 400, true, originalError);
    this.name = "InvalidMediaError";
  }
}

export class UploadFailedError extends AppError {
  constructor(message = "Gagal mengunggah file media.", originalError?: unknown) {
    super(message, "UPLOAD_FAILED", 500, true, originalError);
    this.name = "UploadFailedError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Akses ditolak. Anda tidak memiliki izin untuk operasi ini.", originalError?: unknown) {
    super(message, "UNAUTHORIZED", 401, true, originalError);
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, "VALIDATION_ERROR", 400, true, originalError);
    this.name = "ValidationError";
  }
}

export class NetworkError extends AppError {
  constructor(message = "Koneksi jaringan bermasalah. Periksa koneksi internet Anda.", originalError?: unknown) {
    super(message, "NETWORK_ERROR", 503, true, originalError);
    this.name = "NetworkError";
  }
}

interface FirebaseErrorLike {
  code?: string;
  message?: string;
  name?: string;
}

/**
 * Memetakan berbagai kode error dari Firebase SDK (Auth, Firestore, Storage)
 * ke instance AppError terstandarisasi yang aman untuk UI dan API layer.
 */
export function handleFirebaseError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const fbErr = (typeof error === "object" && error !== null ? error : {}) as FirebaseErrorLike;
  const rawCode = typeof fbErr.code === "string" ? fbErr.code : "";
  const rawMessage = typeof fbErr.message === "string" ? fbErr.message : "";

  // 1. Firebase Auth Errors
  switch (rawCode) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return new AppError("Kredensial login tidak valid. Silakan coba lagi.", "AUTH_INVALID_CREDENTIAL", 401, true, error);
    case "auth/user-not-found":
      return new AppError("Akun pengguna tidak ditemukan.", "AUTH_USER_NOT_FOUND", 404, true, error);
    case "auth/email-already-in-use":
      return new AppError("Alamat email ini sudah terdaftar di sistem.", "AUTH_EMAIL_EXISTS", 409, true, error);
    case "auth/weak-password":
      return new AppError("Kata sandi terlalu lemah. Gunakan minimal 6 karakter.", "AUTH_WEAK_PASSWORD", 400, true, error);
    case "auth/popup-closed-by-user":
      return new AppError("Jendela login ditutup sebelum proses selesai.", "AUTH_POPUP_CLOSED", 400, true, error);
    case "auth/cancelled-popup-request":
      return new AppError("Permintaan login jendela sembul dibatalkan.", "AUTH_POPUP_CANCELLED", 400, true, error);
    case "auth/network-request-failed":
      return new NetworkError("Koneksi jaringan gagal saat autentikasi. Periksa internet Anda.", error);
    case "auth/too-many-requests":
      return new AppError("Terlalu banyak percobaan. Silakan tunggu beberapa saat.", "AUTH_TOO_MANY_REQUESTS", 429, true, error);
    case "auth/user-disabled":
      return new AppError("Akun pengguna ini telah dinonaktifkan.", "AUTH_USER_DISABLED", 403, true, error);
    case "auth/operation-not-allowed":
      return new AppError("Metode autentikasi ini belum diaktifkan.", "AUTH_METHOD_DISABLED", 403, true, error);
    case "auth/requires-recent-login":
      return new AppError("Sesi Anda telah kedaluwarsa. Silakan login kembali.", "AUTH_REQUIRES_LOGIN", 401, true, error);
  }

  // 2. Firestore Error Codes
  switch (rawCode) {
    case "permission-denied":
      return new UnauthorizedError("Akses ditolak. Anda tidak memiliki izin untuk operasi data ini.", error);
    case "not-found":
      return new AppError("Dokumen data tidak ditemukan.", "NOT_FOUND", 404, true, error);
    case "already-exists":
      return new AppError("Dokumen dengan ID ini sudah ada.", "ALREADY_EXISTS", 409, true, error);
    case "resource-exhausted":
      return new QuotaExceededError("Batas kuota layanan Firestore telah tercapai.", error);
    case "failed-precondition":
      return new AppError("Operasi ditolak karena prasyarat data belum terpenuhi.", "PRECONDITION_FAILED", 412, true, error);
    case "aborted":
      return new AppError("Operasi dibatalkan karena benturan konkurensi data. Silakan coba lagi.", "CONCURRENCY_ABORTED", 409, true, error);
    case "unavailable":
      return new NetworkError("Database Firestore sedang tidak dapat dihubungi.", error);
    case "deadline-exceeded":
      return new AppError("Waktu tunggu permintaan database habis (timeout).", "TIMEOUT", 504, true, error);
    case "unauthenticated":
      return new UnauthorizedError("Anda harus terautentikasi untuk mengakses data ini.", error);
  }

  // 3. Storage Error Codes
  switch (rawCode) {
    case "storage/unauthorized":
      return new UnauthorizedError("Tidak memiliki izin untuk mengakses atau mengunggah file ke Storage.", error);
    case "storage/canceled":
      return new AppError("Proses unggah file dibatalkan.", "STORAGE_CANCELED", 400, true, error);
    case "storage/object-not-found":
      return new AppError("File yang diminta tidak ditemukan di cloud storage.", "STORAGE_OBJECT_NOT_FOUND", 404, true, error);
    case "storage/quota-exceeded":
      return new QuotaExceededError("Kapasitas penyimpanan Storage telah penuh.", error);
    case "storage/retry-limit-exceeded":
      return new NetworkError("Batas waktu unggah file terlampaui. Periksa kecepatan koneksi Anda.", error);
    case "storage/invalid-checksum":
      return new InvalidMediaError("File mengalami kerusakan saat proses transfer.", error);
  }

  // Standard Error fallback
  if (error instanceof Error) {
    return new AppError(
      error.message || "Terjadi kesalahan internal pada layanan.",
      "INTERNAL_ERROR",
      500,
      false,
      error
    );
  }

  return new AppError(
    rawMessage || "Terjadi kesalahan yang tidak terduga pada sistem.",
    "UNKNOWN_ERROR",
    500,
    false,
    error
  );
}
