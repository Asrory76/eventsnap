import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { eventConverter, type EventDoc } from "@/types";

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

export interface VerifyEventRequestBody {
  pin?: string;
}

/**
 * Endpoint POST: Memvalidasi akses event, PIN rahasia (jika ada), dan status penerimaan foto secara aman di sisi server.
 */
export async function POST(
  request: NextRequest,
  context: RouteParams
): Promise<Response> {
  try {
    const { eventId } = await context.params;
    const cleanId = eventId?.trim();

    if (!cleanId) {
      return NextResponse.json(
        { valid: false, canUpload: false, message: "ID event wajib disertakan." },
        { status: 400 }
      );
    }

    let body: VerifyEventRequestBody = {};
    try {
      body = await request.json();
    } catch {
      // Body kosong diizinkan untuk verifikasi status dasar
    }

    const submittedPin = body.pin?.trim();

    const { db } = getFirebase();
    let eventDocData: EventDoc | null = null;

    // 1. Cari berdasarkan ID dokumen
    const eventRef = doc(db, "events", cleanId).withConverter(eventConverter);
    const eventSnap = await getDoc(eventRef);

    if (eventSnap.exists()) {
      eventDocData = eventSnap.data();
    } else {
      // Fallback: Cari berdasarkan slug
      const slugQuery = query(
        collection(db, "events").withConverter(eventConverter),
        where("slug", "==", cleanId.toLowerCase()),
        limit(1)
      );
      const slugSnap = await getDocs(slugQuery);
      if (!slugSnap.empty) {
        eventDocData = slugSnap.docs[0].data();
      }
    }

    if (!eventDocData) {
      return NextResponse.json(
        { valid: false, canUpload: false, message: "Event tidak ditemukan." },
        { status: 404 }
      );
    }

    // 2. Validasi PIN jika event diproteksi PIN
    if (eventDocData.pin && eventDocData.pin.trim() !== "") {
      const requiredPin = eventDocData.pin.trim();
      if (!submittedPin || submittedPin !== requiredPin) {
        return NextResponse.json(
          {
            valid: false,
            canUpload: false,
            requiresPin: true,
            message: "PIN akses event tidak valid atau belum dimasukkan.",
          },
          { status: 401 }
        );
      }
    }

    // 3. Evaluasi Status Keaktifan Event
    const isStatusActive = eventDocData.status === "active";
    const hasRemainingQuota = eventDocData.usedPhotoQuota < eventDocData.maxPhotoQuota;
    const canUpload = isStatusActive && hasRemainingQuota;

    let statusMessage = "Event aktif dan siap menerima unggahan foto.";
    if (!isStatusActive) {
      statusMessage =
        eventDocData.status === "upcoming"
          ? "Event belum dimulai. Pengunggahan foto belum dibuka."
          : "Event telah berakhir. Pengunggahan foto telah ditutup.";
    } else if (!hasRemainingQuota) {
      statusMessage = "Kuota foto event telah penuh.";
    }

    const remainingQuota = Math.max(
      0,
      eventDocData.maxPhotoQuota - eventDocData.usedPhotoQuota
    );

    return NextResponse.json({
      valid: true,
      canUpload,
      status: eventDocData.status,
      message: statusMessage,
      event: {
        id: eventDocData.id,
        title: eventDocData.title,
        slug: eventDocData.slug,
        status: eventDocData.status,
        maxPhotoQuota: eventDocData.maxPhotoQuota,
        usedPhotoQuota: eventDocData.usedPhotoQuota,
        remainingQuota,
        isModerationEnabled: eventDocData.isModerationEnabled,
        coverUrl: eventDocData.coverUrl || null,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Kesalahan server.";
    return NextResponse.json(
      { valid: false, canUpload: false, message: `Gagal memverifikasi event: ${msg}` },
      { status: 500 }
    );
  }
}
