import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { colors, typography, radius, spacing } from "../theme";
import {
  HeartPulseIcon,
  ShieldLockIcon,
  WindIcon,
  ChartIcon,
  SparkleIcon,
  HourglassIcon,
  ChatHeartIcon,
  SettingsIcon,
} from "../components/Icons";
import { YearActivityGrid } from "../components/YearActivityGrid";
import { useAppStore } from "../store/appStore";
import type { ScreenRoute } from "../navigation/routes";

interface Props {
  onNavigate: (route: ScreenRoute) => void;
  onQuickClose: () => void;
}

export const HomeScreen: React.FC<Props> = ({ onNavigate, onQuickClose }) => {
  const workMode = useAppStore((s) => s.workMode);
  const latest = useAppStore((s) => s.latestScreening);
  const recentCheckIns = useAppStore((s) => s.recentCheckIns);

  const todayStr = new Date().toISOString().split("T")[0];
  const hasCheckedInToday = recentCheckIns.some((c) => c.date === todayStr);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            {workMode ? (
              <HeartPulseIcon size={18} color={colors.onPrimary} />
            ) : (
              <Image
                source={require("../../assets/lentera-icon.png")}
                style={styles.brandLogoImg}
                resizeMode="contain"
              />
            )}
          </View>
          <Text style={styles.brandText}>
            {workMode ? "Catatan Harian" : "Lentera"}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => onNavigate("settings")}
            style={styles.settingsIconBtn}
            accessibilityLabel="Buka Pengaturan"
          >
            <SettingsIcon size={18} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity onPress={onQuickClose} style={styles.stealthBtn}>
            <Text style={styles.stealthLabel}>Mode Aman</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid Aktivitas 365 Hari */}
      {!workMode && <YearActivityGrid checkIns={recentCheckIns} />}

      {/* Banner Cek-in Harian — muncul jika belum check-in hari ini */}
      {!hasCheckedInToday && (
        <TouchableOpacity
          style={styles.checkinBanner}
          onPress={() => onNavigate("checkin")}
          activeOpacity={0.88}
        >
          <View style={styles.checkinBannerTextWrap}>
            <Text style={styles.checkinBannerTitle}>
              Belum mencatat energi hari ini?
            </Text>
            <Text style={styles.checkinBannerSub}>
              Satu ketukan sudah cukup, data tetap lokal
            </Text>
          </View>
          <View style={styles.checkinBadge}>
            <Text style={styles.checkinBadgeText}>Catat</Text>
          </View>
        </TouchableOpacity>
      )}

      <Text style={styles.headline}>
        {workMode
          ? "Catatan hari ini"
          : "Kamu tidak perlu menjelaskan apa pun dulu."}
      </Text>
      <Text style={styles.subheadline}>
        {workMode
          ? "Tulis apa pun yang ingin kamu catat hari ini."
          : "Pilih satu langkah. Kamu bisa berhenti kapan pun."}
      </Text>

      {/* Privasi — ditaruh di atas pintu, bukan sebagai footer. Ini yang meyakinkan pengguna skeptis. */}

      {/* PINTU 1 — Pertolongan instan */}
      <TouchableOpacity
        style={styles.doorPrimary}
        activeOpacity={0.88}
        onPress={() => onNavigate("calm")}
        accessibilityRole="button"
        accessibilityLabel="Aku sedang tidak baik sekarang, buka ruang tenang"
      >
        <View style={styles.doorPrimaryTop}>
          <View style={styles.doorIconCircle}>
            <WindIcon size={22} color={colors.primary} />
          </View>
          <View style={styles.doorTextGroup}>
            <Text style={styles.doorPrimaryTitle}>
              {workMode ? "Mulai sesi fokus" : "Aku sedang tidak baik sekarang"}
            </Text>
            <Text style={styles.doorPrimarySub}>
              {workMode
                ? "Latihan pernapasan 1 menit"
                : "Langsung dibantu bernapas. Tanpa satu pun pertanyaan."}
            </Text>
          </View>
        </View>
        <View style={styles.doorBadgeRow}>
          <View style={styles.doorBadge}>
            <Text style={styles.doorBadgeText}>1 KETUK • 0 PERTANYAAN</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* PINTU 2 — Skrining */}
      <TouchableOpacity
        style={styles.doorSecondary}
        activeOpacity={0.88}
        onPress={() => onNavigate("quiz")}
        accessibilityRole="button"
        accessibilityLabel="Cek kondisi hatimu sekarang"
      >
        <View style={styles.doorSecondaryTop}>
          <View style={styles.doorIconCircleOutline}>
            <HeartPulseIcon size={20} color={colors.secondary} />
          </View>
          <View style={styles.doorTextGroup}>
            <Text style={styles.doorSecondaryTitle}>
              {workMode
                ? "Isi catatan terstruktur"
                : "Cek kondisi hatiku sekarang"}
            </Text>
            <Text style={styles.doorSecondarySub}>
              {workMode
                ? "K-10 sepuluh butir cepat"
                : "Skrining • Bertingkat jika terindikasi"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {latest && (
        <TouchableOpacity
          style={styles.lastResultCard}
          onPress={() => onNavigate("result")}
          activeOpacity={0.85}
        >
          <Text style={styles.lastResultLabel}>HASIL TERAKHIR</Text>
          <Text style={styles.lastResultValue}>
            {new Date(latest.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
          <Text style={styles.lastResultSub}>
            Ketuk untuk membuka kembali ringkasan kamu
          </Text>
        </TouchableOpacity>
      )}

      {/* Ruang pendukung mandiri — tetap satu ketukan per pintu */}
      <Text style={styles.sectionLabel}>
        {workMode
          ? "Latihan & Teknik Mandiri"
          : "Kotak Alat & Pemulihan Mandiri"}
      </Text>

      <TouchableOpacity
        style={styles.roomCard}
        onPress={() => onNavigate("selfcare")}
        activeOpacity={0.85}
      >
        <View style={styles.roomIcon}>
          <SparkleIcon size={18} color={colors.tertiary} />
        </View>
        <View style={styles.roomBody}>
          <Text style={styles.roomTitle}>
            {workMode ? "Kumpulan teknik praktis" : "Kotak Pertolongan Mandiri"}
          </Text>
          <Text style={styles.roomSub}>
            Kartu teknik, uji ulang pikiran, reset 60 detik
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.roomCard}
        onPress={() => onNavigate("burnout")}
        activeOpacity={0.85}
      >
        <View style={styles.roomIcon}>
          <HourglassIcon size={18} color={colors.tertiary} />
        </View>
        <View style={styles.roomBody}>
          <Text style={styles.roomTitle}>
            {workMode ? "Manajemen beban kerja" : "Ruang Kerja Sehat (Burnout)"}
          </Text>
          <Text style={styles.roomSub}>
            Ritual tutup hari, jeda mikro, naskah bicara
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.roomCard}
        onPress={() => onNavigate("support")}
        activeOpacity={0.85}
      >
        <View style={styles.roomIcon}>
          <HeartPulseIcon size={18} color={colors.tertiary} />
        </View>
        <View style={styles.roomBody}>
          <Text style={styles.roomTitle}>
            {workMode
              ? "Direktori faskes & darurat"
              : "Direktori Kampus & Hotline"}
          </Text>
          <Text style={styles.roomSub}>
            Hotline Kemenkes 119 dan layanan konselor kampus
          </Text>
        </View>
      </TouchableOpacity>
      {!workMode && (
        <View style={styles.privacyRow}>
          <ShieldLockIcon size={14} color={colors.onSurfaceVariant} />
          <Text style={styles.privacyText}>
            Semua jawaban tersimpan hanya di perangkat ini. Tidak ada server,
            tidak ada akun.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.xs,
    paddingBottom: 96,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  brandLogoImg: {
    width: 28,
    height: 28,
  },
  brandText: { ...typography.headlineMd, color: colors.primary },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  settingsIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  stealthBtn: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  stealthLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  headline: {
    ...typography.displayLg,
    color: colors.onBackground,
    marginBottom: spacing.xs,
  },
  subheadline: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  checkinBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(120, 67, 228, 0.2)",
  },
  checkinBannerTextWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  checkinBannerTitle: {
    ...typography.labelLg,
    color: colors.onPrimaryContainer,
    fontFamily: "Montserrat-Bold",
  },
  checkinBannerSub: {
    ...typography.bodySm,
    color: colors.onPrimaryContainer,
    marginTop: 2,
    fontSize: 12,
  },
  checkinBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  checkinBadgeText: {
    ...typography.labelSm,
    color: "#FFFFFF",
    fontFamily: "Montserrat-SemiBold",
  },
  doorPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.gapCard,
  },
  doorPrimaryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 4,
  },
  doorIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  doorTextGroup: { flex: 1 },
  doorPrimaryTitle: { ...typography.headlineMd, color: colors.onPrimary },
  doorPrimarySub: {
    ...typography.bodySm,
    color: colors.primaryContainer,
    marginTop: 2,
  },
  doorBadgeRow: { marginTop: spacing.md, flexDirection: "row" },
  doorBadge: {
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  doorBadgeText: {
    ...typography.labelSm,
    color: colors.onPrimary,
    fontSize: 10,
  },
  doorSecondary: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.md,
  },
  doorSecondaryTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 4,
  },
  doorIconCircleOutline: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  doorSecondaryTitle: { ...typography.headlineMd, color: colors.onSurface },
  doorSecondarySub: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  lastResultCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  lastResultLabel: { ...typography.labelSm, color: colors.onPrimaryContainer },
  lastResultValue: {
    ...typography.headlineMd,
    color: colors.onPrimaryContainer,
    marginTop: 2,
  },
  lastResultSub: {
    ...typography.bodySm,
    color: colors.onPrimaryContainer,
    marginTop: 2,
  },
  sectionLabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  roomCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 4,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.sm,
  },
  roomIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.tertiaryContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  roomBody: { flex: 1 },
  roomTitle: { ...typography.labelLg, color: colors.onSurface },
  roomSub: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.chip,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm + 4,
    marginBottom: spacing.md,
  },
  privacyText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
  },
});
