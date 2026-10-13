# Panduan Implementasi Teknis: Modul Skrining Bertingkat (Stepped-Care Pipeline)

Dokumen ini disusun sebagai spesifikasi teknis dan acuan pengembang (*developer guide*) dalam membangun modul skrining kesehatan mental berbasis *stepped-care architecture*. Arsitektur ini dirancang untuk meminimalkan keletihan survei (*survey fatigue*) pada pengguna sehat sekaligus menjamin presisi klinis dan keselamatan pengguna berisiko tinggi secara 100% *on-device*.

Dokumen ini khusus berisi panduan, periksa dokumen [bank-soal-skrining-klinis-k-10-phq-9-gad-7](./bank-soal-skrining-klinis-k-10-phq-9-gad-7.md) untuk butir soal dari masing-masing metode skrining

---

## 1. Landasan Metodologi & Alur Logika (Stepped-Care Architecture)

Pendekatan *stepped care* membagi evaluasi psikologis menjadi dua lapisan terpisah secara kondisional:
1. **Lapis 1 (Universal Gatekeeper):** Skrining cepat distres non-spesifik menggunakan **K-10** (10 butir).
2. **Lapis 2 (Targeted Clinical Evaluation):** Evaluasi klinis terfokus kriteria DSM-5 menggunakan **PHQ-9** (depresi) dan **GAD-7** (kecemasan), yang hanya dibuka jika skor Lapis 1 melewati ambang batas signifikan.

```
                    ┌───────────────────────────────┐
                    │      Tahap 1: K-10 Intake     │
                    │   (10 Butir Distres Global)   │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
          [Skor K-10 < 25]                 [Skor K-10 ≥ 25]
        (Distres Rendah/Sedang)          (Distres Tinggi/Ekstrem)
                    │                               │
                    ▼                               ▼
       ┌────────────────────────┐      ┌─────────────────────────┐
       │   Skrining Selesai     │      │  Tahap 2: PHQ-9 + GAD-7 │
       │ • Hasil: Tier 1 (Low)  │      │  (16 Butir Klinis DSM-5)│
       │ • CTA: Tips Self-Care  │      └────────────┬────────────┘
       └────────────────────────┘                   │
                                    ┌───────────────┴───────────────┐
                                    ▼                               ▼
                        [Butir 9 PHQ-9 = 0]            [Butir 9 PHQ-9 > 0]
                                    │                 (Indikasi Melukai Diri)
                    ┌───────────────┴───────────────┐               │
                    ▼                               ▼               ▼
          [PHQ & GAD < 15]               [PHQ ≥ 15 || GAD ≥ 15]     │
       ┌─────────────────────┐         ┌─────────────────────┐      │
       │  Tier 2 (Moderate)  │         │  Tier 3 (High-Risk) │      ▼
       │ • CTA: Booking BK   │         │ • CTA: Faskes/BPJS  │ ┌───────────────┐
       │   / Konseling       │         │ • Ekspor Resume PDF │ │🚨 CRISIS LOCK │
       └─────────────────────┘         └─────────────────────┘ │ Emergency CTA │
                                                               │ Hotline 119   │
                                                               └───────────────┘
```

---

## 2. Spesifikasi Instrumen & Aturan Skoring

### A. Tahap 1: K-10 (Kessler Psychological Distress Scale)
* **Fungsi:** Mengukur tingkat distres psikologis global (non-spesifik) dalam rentang 4 minggu terakhir.
* **Format:** 10 butir pertanyaan, skala Likert 5 poin (1–5):
  * $1 =$ Tidak pernah (*None of the time*)
  * $2 =$ Jarang (*A little of the time*)
  * $3 =$ Kadang-kadang (*Some of the time*)
  * $4 =$ Hampir setiap saat (*Most of the time*)
  * $5 =$ Setiap saat (*All of the time*)
* **Rentang Total Skor:** $10 - 50$
* **Kategori Klinis:**
  * $10 - 19$: Distres Rendah / Subklinis
  * $20 - 24$: Distres Ringan
  * $25 - 29$: Distres Sedang
  * $30 - 50$: Distres Berat / Sangat Tinggi
* **Trigger Decision:** Jika $\text{Skor K-10} \ge 25$, arahkan alur langsung ke Tahap 2. Jika $< 25$, hentikan tes dan tampilkan Tier 1.

---

### B. Tahap 2: PHQ-9 (Patient Health Questionnaire-9)
* **Fungsi:** Menilai keparahan 9 kriteria Gangguan Depresi Mayor (DSM-5) dalam 2 minggu terakhir.
* **Format:** 9 butir pertanyaan, skala Likert 4 poin (0–3):
  * $0 =$ Tidak sama sekali
  * $1 =$ Beberapa hari
  * $2 =$ Lebih dari separuh hari
  * $3 =$ Hampir setiap hari
* **Rentang Total Skor:** $0 - 27$
* **Kategori Klinis:**
  * $0 - 4$: Minimal / Normal
  * $5 - 9$: Depresi Ringan (*Mild*)
  * $10 - 14$: Depresi Sedang (*Moderate*)
  * $15 - 19$: Depresi Cukup Berat (*Moderately Severe*)
  * $20 - 27$: Depresi Berat (*Severe*)

---

### C. Tahap 2: GAD-7 (Generalized Anxiety Disorder-7)
* **Fungsi:** Menilai keparahan kriteria Gangguan Kecemasan Menyeluruh (DSM-5) dalam 2 minggu terakhir.
* **Format:** 7 butir pertanyaan, skala Likert 4 poin (0–3):
  * $0 =$ Tidak sama sekali
  * $1 =$ Beberapa hari
  * $2 =$ Lebih dari separuh hari
  * $3 =$ Hampir setiap hari
* **Rentang Total Skor:** $0 - 21$
* **Kategori Klinis:**
  * $0 - 4$: Kecemasan Minimal
  * $5 - 9$: Kecemasan Ringan (*Mild*)
  * $10 - 14$: Kecemasan Sedang (*Moderate*)
  * $15 - 21$: Kecemasan Berat (*Severe*)

---

## 3. Protokol Keselamatan & Intersepsi Krisis (Zero-Delay Interception)

Pengembang **wajib** menyematkan *event-listener* real-time pada respons **Butir ke-9 PHQ-9**:
> *"Pikiran bahwa Anda lebih baik mati, atau ingin melukai diri sendiri dengan cara apa pun"*

### Logika Eksekusi:
1. **Trigger Condition:** $\text{Nilai Butir 9} \in \{1, 2, 3\}$.
2. **Perilaku UI/UX:**
   * Langsung aktifkan status state `isCrisis = true`.
   * Pada halaman hasil akhir, tampilkan **Crisis Banner / Overlay Darurat** dengan tingkat visibilitas tertinggi (merah/kontras tinggi).
   * **Mengabaikan CTA reguler:** Tombol Call-to-Action (CTA) utama otomatis digantikan menjadi tombol panggilan darurat:
     * **Hotline Kemenkes 119 ext 8** (`tel:119,8`)
     * **Kontak Satgas / Layanan Darurat Kampus**
3. **Penyimpanan Data:** Tandai *flag* `has_suicide_ideation = 1` pada tabel riwayat untuk kebutuhan ekspor laporan klinis.

---

## 4. Klasifikasi Hasil Tiga Tier & Disiplin 1 CTA Utama

Untuk menghindari *decision fatigue* pada pengguna yang sedang mengalami beban emosional, setiap tingkatan keparahan hanya boleh menampilkan **satu aksi utama (Primary CTA)**:

| Tier | Kriteria Skor | Status Klinis | Tindakan & Satu CTA Utama |
|---|---|---|---|
| **Tier 1 (Low)** | $\text{K-10} < 25$ | Kondisi Emosional Stabil / Distres Normal | **CTA:** *"Eksplorasi Ruang Tenang & Self-Care"*<br>Arahkan ke latihan pernapasan, *physiological sigh*, atau kartu P3K emosi. |
| **Tier 2 (Moderate)** | $\text{K-10} \ge 25$, $\text{PHQ} < 15$, $\text{GAD} < 15$, $\text{Butir 9} = 0$ | Distres Sedang, Gejala Klinis Ringan/Moderat | **CTA:** *"Jadwalkan Konseling Kampus"*<br>Buka direktori Teman Cerita / formulir janji temu UPT Bimbingan & Konseling (BK) kampus. |
| **Tier 3 (High-Risk)** | $\text{PHQ} \ge 15$ ATAU $\text{GAD} \ge 15$ ATAU $\text{Butir 9} > 0$ | Risiko Klinis Berat / Membutuhkan Penanganan Medis | **CTA:** *"Hubungi Bantuan / Panduan Faskes"*<br>Jika krisis: Tombol dial 119.<br>Jika non-krisis: Unduh Ringkasan Gejala (PDF) & buka panduan rujukan BPJS 3 langkah. |

---

## 5. Panduan Implementasi Teknis bagi Developer

### A. Pola State Management (Frontend Flow)
```typescript
interface ScreeningState {
  currentStage: 'K10' | 'CLINICAL_EXPANSION' | 'COMPLETED';
  k10Answers: Record<number, number>; // index 1-10 (nilai 1-5)
  phqAnswers: Record<number, number>; // index 1-9 (nilai 0-3)
  gadAnswers: Record<number, number>; // index 1-7 (nilai 0-3)
  k10Score: number;
  phqScore: number;
  gadScore: number;
  isCrisis: boolean;
  assignedTier: 1 | 2 | 3;
}
```

* **Transisi Layar:**
  1. Mulai dengan `currentStage = 'K10'`.
  2. Saat butir K-10 selesai, jalankan fungsi evaluasi:
     * Jika `k10Score < 25`: Set `assignedTier = 1`, `currentStage = 'COMPLETED'`.
     * Jika `k10Score >= 25`: Set `currentStage = 'CLINICAL_EXPANSION'` (render form PHQ-9 & GAD-7 tanpa reload).
  3. Saat pengerjaan PHQ-9, jika butir 9 bernilai $> 0$, set `isCrisis = true`.

---

### B. Skema SQLite Lokal (Mode WAL, On-Device)
Semua data hasil skrining wajib disimpan secara privat di perangkat lokal pengguna:

```sql
CREATE TABLE IF NOT EXISTS screening_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    k10_score INTEGER NOT NULL,
    phq_score INTEGER,
    gad_score INTEGER,
    has_suicide_ideation INTEGER DEFAULT 0, -- 0 = False, 1 = True
    tier_level INTEGER NOT NULL,            -- 1, 2, atau 3
    is_expanded INTEGER DEFAULT 0           -- 0 = Hanya K10, 1 = Lanjut PHQ/GAD
);

CREATE TABLE IF NOT EXISTS screening_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    screening_id INTEGER,
    instrument_code TEXT NOT NULL,          -- 'K10', 'PHQ9', 'GAD7'
    item_index INTEGER NOT NULL,
    score_value INTEGER NOT NULL,
    FOREIGN KEY(screening_id) REFERENCES screening_history(id) ON DELETE CASCADE
);
```

---

### C. Kepatuhan Regulasi & Disclaimer Legal (Permenkes No. 16/2024)
* **Bukan Diagnosis:** Pengembang **dilarang keras** menggunakan label kata "Diagnosis", "Surat Rujukan Dokter", atau "Vonis Klinis" pada antarmuka aplikasi.
* **Label Resmi Dokumen PDF:** Gunakan judul **"Lembar Ringkasan Skrining Mandiri"** (*Self-Screening Clinical Summary*).
* **Disclaimer Wajib:** Pada dokumen PDF dan halaman hasil akhir, sertakan teks legal berikut:
  > *"Hasil skrining ini merupakan indikasi penapisan mandiri awal dan bukan merupakan diagnosis medis atau psikologis definitif. Dokumen ini dirancang sebagai lembar ringkasan gejala terstruktur untuk mendukung proses anamnesis oleh dokter/psikolog di fasilitas pelayanan kesehatan atau pusat konseling perguruan tinggi."*
