# PocketBase Backend Architecture for TautJiwa (LENTERA)

Dokumentasi arsitektur backend ultra-lightweight berbasis **PocketBase** (single Go binary dengan SQLite embedded + WebSocket/SSE Realtime subscription bawaan) yang di-containerize dengan Docker Compose.

---

## 1. Komponen Arsitektur

1. **PocketBase Server (`pb_data/`, port `8090`)**:
   - Engine database SQLite super cepat, hemat memori (~20-40 MB RAM).
   - Realtime subscription out-of-the-box (SSE / Server-Sent Events).
   - Admin UI di `http://localhost:8090/_/` untuk verifikasi KYC psikolog dan moderasi dinding cerita.
   - Built-in file upload (untuk foto kartu identitas mahasiswa / STR psikolog).

2. **Koleksi Database (Schema Collections)**:
   - `users`: Pengguna umum (anonim dengan token perangkat atau auth anonim).
   - `psychologists`: Data konselor / mahasiswa psikologi:
     - `name`: Nama lengkap
     - `university`: Universitas / Instansi
     - `student_id`: NIM / Nomor Registrasi
     - `kyc_status`: `'pending' | 'verified' | 'rejected'`
     - `kyc_document`: Foto kartu mahasiswa / sertifikat kompetensi
     - `is_online`: Status kesiapan mendampingi
     - `is_busy`: Status sedang dalam sesi atau tidak
     - `bio`: Deskripsi singkat / spesialisasi
   - `chat_sessions`: Sesi obrolan 1-on-1:
     - `session_id`: Unique ID sesi
     - `anonymous_user_id`: ID anonim pengguna Lentera
     - `psychologist`: Relasi ke `psychologists`
     - `status`: `'waiting' | 'active' | 'skipped' | 'ended'`
     - `started_at`, `ended_at`
   - `chat_messages`: Pesan realtime:
     - `session`: Relasi ke `chat_sessions`
     - `sender`: `'user' | 'psychologist'`
     - `text`: Isi pesan
     - `created`: Timestamp
   - `stories`: Dinding Cerita (Story Wall):
     - `author_label`: Contoh: "Mahasiswa tingkat akhir, 22 tahun" (Anonim)
     - `from_tier`: `'moderate' | 'high'`
     - `quote`: Kutipan pemantik
     - `story`: Kisah perjalanan & pemulihan
     - `action_taken`: Langkah nyata yang diambil
     - `now_status`: Kondisi sekarang
     - `tags`: Tagar (JSON array)
     - `is_approved`: Boolean (moderasi)

---

## 2. Cara Menjalankan

```bash
cd backend
docker compose up -d
```

PocketBase akan aktif pada:
- **API URL**: `http://localhost:8090/api/`
- **Admin Dashboard**: `http://localhost:8090/_/`
