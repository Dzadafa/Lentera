import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, typography, radius, spacing } from "../theme";
import type { ScreeningTrendPoint } from "../types/screening_trend";

interface Props {
  points: ScreeningTrendPoint[];
}

const W = 280;
const H = 110;
const PAD = 12;
const MAX_SCORE = 50;

/**
 * Grafik tren skor skrining (K-10 & skrining bertingkat).
 * Menggunakan View murni tanpa pustaka eksternal agar tetap ringan dan responsif.
 */
export const ScreeningTrendChart: React.FC<Props> = ({ points }) => {
  const series = useMemo(() => {
    const n = points.length;
    const dx = n <= 1 ? 0 : (W - PAD * 2) / (n - 1);
    return points.map((p, i) => {
      // Prioritaskan skor K-10 dari tiered jika ada, atau stress / raw score
      const score = p.tiered?.k10Score ?? p.stress;
      return {
        x: PAD + i * dx,
        y: H - PAD - (Math.min(score, MAX_SCORE) / MAX_SCORE) * (H - PAD * 2),
        score,
        tier: p.tier,
      };
    });
  }, [points]);

  const latest = points[points.length - 1];
  const prev = points.length > 1 ? points[points.length - 2] : null;

  const latestScore = latest?.tiered?.k10Score ?? latest?.stress ?? 0;
  const prevScore = prev?.tiered?.k10Score ?? prev?.stress ?? 0;
  const delta = prev ? latestScore - prevScore : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Tren Distres Psikologis (K-10)</Text>
      <Text style={styles.sub}>
        Grafik perubahan tingkat distres kamu dari waktu ke waktu. Bukan
        diagnosis medis.
      </Text>

      <View style={styles.chart}>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <View
            key={g}
            style={[styles.gridLine, { top: PAD + g * (H - PAD * 2) }]}
          />
        ))}

        {series.map((pt, i) => {
          if (i === 0) return null;
          const prevPt = series[i - 1];
          const segDx = pt.x - prevPt.x;
          const segDy = pt.y - prevPt.y;
          const len = Math.sqrt(segDx * segDx + segDy * segDy);
          const angle = (Math.atan2(segDy, segDx) * 180) / Math.PI;
          return (
            <View
              key={`seg_${i}`}
              style={[
                styles.segment,
                {
                  left: prevPt.x,
                  top: prevPt.y,
                  width: len,
                  transform: [{ rotate: `${angle}deg` }],
                  transformOrigin: "0% 50%",
                  backgroundColor: colors.primary,
                },
              ]}
            />
          );
        })}

        {series.map((pt, i) => (
          <View
            key={`dot_${i}`}
            style={[
              styles.dot,
              {
                left: pt.x - 3.5,
                top: pt.y - 3.5,
                backgroundColor:
                  pt.tier === "high"
                    ? colors.tierHigh
                    : pt.tier === "moderate"
                      ? colors.tierModerate
                      : colors.primary,
              },
              i === series.length - 1 && styles.dotLatest,
            ]}
          />
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View
            style={[styles.legendSwatch, { backgroundColor: colors.primary }]}
          />
          <Text style={styles.legendLabel}>Skor Terakhir</Text>
          <Text style={styles.legendValue}>{latestScore} / 50</Text>
          {prev && (
            <Text
              style={[
                styles.legendDelta,
                {
                  color:
                    delta < 0
                      ? colors.success
                      : delta > 0
                        ? colors.error
                        : colors.onSurfaceVariant,
                },
              ]}
            >
              {delta > 0 ? `+${delta}` : delta === 0 ? "sama" : String(delta)}
            </Text>
          )}
        </View>
      </View>

      <Text style={styles.footnote}>
        Skor &lt; 20 tergolong rendah, 20–24 sedang, dan ≥ 25 menandakan distres
        tinggi yang membuka evaluasi lebih lanjut.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.sm,
  },
  title: { ...typography.labelLg, color: colors.primary },
  sub: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
    marginTop: 2,
  },
  chart: { height: H, position: "relative", marginBottom: spacing.sm },
  gridLine: {
    position: "absolute",
    left: PAD,
    right: PAD,
    height: 1,
    backgroundColor: colors.surfaceContainerHigh,
  },
  segment: { position: "absolute", height: 2.5, borderRadius: 2 },
  dot: { position: "absolute", width: 7, height: 7, borderRadius: 4 },
  dotLatest: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  legend: { gap: 6 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendSwatch: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: { ...typography.bodySm, color: colors.onSurface, flex: 1 },
  legendValue: { ...typography.labelMd, color: colors.onSurface },
  legendDelta: { ...typography.labelSm, width: 44, textAlign: "right" },
  footnote: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
  },
});
