import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { GROUNDING_54321 } from '../content/crisis';
import { CheckIcon, SparkleIcon, MicIcon, SpeakerIcon, SpeakerOffIcon, CloseIcon } from './Icons';
import { haptics } from '../services/haptics';
import { speech } from '../services/speech';
import { voiceInput } from '../services/voiceInput';

const STEPS = GROUNDING_54321;

interface Props {
  voiceGuide?: boolean;
}

/**
 * Teknik Grounding 5-4-3-2-1 dengan pencatatan nyata.
 *
 * Setiap langkah meminta pengguna benar-benar menyebutkan apa yang ia temukan,
 * lewat ketikan atau suara. Prompt dibacakan (TTS) sehingga latihan bisa
 * dijalankan dengan mata tertutup. Tidak ada satu pun jawaban yang disimpan.
 */
export const GroundingCard: React.FC<Props> = ({ voiceGuide = false }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [collected, setCollected] = useState<string[][]>(() => STEPS.map(() => []));
  const [draft, setDraft] = useState('');
  const [listening, setListening] = useState(false);
  const [finished, setFinished] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const barAnim = useRef(new Animated.Value(0)).current;
  const step = STEPS[stepIndex];
  const items = collected[stepIndex];
  const needed = step.step;
  const ready = items.length >= needed;

  const totalCollected = useMemo(
    () => collected.reduce((sum, arr) => sum + arr.length, 0),
    [collected]
  );

  const speakPrompt = useCallback(() => {
    if (!voiceGuide) return;
    void speech.speak(step.prompt);
  }, [step.prompt, voiceGuide]);

  // Bacakan prompt setiap kali langkah berganti (mode suara aktif).
  useEffect(() => {
    if (finished) return;
    speakPrompt();
  }, [stepIndex, finished, speakPrompt]);

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: (stepIndex + Math.min(items.length / needed, 1)) / STEPS.length,
      duration: 280,
      useNativeDriver: false,
    }).start();
  }, [barAnim, stepIndex, items.length, needed]);

  // Hentikan mikrofon & suara saat kartu dilepas.
  useEffect(
    () => () => {
      voiceInput.cancel();
      void speech.stop();
    },
    []
  );

  const addItem = useCallback(
    (raw: string) => {
      const value = raw.trim();
      if (!value) return;
      haptics.tap();
      setCollected((prev) => {
        const next = prev.map((arr) => arr.slice());
        if (next[stepIndex].length >= needed) return prev;
        next[stepIndex].push(value);
        return next;
      });
      setDraft('');
    },
    [needed, stepIndex]
  );

  const removeItem = useCallback(
    (index: number) => {
      haptics.tap();
      setCollected((prev) => {
        const next = prev.map((arr) => arr.slice());
        next[stepIndex].splice(index, 1);
        return next;
      });
    },
    [stepIndex]
  );

  const handleMic = useCallback(async () => {
    if (listening) {
      voiceInput.stop();
      setListening(false);
      return;
    }
    setVoiceNotice(null);
    if (!voiceInput.isSupported()) {
      setVoiceNotice('Pengenalan suara tidak tersedia di perangkat ini. Ketik saja — sama efektifnya.');
      return;
    }
    const ok = await voiceInput.start({
      onInterim: (t) => setDraft(t),
      onFinal: (t) => {
        setListening(false);
        addItem(t);
      },
      onError: (code) => {
        setListening(false);
        if (code === 'not-allowed') {
          setVoiceNotice('Izin mikrofon ditolak. Aktifkan lewat Pengaturan Android bila ingin memakai suara.');
        } else if (code === 'no-speech' || code === 'speech-timeout') {
          setVoiceNotice('Belum terdengar suara. Coba tekan mikrofon lalu bicara lebih dekat.');
        } else {
          setVoiceNotice('Suara belum terbaca. Kamu bisa ketik langsung.');
        }
      },
      onEnd: () => setListening(false),
    });
    if (ok) setListening(true);
  }, [addItem, listening]);

  const goNext = useCallback(() => {
    haptics.tap();
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1);
      setDraft('');
      return;
    }
    voiceInput.cancel();
    haptics.success();
    setFinished(true);
    if (voiceGuide) {
      void speech.speak(
        'Selesai. Kamu baru saja memanggil kembali lima indramu. Tubuhmu ada di sini, di ruangan ini.'
      );
    }
  }, [stepIndex, voiceGuide]);

  const restart = useCallback(() => {
    haptics.tap();
    setCollected(STEPS.map(() => []));
    setStepIndex(0);
    setDraft('');
    setFinished(false);
  }, []);

  if (finished) {
    return (
      <View style={[styles.card, styles.doneCard]}>
        <View style={styles.doneIcon}>
          <CheckIcon size={22} color={colors.tertiary} />
        </View>
        <Text style={styles.doneTitle}>Kamu kembali ke ruangan ini.</Text>
        <Text style={styles.doneBody}>
          Kamu menyebutkan {totalCollected} hal nyata di sekitarmu. Perhatikan bahwa pikiran tadi
          kehilangan sebagian kekuatannya begitu kamu menyebut hal-hal yang benar-benar ada.
        </Text>

        <View style={styles.summaryGrid}>
          {STEPS.map((s, i) => (
            <View key={s.sense} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {s.step} {s.sense}
              </Text>
              <Text style={styles.summaryValue}>{collected[i].length} tercatat</Text>
            </View>
          ))}
        </View>

        <Text style={styles.doneNote}>
          Catatan ini tidak disimpan di mana pun. Begitu kamu menutup kartu ini, semuanya hilang.
        </Text>

        <TouchableOpacity style={styles.doneBtn} onPress={restart} activeOpacity={0.85}>
          <Text style={styles.doneBtnLabel}>Ulangi Latihan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SparkleIcon size={18} color={colors.tertiary} />
        <Text style={styles.title}>Teknik Grounding 5-4-3-2-1</Text>
      </View>

      <View style={styles.voiceRow}>
        <TouchableOpacity
          style={styles.voiceBtn}
          onPress={speakPrompt}
          activeOpacity={0.8}
          accessibilityLabel="Bacakan perintah"
        >
          {voiceGuide ? (
            <SpeakerIcon size={14} color={colors.primary} />
          ) : (
            <SpeakerOffIcon size={14} color={colors.onSurfaceVariant} />
          )}
          <Text style={styles.voiceBtnText}>Bacakan lagi</Text>
        </TouchableOpacity>
        <Text style={styles.voiceHint}>
          {voiceGuide ? 'Mode suara aktif' : 'Aktifkan Mode Suara di Pengaturan'}
        </Text>
      </View>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth }]} />
      </View>

      <Text style={styles.stepTag}>
        Langkah {stepIndex + 1} dari {STEPS.length} • {step.step} {step.sense}
      </Text>
      <Text style={styles.prompt}>{step.prompt}</Text>

      <View style={styles.countRow}>
        <View style={styles.slots}>
          {Array.from({ length: needed }, (_, i) => (
            <View key={i} style={[styles.slot, i < items.length && styles.slotFilled]}>
              {i < items.length ? <CheckIcon size={10} color="#FFFFFF" /> : null}
            </View>
          ))}
        </View>
        <Text style={[styles.countText, ready && styles.countTextReady]}>
          {items.length} / {needed}
        </Text>
      </View>

      {items.length > 0 && (
        <View style={styles.chips}>
          {items.map((it, i) => (
            <TouchableOpacity
              key={`${it}-${i}`}
              style={styles.chip}
              onPress={() => removeItem(i)}
              activeOpacity={0.7}
              accessibilityLabel={`Hapus ${it}`}
            >
              <Text style={styles.chipText} numberOfLines={1}>
                {it}
              </Text>
              <CloseIcon size={10} color={colors.onSecondaryContainer} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={
            listening ? 'Mendengarkan…' : `Tulis satu hal yang bisa kamu ${step.sense}…`
          }
          placeholderTextColor={colors.onSurfaceVariant}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => addItem(draft)}
          returnKeyType="done"
          editable={!listening}
        />
        <TouchableOpacity
          style={[styles.micBtn, listening && styles.micBtnActive]}
          onPress={handleMic}
          activeOpacity={0.85}
          accessibilityLabel={listening ? 'Hentikan suara' : 'Input suara'}
        >
          <MicIcon size={18} color={listening ? '#FFFFFF' : colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addBtn, !draft.trim() && styles.addBtnDisabled]}
          onPress={() => addItem(draft)}
          disabled={!draft.trim()}
          activeOpacity={0.85}
          accessibilityLabel="Tambah"
        >
          <Text style={styles.addBtnLabel}>Tambah</Text>
        </TouchableOpacity>
      </View>

      {voiceNotice && <Text style={styles.notice}>{voiceNotice}</Text>}

      <Text style={styles.sub}>
        Sebutkan pelan-pelan. Jangan terburu-buru — tujuan latihan ini bukan menyelesaikan daftar,
        tapi mengembalikan perhatianmu ke tempat kamu berada sekarang.
      </Text>

      <TouchableOpacity
        style={[styles.btn, !ready && styles.btnMuted]}
        onPress={goNext}
        activeOpacity={0.85}
      >
        <Text style={[styles.btnLabel, !ready && styles.btnLabelMuted]}>
          {stepIndex === STEPS.length - 1
            ? ready
              ? 'Selesaikan Latihan'
              : `Lanjut — sebutkan ${needed} hal dulu`
            : ready
            ? `Lanjut ke ${STEPS[stepIndex + 1].step} ${STEPS[stepIndex + 1].sense}`
            : `Sebutkan ${needed - items.length} hal lagi`}
        </Text>
      </TouchableOpacity>

      {!ready && (
        <TouchableOpacity style={styles.skipBtn} onPress={goNext} activeOpacity={0.7}>
          <Text style={styles.skipLabel}>Lewati langkah ini</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginVertical: spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  title: { ...typography.labelLg, color: colors.primary },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
  },
  voiceBtnText: { ...typography.labelSm, color: colors.primary },
  voiceHint: { ...typography.bodySm, fontSize: 11, color: colors.onSurfaceVariant },
  barTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  barFill: { height: 4, backgroundColor: colors.tertiary },
  stepTag: { ...typography.labelSm, color: colors.tertiary, marginBottom: 4 },
  prompt: { ...typography.headlineMd, color: colors.onSurface, marginBottom: spacing.sm },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  slots: { flexDirection: 'row', gap: 5 },
  slot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotFilled: { backgroundColor: colors.tertiary, borderColor: colors.tertiary },
  countText: { ...typography.labelMd, color: colors.onSurfaceVariant },
  countTextReady: { color: colors.tertiary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '100%',
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  chipText: { ...typography.bodySm, color: colors.onSecondaryContainer, maxWidth: 200 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  input: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm + 4,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  micBtnActive: { backgroundColor: colors.crisis, borderColor: colors.crisis },
  addBtn: {
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: { opacity: 0.4 },
  addBtnLabel: { ...typography.labelMd, color: '#FFFFFF' },
  notice: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.onWarningContainer,
    backgroundColor: colors.warningContainer,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  sub: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.md },
  btn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnMuted: { backgroundColor: colors.surfaceContainerHigh },
  btnLabel: { ...typography.labelMd, color: '#FFFFFF' },
  btnLabelMuted: { color: colors.onSurfaceVariant },
  skipBtn: { paddingVertical: spacing.sm, alignItems: 'center' },
  skipLabel: { ...typography.bodySm, color: colors.onSurfaceVariant, textDecorationLine: 'underline' },
  doneCard: {
    alignItems: 'center',
    backgroundColor: colors.tertiaryContainer,
    borderColor: colors.tertiary,
    paddingVertical: spacing.lg,
  },
  doneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  doneTitle: {
    ...typography.headlineMd,
    color: colors.onTertiaryContainer,
    textAlign: 'center',
    marginBottom: 6,
  },
  doneBody: {
    ...typography.bodyMd,
    color: colors.onTertiaryContainer,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  summaryGrid: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    gap: 6,
    marginBottom: spacing.md,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { ...typography.bodySm, color: colors.onTertiaryContainer, textTransform: 'capitalize' },
  summaryValue: { ...typography.labelSm, color: colors.onTertiaryContainer },
  doneNote: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.onTertiaryContainer,
    textAlign: 'center',
    opacity: 0.85,
    marginBottom: spacing.md,
  },
  doneBtn: {
    alignSelf: 'stretch',
    backgroundColor: colors.tertiary,
    height: 48,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnLabel: { ...typography.labelMd, color: '#FFFFFF' },
});
