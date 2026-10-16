import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { colors, typography, radius, spacing } from "../theme";
import { ChevronLeftIcon, SparkleIcon, WindIcon } from "../components/Icons";
import { QuickCloseButton } from "../components/QuickCloseButton";
import { ToolkitDeck } from "../components/ToolkitDeck";
import { CbtReframeCard } from "../components/CbtReframeCard";
import { AmbientPlayer } from "../components/AmbientPlayer";
import { Reset60Flow } from "../components/Reset60Flow";
import { useAppStore } from "../store/appStore";
import { haptics } from "../services/haptics";

import { SpeechPracticeModal } from "../components/SpeechPracticeModal";

interface Props {
  onBack: () => void;
  onOpenCheckIn: () => void;
  onQuickClose: () => void;
}

type Tab = "toolkit" | "reframe" | "reset" | "voice";

const VOICE_SCRIPTS = [
  {
    id: "v1",
    tag: "AFIRMASI JEDA",
    title: "Menenangkan Diri Sendiri",
    script:
      "Aku sedang aman di sini. Hari ini aku tidak perlu menyelesaikan segalanya sekaligus. Mengambil napas satu kali sudah cukup.",
  },
  {
    id: "v2",
    tag: "BATASAN DIRI",
    title: "Menolak Beban Tambahan",
    script:
      "Terima kasih sudah memikirkanku untuk tugas ini, namun prioritasku saat ini sedang penuh sehingga aku belum bisa mengambil tanggung jawab tambahan.",
  },
  {
    id: "v3",
    tag: "DUKUNGAN SOSIAL",
    title: "Meminta Teman Mengobrol",
    script:
      "Aku sedang merasa agak berat hari ini dan butuh teman mengobrol sebentar, apakah kamu punya waktu luang malam ini?",
  },
];

/**
 * Kotak Pertolongan Mandiri (K1/K2/K3/H4/H6).
 * Menyatukan dek kartu teknik, uji ulang pikiran, reset enam puluh detik, dan latihan bicara suara.
 */
export const SelfCareScreen: React.FC<Props> = ({
  onBack,
  onOpenCheckIn,
  onQuickClose,
}) => {
  const [tab, setTab] = useState<Tab>("toolkit");
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState("");
  const [selectedScriptTitle, setSelectedScriptTitle] = useState("");
  const voiceGuide = useAppStore((s) => s.voiceGuide);

  const handleStartVoicePractice = (title: string, script: string) => {
    setSelectedScriptTitle(title);
    setSelectedScript(script);
    setPracticeModalOpen(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.iconBtn}
          accessibilityLabel="Kembali"
        >
          <ChevronLeftIcon size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Kotak Pertolongan Mandiri</Text>
        <QuickCloseButton onPress={onQuickClose} label="" />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Kumpulan teknik praktis yang bisa dicoba dalam hitungan menit.
          Semuanya bekerja tanpa internet dan tanpa akun.
        </Text>

        <View style={styles.tabBar}>
          {(
            [
              { id: "toolkit", label: "Kotak P3K" },
              { id: "reframe", label: "Uji Pikiran" },
              { id: "reset", label: "Reset 60d" },
              { id: "voice", label: "Latih Bicara" },
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
              <Text
                style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === "toolkit" && (
          <View>
            <ToolkitDeck />
            <AmbientPlayer />
          </View>
        )}

        {tab === "reframe" && <CbtReframeCard />}

        {tab === "reset" && <Reset60Flow voiceGuide={voiceGuide} />}

        {tab === "voice" && (
          <View style={styles.voiceSection}>
            <Text style={styles.voiceIntro}>
              Sering kali kita tahu apa yang ingin kita katakan, tetapi lidah terasa kelu. Latih suaramu mengucapkan kalimat-kalimat ini agar menjadi lebih alami.
            </Text>

            {VOICE_SCRIPTS.map((item) => (
              <View key={item.id} style={styles.voiceCard}>
                <View style={styles.voiceCardTop}>
                  <Text style={styles.voiceTag}>{item.tag}</Text>
                  <Text style={styles.voiceTitle}>{item.title}</Text>
                </View>
                <Text style={styles.voiceScript}>"{item.script}"</Text>
                <TouchableOpacity
                  style={styles.voicePracticeBtn}
                  onPress={() => handleStartVoicePractice(item.title, item.script)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.voicePracticeBtnText}>🎙️ Latih dengan Suara</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal Latihan Bicara STT */}
      <SpeechPracticeModal
        visible={practiceModalOpen}
        targetScript={selectedScript}
        title={selectedScriptTitle}
        contextDesc="Ucapkan kalimat ini dengan suara tenang dan perlahan. Biarkan telingamu mendengarkan artikulasi suaramu sendiri."
        onClose={() => setPracticeModalOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  topTitle: { ...typography.headlineMd, color: colors.primary, flexShrink: 1 },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  intro: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  checkinBanner: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  checkinBannerTitle: {
    ...typography.labelLg,
    color: colors.onPrimaryContainer,
  },
  checkinBannerSub: {
    ...typography.bodySm,
    color: colors.onPrimaryContainer,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    padding: 3,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: radius.full,
  },
  tabBtnActive: { backgroundColor: colors.surface },
  tabLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  tabLabelActive: { color: colors.primary },
  footerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginTop: spacing.md,
  },
  footerNoteText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
  voiceSection: {
    gap: spacing.md,
  },
  voiceIntro: {
    ...typography.bodySm,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 4,
  },
  voiceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  voiceCardTop: {
    marginBottom: spacing.xs,
  },
  voiceTag: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: colors.primary,
    letterSpacing: 0.6,
  },
  voiceTitle: {
    ...typography.labelLg,
    color: colors.textPrimary,
    marginTop: 2,
  },
  voiceScript: {
    ...typography.bodySm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
    marginVertical: spacing.sm,
  },
  voicePracticeBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    marginTop: 4,
  },
  voicePracticeBtnText: {
    ...typography.labelSm,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 12,
  },
});
