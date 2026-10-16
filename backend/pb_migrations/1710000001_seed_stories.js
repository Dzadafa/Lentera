// pb_migrations/1710000001_seed_stories.js
migrate((db) => {
  const storiesCollection = Dao(db).findCollectionByNameOrId("stories");
  if (!storiesCollection) return;

  const initialStories = [
    {
      author_label: "Mahasiswa tingkat akhir, 22 tahun",
      from_tier: "high",
      now_status: "Sedang menyelesaikan bab empat skripsi",
      quote: "Waktu skor depresiku tinggi, aku pikir ini salahku karena malas.",
      story: "Tiga bulan lalu aku tidak bisa bangun dari tempat tidur sebelum jam dua siang. Setiap buka laptop dada terasa sesak. Yang paling mengubah adalah saat aku berani ke klinik kampus dan bilang ke dokternya: 'Dok, saya tidak bisa tidur dan cemas terus.' Ternyata aku dirujuk dan dapat pendampingan. Aku tidak langsung sembuh besoknya, tapi setidaknya aku tahu ini masalah medis, bukan karakterku yang cacat.",
      action_taken: "Konsultasi dokter umum, lalu dirujuk ke psikolog",
      tags: ["Kondisi tinggi", "Kuliah", "BPJS"],
      is_approved: true
    },
    {
      author_label: "Software engineer junior, 24 tahun",
      from_tier: "moderate",
      now_status: "Menetapkan jam batas laptop mati pukul 19.00",
      quote: "Burnout tidak datang tiba-tiba. Ia datang dari lima puluh keputusan kecil menunda istirahat.",
      story: "Aku selalu bilang 'tanggung satu pekerjaan lagi' sampai akhirnya jam satu dini hari baru tutup laptop. Hasil skriningku waktu itu kondisi sedang. Aku mulai dari hal paling sederhana: memasang alarm jam 18.30 untuk merapikan meja, lalu berjalan kaki lima belas menit tanpa headset. Pikiran yang tadinya terasa seperti kabel kusut mulai punya ruang.",
      action_taken: "Ritual tutup hari dan jeda jalan kaki",
      tags: ["Kondisi sedang", "Pekerja muda", "Kebiasaan"],
      is_approved: true
    },
    {
      author_label: "Fresh graduate, 23 tahun",
      from_tier: "high",
      now_status: "Sudah mulai magang di tempat baru",
      quote: "Menelepon 119 ekstensi 8 pukul sebelas malam adalah keputusan terbaikku tahun ini.",
      story: "Malam itu kepalaku terlalu bising dan aku merasa tidak ada jalan keluar. Aku tidak mau bercerita ke orang tua karena takut mereka memikirkan biaya. Akhirnya aku menekan 119 ekstensi 8. Petugasnya tidak menghakimi, hanya mendengarkan aku menangis selama dua puluh menit dan menemani sampai napasku teratur lagi. Besok paginya aku punya keberanian untuk ke puskesmas.",
      action_taken: "Hotline 119 ekstensi 8, lalu ke puskesmas",
      tags: ["Kondisi tinggi", "Hotline", "Keluarga"],
      is_approved: true
    },
    {
      author_label: "Mahasiswa magister, 26 tahun",
      from_tier: "moderate",
      now_status: "Fokus satu tugas per hari",
      quote: "Aku berhenti merasa bersalah saat mengambil jeda lima menit.",
      story: "Dulu setiap kali istirahat, di kepalaku ada suara yang bilang 'kamu buang-buang waktu'. Belajar teknik jeda mikro membuatku sadar bahwa otak butuh istirahat sama seperti otot butuh relaksasi setelah mengangkat beban. Sekarang aku tidak lagi memaksakan diri bekerja enam jam tanpa henti.",
      action_taken: "Teknik jeda mikro dan uji ulang pikiran (CBT)",
      tags: ["Kondisi sedang", "Kuliah", "Teknik mandiri"],
      is_approved: true
    }
  ];

  for (const s of initialStories) {
    const record = new Record(storiesCollection, s);
    Dao(db).saveRecord(record);
  }

  // Seed sample verified psychologist agar siap diuji
  const psychCollection = Dao(db).findCollectionByNameOrId("psychologists");
  if (psychCollection) {
    const demoPsych = new Record(psychCollection, {
      name: "Rania Wardani, S.Psi.",
      email: "rania.wardani@example.com",
      university: "Universitas Gadjah Mada",
      student_id: "UGM-PSI-2022-094",
      bio: "Fokus pada pendampingan kecemasan akademik, burnout mahasiswa, dan transisi quarter-life crisis.",
      kyc_status: "verified",
      is_online: true,
      is_busy: false
    });
    Dao(db).saveRecord(demoPsych);
  }
});
