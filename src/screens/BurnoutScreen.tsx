import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, typography, radius, spacing } from '../theme';
import { ChevronLeftIcon, DocumentIcon, HourglassIcon } from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import { SHUTDOWN_RITUAL, TALKING_SCRIPTS, MICRO_BREAK } from '../content/burnout';
import { getWinLog, saveWinLog } from '../db';
import { haptics } from '../services/haptics';

interface Props {
  onBack: () => void;
  onQuickClose: () => void;
}

type Tab = 'shutdown' | 'timer' | 'scripts' | 'wins';

const ROLE_LABEL: Record<string, string> = {
  atasan: 'Ke atasan',
  dosen: 'Ke dosen',
  rekan: 'Ke rekan',
};

/**
 * Ruang Kerja Sehat (J1/J2/J3/J4).
 * Ritual tutup hari, jeda mikro, naskah bicara, dan log kemenangan kecil.
 */
export const BurnoutScreen: React.FC<Props> = ({ onBack, onQuickClose }) => {
  const [tab, setTab] = useState<Tab>('shutdown');
  const [wins, setWins] = useState<string[]>(['', '', '']);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [timerLeft, setTimerLeft] = useState(MICRO_BREAK.workMinutes * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    void (async () => {
      const saved = await getWinLog();
      if (saved && saved.length === 3) setWins(saved);
    })();
  }, []);

  useEffect(() => {
    if (!timerRunning) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      setTimerLeft((prev) => {
        if (prev > 1) return prev - 1;
        setIsBreak((b) => {
          const next = !b;
          setTimerLeft((next ? MICRO_BREAK.breakMinutes : MICRO_BREAK.workMinutes) * 60);
          void haptics.success();
          return next;
        });
        return 0;
      });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [timerRunning]);

  const copyScript = async (id: string, text: string) => {
    void haptics.tap();
    await Clipboard.setStringAsync(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const updateWin = async (i: number, val: string) => {
    const next = [...wins];
    next[i] = val;
    setWins(next);
    await saveWinLog(next);
  };

  const mm = String(Math.floor(timerLeft / 60)).padStart(2, '0');
  const ss = String(timerLeft % 60).padStart(2, '0');

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityLabel="Kembali">
          <ChevronLeftIcon size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Ruang Kerja Sehat</Text>
        <QuickCloseButton onPress={onQuickClose} label="" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Alat bantu untuk pekerja muda dan mahasiswa yang kelelahan: menutup hari, jeda mikro,
          naskah bicara, dan catatan kemenangan kecil.
        </Text>

        <View style={styles.tabBar}>
          {(
            [
              { id: 'shutdown', label: 'Tutup Hari' },
              { id: 'timer', label: 'Jeda Mikro' },
              { id: 'scripts', label: 'Latihan Bicara' },
              { id: 'wins', label: 'Kemenangan' },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabBtn, tab === t.id && styles.tabBtnActive]}
              onPress={() => {
                void haptics.tap();
                setTab(t.id);
              }}
            >
              <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'shutdown' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Ritual Tiga Langkah Menutup Hari</Text>
            <Text style={styles.sectionSub}>
              Jangan biarkan hari kerja memanjang sampai jam tidur. Jalankan tiga langkah ini sebelum
              mematikan laptop.
            </Text>
            {SHUTDOWN_RITUAL.map((s) => (
              <View key={s.step} style={styles.ritualCard}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{s.step}</Text>
                </View>
                <View style={styles.ritualBody}>
                  <Text style={styles.ritualTitle}>{s.title}</Text>
                  <Text style={styles.ritualInstruction}>{s.description}</Text>
                  <Text style={styles.ritualPrompt}>{s.prompt}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {tab === 'timer' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Pola Kerja 50/5</Text>
            <Text style={styles.sectionSub}>
              Bekerja lima puluh menit, lalu berhenti total lima menit. Saat jeda tiba, pilih satu
              kegiatan di bawah ini tanpa melihat layar.
            </Text>
            <View style={styles.timerCard}>
              <Text style={styles.timerBig}>
                {mm}:{ss}
              </Text>
              <Text style={styles.timerLabel}>
                {isBreak
                  ? `Sedang jeda ${MICRO_BREAK.breakMinutes} menit`
                  : `Fokus ${MICRO_BREAK.workMinutes} menit`}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.timerBtn}
              onPress={() => {
                void haptics.tap();
                if (!timerRunning) {
                  setTimerLeft((isBreak ? MICRO_BREAK.breakMinutes : MICRO_BREAK.workMinutes) * 60);
                }
                setTimerRunning(!timerRunning);
              }}
              activeOpacity={0.88}
            >
              <HourglassIcon size={18} color={colors.onPrimary} />
              <Text style={styles.timerBtnText}>
                {timerRunning ? 'Jeda pengingat' : 'Mulai pengingat jeda'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.suggestionTitle}>PILIHAN UNTUK LIMA MENIT JEDA</Text>
            {MICRO_BREAK.suggestions.map((s) => (
              <View key={s} style={styles.suggestionRow}>
                <View style={styles.dot} />
                <Text style={styles.suggestionText}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        {tab === 'scripts' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Naskah Siap Pakai</Text>
            <Text style={styles.sectionSub}>
              Banyak orang menahan rasa lelah karena bingung menyusun kata. Salin kalimat ini dan
              sesuaikan dengan kebutuhanmu.
            </Text>
            {TALKING_SCRIPTS.map((s) => (
              <View key={s.id} style={styles.scriptCard}>
                <View style={styles.audienceBadge}>
                  <Text style={styles.audienceText}>{ROLE_LABEL[s.role].toUpperCase()}</Text>
                </View>
                <Text style={styles.scriptSituation}>{s.title}</Text>
                <Text style={styles.scriptContext}>{s.context}</Text>
                <View style={styles.scriptBox}>
                  <Text style={styles.scriptBody}>{s.script}</Text>
                </View>
                <TouchableOpacity style={styles.copyBtn} onPress={() => copyScript(s.id, s.script)}>
                  <DocumentIcon size={16} color={colors.onPrimary} />
                  <Text style={styles.copyBtnText}>
                    {copiedId === s.id ? 'Tersalin' : 'Salin kalimat ini'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {tab === 'wins' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Tiga Kemenangan Kecil</Text>
            <Text style={styles.sectionSub}>
              Otak cenderung menghitung apa yang belum selesai. Catat tiga hal yang berhasil kamu
              lakukan hari ini, sekecil apa pun.
            </Text>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.winRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{i + 1}</Text>
                </View>
                <TextInput
                  style={styles.winInput}
                  placeholder={`Kemenangan kecil #${i + 1} hari ini...`}
                  placeholderTextColor={colors.onSurfaceVariant}
                  value={wins[i]}
                  onChangeText={(v) => {
                    void updateWin(i, v);
                  }}
                />
              </View>
            ))}
            <Text style={styles.winNote}>
              Tersimpan hanya di basis data lokal perangkat ini. Menghapus aplikasi akan
              menghapusnya.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  topTitle: { ...typography.headlineMd, color: colors.primary },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  intro: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginBottom: spacing.md },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    padding: 3,
    marginBottom: spacing.lg,
  },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: radius.full },
  tabBtnActive: { backgroundColor: colors.surface },
  tabLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  tabLabelActive: { color: colors.primary },
  section: { gap: spacing.sm },
  sectionHeading: { ...typography.headlineMd, color: colors.primary },
  sectionSub: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  ritualCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeText: { ...typography.labelSm, color: colors.onPrimaryContainer },
  ritualBody: { flex: 1 },
  ritualTitle: { ...typography.labelLg, color: colors.onSurface, marginBottom: 2 },
  ritualInstruction: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  ritualPrompt: { ...typography.bodySm, color: colors.secondary, marginTop: 4 },
  timerCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  timerBig: { ...typography.displayLg, color: colors.onPrimaryContainer },
  timerLabel: { ...typography.bodySm, color: colors.onPrimaryContainer, marginTop: 4 },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: radius.full,
  },
  timerBtnText: { ...typography.labelMd, color: colors.onPrimary },
  suggestionTitle: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  suggestionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.tertiary },
  suggestionText: { ...typography.bodyMd, color: colors.onSurface, flex: 1 },
  scriptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.sm,
  },
  audienceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginBottom: 4,
  },
  audienceText: { ...typography.labelSm, color: colors.onSurfaceVariant },
  scriptSituation: { ...typography.labelLg, color: colors.onSurface },
  scriptContext: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  scriptBox: {
    backgroundColor: colors.surfaceContainer,
    padding: spacing.sm + 4,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  scriptBody: { ...typography.bodyMd, color: colors.onSurface },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    height: 44,
    borderRadius: radius.full,
  },
  copyBtnText: { ...typography.labelMd, color: colors.onPrimary },
  winRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  winInput: {
    flex: 1,
    minHeight: 44,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  winNote: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
  },
});
