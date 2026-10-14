import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { ScreeningResult } from '../types/domain';
import { formatSeverityLabel } from './scoring';

export async function generateAndSharePdfSummary(result: ScreeningResult): Promise<void> {
  const dateStr = new Date(result.createdAt).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const tierLabel =
    result.tier === 'low'
      ? 'Indikasi Ringan / Normal'
      : result.tier === 'moderate'
      ? 'Indikasi Gejala Sedang'
      : 'Indikasi Gejala Tinggi — Disarankan Konsultasi Faskes';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Surat Ringkasan Gejala Skrining Awal</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 40px;
      color: #1B1B23;
      background: #FFFFFF;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #7843E4;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #7843E4;
      margin: 0;
    }
    .subtitle {
      font-size: 12px;
      color: #6E6E7A;
      margin-top: 4px;
    }
    .disclaimer {
      background: #E9DDFD;
      border-left: 4px solid #7843E4;
      padding: 12px 16px;
      font-size: 11px;
      color: #3D148A;
      margin-bottom: 24px;
      border-radius: 8px;
    }
    .card {
      border: 1px solid #E5DFEE;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .card-title {
      font-size: 13px;
      font-weight: 700;
      color: #7843E4;
      margin-bottom: 8px;
    }
    .score-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #EDE8F8;
      font-size: 13px;
    }
    .score-row:last-child {
      border-bottom: none;
    }
    .score-val {
      font-weight: 700;
      color: #7843E4;
    }
    .tier-badge {
      display: inline-block;
      padding: 6px 12px;
      background: #7843E4;
      color: #FFFFFF;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
    }
    .footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #E5DFEE;
      font-size: 10px;
      color: #9A9AA6;
      text-align: center;
    }
    .talking-points {
      background: #F6F3FB;
      padding: 12px;
      border-radius: 8px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">LENTERA — Ringkasan Skrining Awal Mandiri</h1>
    <div class="subtitle">Instrumen DASS-21 (21 Butir) • Dicetak: ${dateStr}</div>
  </div>

  <div class="disclaimer">
    <strong>CATATAN UNTUK TENAGA KESEHATAN / DOKTER:</strong><br>
    Lembar ini berisi hasil skrining mandiri menggunakan instrumen DASS-21 yang diisi oleh pasien secara anonim di perangkat pribadinya. Dokumen ini <strong>bukan merupakan diagnosis medis</strong>, melainkan rangkuman keluhan subjektif 7 hari terakhir untuk mempermudah anamnesis awal di faskes tingkat pertama atau rujukan.
  </div>

  <div class="card">
    <div class="card-title">Klasifikasi Hasil</div>
    <div>${tierLabel}</div>
    <div class="tier-badge">Tier: ${result.tier.toUpperCase()}</div>
  </div>

  <div class="card">
    <div class="card-title">Skor 3 Dimensi DASS-21</div>
    <div class="score-row">
      <span>Depresi</span>
      <span class="score-val">${result.depression.score} / 42 (${formatSeverityLabel(result.depression.severity)})</span>
    </div>
    <div class="score-row">
      <span>Kecemasan</span>
      <span class="score-val">${result.anxiety.score} / 42 (${formatSeverityLabel(result.anxiety.severity)})</span>
    </div>
    <div class="score-row">
      <span>Stres</span>
      <span class="score-val">${result.stress.score} / 42 (${formatSeverityLabel(result.stress.severity)})</span>
    </div>
  </div>

  <div class="card">
    <div class="card-title">Panduan Percakapan Pasien di Loket / Dokter Umum</div>
    <div class="talking-points">
      <em>"Dok/Mbak, saya membawa lembar skrining awal keluhan cemas dan sulit tidur yang sudah mengganggu aktivitas kuliah/bekerja saya. Saya ingin berkonsultasi mengenai keluhan ini dan meminta arahan pemeriksaan lebih lanjut."</em>
    </div>
  </div>

  <div class="footer">
    LENTERA Mobile • 100% On-Device & Zero-Cloud Storage • Tidak memuat identitas pasien
  </div>
</body>
</html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Bagikan Surat Ringkasan Gejala',
      UTI: 'com.adobe.pdf',
    });
  }
}
