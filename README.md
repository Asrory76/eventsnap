# EventSnap 📸

Album foto acara kolaboratif — pengelola buat acara, tamu scan QR code, foto dari kamera HP otomatis terkumpul ke satu album realtime.

> **Satu QR code. Semua tamu jadi fotografer.**

## ✨ Fitur

- 🎉 **Buat acara** dalam hitungan detik — tanpa registrasi
- 📱 **QR Code** — cetak/share ke tamu, langsung buka kamera
- 📷 **Kamera HD** — mendukung kamera depan & belakang, jepret langsung di browser
- 🖼️ **Upload galeri** — pilih foto dari galeri, mendukung multiple files
- ⚡ **Realtime album** — semua foto muncul langsung di album bersama
- 🔍 **Lightbox** — klik foto untuk preview full-screen, navigasi dengan keyboard
- 🔒 **Aman** — security rules Firebase menjaga akses data
- 🌙 **Dark mode** — otomatis mengikuti preferensi sistem
- 📱 **Responsive** — tampil optimal di HP, tablet, dan desktop

## 🛠️ Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| [Next.js 16](https://nextjs.org/) (App Router) | Framework React |
| [Firebase Auth](https://firebase.google.com/docs/auth) | Autentikasi (anonymous) |
| [Cloud Firestore](https://firebase.google.com/docs/firestore) | Database realtime |
| [Cloud Storage](https://firebase.google.com/docs/storage) | Penyimpanan foto |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [qrcode](https://www.npmjs.com/package/qrcode) | Generate QR code |
| TypeScript | Type safety |

## 📁 Struktur Proyek

```
eventsnap/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout + Header + SEO metadata
│   │   ├── page.tsx                # Landing page
│   │   ├── globals.css             # Design tokens + animasi
│   │   ├── create/
│   │   │   └── page.tsx            # Form buat acara → QR code
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Daftar album milik user
│   │   └── events/
│   │       └── [eventId]/
│   │           ├── page.tsx        # Album foto publik (realtime)
│   │           └── camera/
│   │               └── page.tsx    # Kamera tamu: jepret/upload foto
│   ├── components/
│   │   ├── Header.tsx              # Navigasi utama (sticky, glassmorphism)
│   │   └── QrBadge.tsx             # Komponen QR code (canvas)
│   └── lib/
│       ├── firebase.ts             # Inisialisasi Firebase SDK
│       ├── auth.ts                 # Helper autentikasi (anonymous sign-in)
│       └── events.ts               # CRUD events + upload foto
├── firestore.rules                 # Security rules Firestore
├── storage.rules                   # Security rules Storage
├── .env.local.example              # Template environment variables
└── package.json
```

## 🚀 Setup Cepat (±10 menit)

### Prasyarat

- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/) atau [pnpm](https://pnpm.io/)
- Akun [Firebase](https://console.firebase.google.com/)

### 1. Clone & install

```bash
git clone <repo-url>
cd eventsnap
npm install
```

### 2. Buat project Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/) → **Add project**.
2. Tambahkan **Web app** (ikon `</>`) → salin nilai config-nya.
3. Aktifkan produk berikut:
   - **Authentication** → *Sign-in method* → enable **Anonymous**
   - **Firestore Database** → buat database (mode production)
   - **Storage** → buat bucket default

### 3. Isi environment variables

```bash
cp .env.local.example .env.local
```

Buka `.env.local` dan isi semua variabel dari Firebase Console > Project settings > Your apps > Web app config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=yourproject.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=yourproject
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=yourproject.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Deploy security rules (⚠️ Penting!)

Rules file sudah disiapkan di root proyek. **Jangan jalankan app tanpa deploy rules:**

```bash
npm install -g firebase-tools   # sekali saja
firebase login
firebase init                   # pilih Firestore + Storage
firebase deploy --only firestore:rules,storage:rules
```

File yang di-deploy:
- `firestore.rules` — mengatur siapa boleh baca/tulis dokumen
- `storage.rules` — mengatur upload foto (max 15 MB, hanya gambar)

### 5. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) → **Buat Acara** → dapat QR → tamu buka link kamera → foto!

## 📖 Alur Aplikasi

```
Pengelola                              Tamu
────────                              ────
   │                                     │
   ├── Buka /create                      │
   ├── Isi nama acara                    │
   ├── Klik "Buat Acara"                 │
   ├── Dapat QR code ←──── cetak/share ──┤
   │                                     │
   │                          Scan QR ───┤
   │                          Buka kamera ┤
   │                          Jepret! ───┤
   │                          Upload ────┤
   │                                     │
   ├── Buka /events/[id]                 │
   └── Foto muncul realtime ◄────────────┘
```

### Routes

| Route | Fungsi |
|-------|--------|
| `/` | Landing page — intro, fitur, CTA |
| `/create` | Buat acara → dapat QR code kamera |
| `/dashboard` | Daftar album milik user sesi ini |
| `/events/[eventId]` | Album foto publik (realtime) + lightbox |
| `/events/[eventId]/camera` | Kamera tamu: jepret/galeri → upload |

## 🔒 Keamanan

- Kredensial Firebase web **memang boleh publik** (by design) — keamanan sesungguhnya di security rules.
- **Firestore rules** (`firestore.rules`):
  - Event hanya bisa dibuat oleh user yang authenticated (ownerUid = uid sendiri)
  - Foto bisa diupload oleh siapa saja yang signed-in (termasuk anonymous)
  - Edit/hapus event hanya oleh owner
  - Hapus foto oleh owner event ATAU pemilik foto
- **Storage rules** (`storage.rules`):
  - Baca publik (untuk gallery)
  - Upload hanya signed-in, di folder uid sendiri, max 15 MB, hanya tipe image
- Tidak ada secret di bundle klien

### TODO Produksi

- [ ] Ganti anonymous auth creator → Google Sign-In (supaya daftar acara persisten lintas device)
- [ ] Rate-limit create-event (Cloud Functions)
- [ ] Moderation tools untuk owner (flag/hapus foto tidak pantas)
- [ ] Image compression sebelum upload
- [ ] Pagination untuk album dengan banyak foto

## 🌐 Deploy ke Vercel

```bash
npm i -g vercel
vercel
```

Tambahkan variabel `NEXT_PUBLIC_FIREBASE_*` yang sama di dashboard Vercel:
**Settings → Environment Variables** → tambahkan semua 6 variabel → redeploy.

## 📜 Scripts

| Script | Fungsi |
|--------|--------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build production bundle |
| `npm run start` | Jalankan production server |
| `npm run lint` | Jalankan ESLint |

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur: `git checkout -b fitur/nama-fitur`
3. Commit perubahan: `git commit -m "Tambah: nama fitur"`
4. Push ke branch: `git push origin fitur/nama-fitur`
5. Buat Pull Request

## 📄 Lisensi

MIT License — bebas digunakan untuk keperluan pribadi maupun komersial.
