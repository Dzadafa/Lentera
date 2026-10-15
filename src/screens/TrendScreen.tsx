import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { colors, typography, radius, spacing, shadows } from "../theme";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  SparkleIcon,
  DocumentIcon,
} from "../components/Icons";
import { QuickCloseButton } from "../components/QuickCloseButton";
import { ScreeningDisclaimer } from "../components/ScreeningDisclaimer";
import { ScreeningTrendChart } from "../components/ScreeningTrendChart";
import { getScreeningTrend, getScreeningById } from "../db";
import type { ScreeningTrendPoint } from "../types/screening_trend";
import { formatSeverityLabel } from "../services/scoring";
import { generateAndSharePdfSummary } from "../services/pdfSummary";
import { haptics } from "../services/haptics";

interface Props {
  onBack?: () => void;
  onOpenQuiz: () => void;
  onQuickClose: () => void;
}

const TIER_META: Record<
  string,
  { label: string; bg: string; fg: string; desc: string }
> = {
  low: {
    label: "Kondisi Rendah",
    bg: colors.tierLowContainer,
    fg: colors.onTierLowContainer,
    desc: "Skor menunjukkan distres psikologis dalam batas rendah/normal.",
  },
  moderate: {
    label: "Kondisi Sedang",
    bg: colors.tierModerateContainer,
    fg: colors.onTierModerateContainer,
    desc: "Terdapat gejala stres atau kecemasan ringan-sedang.",
  },
  high: {
    label: "Kondisi Tinggi",
    bg: colors.tierHighContainer,
    fg: colors.onTierHighContainer,
    desc: "Terindikasi distres tinggi atau gejala lanjutan yang perlu perhatian.",
  },
};

export const TrendScreen: React.FC<Props> = ({
  onBack,
  onOpenQuiz,
  onQuickClose,
}) => {
  const [points, setPoints] = useState<ScreeningTrendPoint[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedPoint, setSelectedPoint] =
    useState<ScreeningTrendPoint | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    void (async () => {
      setPoints(await getScreeningTrend(12));
      setLoaded(true);
    })();
  }, []);

  const handleSelectPoint = (pt: ScreeningTrendPoint) => {
    void haptics.tap();
    setSelectedPoint(pt);
  };

  const closeDetail = () => {
    setSelectedPoint(null);
  };

  const handleExportPdf = async () => {
    if (!selectedPoint) return;
    setIsExporting(true);
    try {
      const fullScreening = await getScreeningById(selectedPoint.id);
      if (fullScreening) {
        await generateAndSharePdfSummary(fullScreening);
      } else {
        // Fallback construct if not found
        await generateAndSharePdfSummary({
          id: selectedPoint.id,
          createdAt: selectedPoint.createdAt,
          depression: {
            raw: selectedPoint.depression,
            score: selectedPoint.depression,
            severity: selectedPoint.tiered?.phq9Severity ?? 'normal',
          },
          anxiety: {
            raw: selectedPoint.anxiety,
            score: selectedPoint.anxiety,
            severity: (selectedPoint.tiered?.gad7Severity as any) ?? 'normal',
          },
          stress: {
            raw: selectedPoint.stress,
            score: selectedPoint.stress,
            severity: 'normal',
          },
          tier: selectedPoint.tier,
          crisisFlag: false,
          answers: [],
          tiered: selectedPoint.tiered,
        });
      }
    } catch {
      Alert.alert(
        "Surat tidak bisa dibuat",
        "PDF gagal dibuat karena penyimpanan perangkat mungkin penuh, atau ada izin yang belum diberikan. Coba periksa ruang penyimpanan dan ulangi.",
        [{ text: "Tutup" }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.iconBtn}
            accessibilityLabel="Kembali"
          >
            <ChevronLeftIcon size={22} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.topTitle}>Riwayat & Tren</Text>
        <QuickCloseButton onPress={onQuickClose} label="" />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loaded && points.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Belum ada riwayat</Text>
            <Text style={styles.emptyBody}>
              Setelah kamu menyelesaikan skrining, arah perubahan skormu akan
              muncul di sini. Data ini hanya tersimpan di perangkatmu.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={onOpenQuiz}
              activeOpacity={0.88}
            >
              <Text style={styles.emptyBtnText}>Mulai skrining sekarang</Text>
            </TouchableOpacity>
          </View>
        )}

        {points.length > 0 && (
          <View>
            <ScreeningTrendChart points={points} />
            <ScreeningDisclaimer condensed />

            <View style={styles.historyHeaderRow}>
              <Text style={styles.sectionTitle}>Riwayat Skrining</Text>
              <Text style={styles.hintText}>Ketuk untuk rincian</Text>
            </View>

            {points
              .slice()
              .reverse()
              .map((p) => {
                const meta = TIER_META[p.tier] ?? TIER_META.low;
                const k10Score = p.tiered?.k10Score ?? p.stress;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.rowCard}
                    activeOpacity={0.7}
                    onPress={() => handleSelectPoint(p)}
                  >
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowDate}>
                        {new Date(p.createdAt).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                      <View
                        style={[styles.tierBadge, { backgroundColor: meta.bg }]}
                      >
                        <Text
                          style={[styles.tierBadgeText, { color: meta.fg }]}
                        >
                          {meta.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.rowRight}>
                      <View style={styles.scorePill}>
                        <Text style={styles.scorePillVal}>{k10Score}/50</Text>
                      </View>
                      <ChevronRightIcon
                        size={18}
                        color={colors.onSurfaceVariant}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
          </View>
        )}
      </ScrollView>

      {/* Modal Detail Hasil Skrining yang di-klik */}
      <Modal
        visible={selectedPoint !== null}
        transparent
        animationType="fade"
        onRequestClose={closeDetail}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Rincian Hasil Skrining</Text>
                {selectedPoint && (
                  <Text style={styles.modalDate}>
                    {new Date(selectedPoint.createdAt).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={closeDetail}
                style={styles.modalCloseBtn}
                accessibilityLabel="Tutup rincian"
              >
                <CloseIcon size={20} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            {selectedPoint && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                {/* Banner Status Tier */}
                {(() => {
                  const meta = TIER_META[selectedPoint.tier] ?? TIER_META.low;
                  return (
                    <View
                      style={[
                        styles.modalTierBox,
                        { backgroundColor: meta.bg },
                      ]}
                    >
                      <Text style={[styles.modalTierLabel, { color: meta.fg }]}>
                        {meta.label}
                      </Text>
                      <Text style={[styles.modalTierDesc, { color: meta.fg }]}>
                        {meta.desc}
                      </Text>
                    </View>
                  );
                })()}

                {/* Skor K-10 */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>
                    Kessler Psychological Distress Scale
                  </Text>
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Total Skor Distres</Text>
                    <Text style={styles.scoreBigValue}>
                      {selectedPoint.tiered?.k10Score ?? selectedPoint.stress} /
                      50
                    </Text>
                  </View>
                  <Text style={styles.scoreSubHint}>
                    {(selectedPoint.tiered?.k10Score ?? selectedPoint.stress) >=
                    25
                      ? "Terindikasi distres tinggi"
                      : "Distres dalam batas ringan / terkendali"}
                  </Text>
                </View>

                {/* Skrining Lanjutan PHQ-9 & GAD-7 jika ada */}
                {selectedPoint.tiered?.openedDeepScreening ? (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>
                      Skrining Lanjutan Spesifik
                    </Text>

                    <View style={styles.scoreRow}>
                      <View>
                        <Text style={styles.scoreLabel}>Depresi</Text>
                        <Text style={styles.scoreSubLabel}>
                          {selectedPoint.tiered.phq9Severity
                            ? formatSeverityLabel(
                                selectedPoint.tiered.phq9Severity,
                              )
                            : "Normal"}
                        </Text>
                      </View>
                      <Text style={styles.scoreValue}>
                        {selectedPoint.tiered.phq9Score ??
                          selectedPoint.depression}{" "}
                        / 27
                      </Text>
                    </View>

                    <View style={styles.modalDivider} />

                    <View style={styles.scoreRow}>
                      <View>
                        <Text style={styles.scoreLabel}>Kecemasan</Text>
                        <Text style={styles.scoreSubLabel}>
                          {selectedPoint.tiered.gad7Severity
                            ? formatSeverityLabel(
                                selectedPoint.tiered.gad7Severity,
                              )
                            : "Normal"}
                        </Text>
                      </View>
                      <Text style={styles.scoreValue}>
                        {selectedPoint.tiered.gad7Score ??
                          selectedPoint.anxiety}{" "}
                        / 21
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.noticeBox}>
                    <SparkleIcon size={16} color={colors.primary} />
                    <Text style={styles.noticeText}>
                      Skor di bawah 25, kondisi dalam batas normal sehingga
                      tidak memerlukan skrining lanjutan.
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.modalPdfBtn}
                  onPress={handleExportPdf}
                  disabled={isExporting}
                  activeOpacity={0.85}
                >
                  {isExporting ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <>
                      <DocumentIcon size={18} color={colors.primary} />
                      <Text style={styles.modalPdfBtnText}>
                        Unduh Ringkasan Gejala (PDF)
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalOkBtn}
                  onPress={closeDetail}
                  activeOpacity={0.88}
                >
                  <Text style={styles.modalOkBtnText}>Tutup</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  topTitle: { ...typography.headlineMd, color: colors.primary, fontSize: 18 },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.xs,
    paddingBottom: 96,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  emptyTitle: {
    ...typography.headlineMd,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  emptyBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  emptyBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
  },
  emptyBtnText: { ...typography.labelMd, color: colors.onPrimary },
  historyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.headlineMd,
    color: colors.primary,
    fontSize: 16,
  },
  hintText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  rowCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  rowLeft: {
    flex: 1,
    gap: 4,
  },
  rowDate: {
    ...typography.labelLg,
    color: colors.onSurface,
    fontSize: 14,
  },
  tierBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  tierBadgeText: {
    ...typography.labelSm,
    fontSize: 10,
    fontFamily: "Montserrat-SemiBold",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  scorePill: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignItems: "center",
  },
  scorePillLabel: {
    ...typography.labelSm,
    fontSize: 9,
    color: colors.primary,
  },
  scorePillVal: {
    ...typography.labelMd,
    fontSize: 12,
    fontFamily: "Montserrat-Bold",
    color: colors.primary,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalCard: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.headlineMd,
    color: colors.primary,
    fontSize: 18,
  },
  modalDate: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  modalScrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  modalTierBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  modalTierLabel: {
    ...typography.labelLg,
    fontFamily: "Montserrat-Bold",
    fontSize: 15,
  },
  modalTierDesc: {
    ...typography.bodySm,
    marginTop: 4,
    fontSize: 12,
  },
  detailSection: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  detailSectionTitle: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreLabel: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  scoreSubLabel: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 1,
  },
  scoreBigValue: {
    ...typography.headlineMd,
    color: colors.primary,
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
  },
  scoreValue: {
    ...typography.headlineMd,
    color: colors.primary,
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
  scoreSubHint: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginTop: 4,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: spacing.sm,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  noticeText: {
    ...typography.bodySm,
    color: colors.primary,
    fontSize: 12,
    flex: 1,
  },
  disclaimerBox: {
    backgroundColor: colors.surfaceContainer,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
  },
  disclaimerText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center",
  },
  modalPdfBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    height: 48,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginTop: spacing.xs,
  },
  modalPdfBtnText: {
    ...typography.labelMd,
    color: colors.primary,
    fontFamily: "Montserrat-SemiBold",
  },
  modalOkBtn: {
    backgroundColor: colors.surfaceContainer,
    height: 44,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  modalOkBtnText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontFamily: "Montserrat-SemiBold",
  },
});
