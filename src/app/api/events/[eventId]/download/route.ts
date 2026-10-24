import { NextRequest, NextResponse } from "next/server";
import { collection, doc, getDoc, getDocs, query, orderBy } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";
import { eventConverter, photoConverter } from "@/types";

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

/**
 * Endpoint GET: Mengunduh foto atau menyediakan manifest paket unduhan event.
 * Mencegah masalah CORS pada browser saat pengguna mengunduh foto beresolusi penuh.
 *
 * Pola Penggunaan:
 * 1. Download File Tunggal:
 *    GET /api/events/[eventId]/download?url=https://...&filename=foto.jpg
 * 2. Manifest Daftar Unduhan:
 *    GET /api/events/[eventId]/download
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
): Promise<Response> {
  try {
    const { eventId } = await context.params;
    const cleanEventId = eventId?.trim();

    if (!cleanEventId) {
      return NextResponse.json(
        { error: "Parameter eventId wajib disertakan." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");
    const customFilename = searchParams.get("filename");

    // 1. Mode Proxy Stream: Mengunduh file fisik langsung tanpa isu browser CORS
    if (targetUrl) {
      // Validasi origin URL agar tidak menjadi Open Proxy/SSRF
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(targetUrl);
      } catch {
        return NextResponse.json(
          { error: "Format URL media tidak valid." },
          { status: 400 }
        );
      }

      const allowedHosts = [
        "firebasestorage.googleapis.com",
        "storage.googleapis.com",
      ];

      if (!allowedHosts.includes(parsedUrl.hostname)) {
        return NextResponse.json(
          { error: "Domain penyimpanan file tidak diizinkan." },
          { status: 403 }
        );
      }

      // Fetch file gambar dari Cloud Storage server-side
      const response = await fetch(targetUrl);
      if (!response.ok) {
        return NextResponse.json(
          { error: "Gagal mengambil file dari cloud storage." },
          { status: response.status }
        );
      }

      const contentType = response.headers.get("content-type") || "image/jpeg";
      const filename = customFilename || `picme-${cleanEventId}-${Date.now()}.jpg`;
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");

      const fileBuffer = await response.arrayBuffer();

      return new Response(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${sanitizedFilename}"`,
          "Content-Length": fileBuffer.byteLength.toString(),
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
        },
      });
    }

    // 2. Mode Manifest: Mengambil seluruh daftar URL foto untuk event ini
    const { db } = getFirebase();
    const eventRef = doc(db, "events", cleanEventId).withConverter(eventConverter);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      return NextResponse.json(
        { error: `Event dengan ID '${cleanEventId}' tidak ditemukan.` },
        { status: 404 }
      );
    }

    const eventData = eventSnap.data();

    // Query semua foto yang disetujui (approved)
    const photosQuery = query(
      collection(db, "events", cleanEventId, "photos").withConverter(photoConverter),
      orderBy("createdAt", "desc")
    );

    const photosSnap = await getDocs(photosQuery);
    const photosList = photosSnap.docs.map((docSnap) => {
      const p = docSnap.data();
      const safeCaption = p.caption
        ? p.caption.slice(0, 25).replace(/[^a-zA-Z0-9_-]/g, "_")
        : p.id;
      const downloadFilename = `${safeCaption}.jpg`;

      return {
        id: p.id,
        url: p.url,
        downloadUrl: `/api/events/${cleanEventId}/download?url=${encodeURIComponent(p.url)}&filename=${encodeURIComponent(downloadFilename)}`,
        caption: p.caption || null,
        uploaderName: p.uploaderName || "Tamu",
        fileSize: p.fileSize,
        status: p.status,
        createdAt: p.createdAt ? p.createdAt.toDate().toISOString() : null,
      };
    });

    return NextResponse.json({
      success: true,
      event: {
        id: eventData.id,
        title: eventData.title,
        slug: eventData.slug,
        status: eventData.status,
        totalPhotos: photosList.length,
      },
      photos: photosList,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kesalahan server.";
    return NextResponse.json(
      { error: `Gagal memproses permintaan unduh: ${message}` },
      { status: 500 }
    );
  }
}
