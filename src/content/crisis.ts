export const CRISIS_COPY = {
  gateQuestion: 'Dalam dua minggu terakhir, apakah kamu pernah berpikir untuk mengakhiri hidup atau menyakiti diri sendiri?',
  gateHelper: 'Jawaban kamu tidak disimpan dan tidak dibagikan ke siapa pun.',
  interceptorTitle: 'Kamu tidak sendirian',
  interceptorBody:
    'Yang kamu rasakan berat, dan itu nyata. Bicara dengan orang yang terlatih bisa membantu malam ini juga. Kamu tidak perlu menjelaskan panjang lebar.',
  callLabel: 'Hubungi 119 ekstensi 8',
  closeLabel: 'Tutup, saya masih di sini',
  crisisNote: 'Jika kamu berada dalam bahaya langsung, hubungi 112 atau minta seseorang menemani kamu sekarang.',
} as const;

export const GROUNDING_54321 = [
  { step: 5, sense: 'lihat', prompt: 'Sebutkan 5 hal yang bisa kamu lihat sekarang.' },
  { step: 4, sense: 'sentuh', prompt: 'Sebutkan 4 hal yang bisa kamu sentuh.' },
  { step: 3, sense: 'dengar', prompt: 'Sebutkan 3 suara yang bisa kamu dengar.' },
  { step: 2, sense: 'cium', prompt: 'Sebutkan 2 bau yang bisa kamu cium.' },
  { step: 1, sense: 'rasa', prompt: 'Sebutkan 1 hal yang bisa kamu rasakan di mulut.' },
] as const;
