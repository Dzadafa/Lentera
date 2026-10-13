import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import type { ScreeningTrendPoint } from '../types/dass_trend';

interface Props {
  points: ScreeningTrendPoint[];
}

const W = 280;
const H = 110;
const PAD = 12;
const MAX_SCORE = 42;

const DIMENSIONS = [
  { key: 'depression' as const, label: 'Depresi', color: colors.tierHigh },
  { key: 'anxiety' as const, label: 'Kecemasan', color: colors.tierModerate },
  { key: 'stress' as const, label: 'Stres', color: colors.tertiary },
];

/**
 * Grafik tren tiga dimensi DASS-21 (C5).
 * Digambar dengan `View` murni tanpa pustaka grafik, supaya bundel tetap ringan.
 */
export const DassTrendChart: React.FC<Props> = ({ points }) => {
  const series = useMemo(() => {
    const n = points.length;
    const dx = n <= 1 ? 0 : (W - PAD * 2) / (n - 1);
    return DIMENSIONS.map((dim) => ({
      ...dim,
      coords: points.map((p, i) => ({
        x: PAD + i * dx,
        y: H - PAD - (Math.min(p[dim.key], MAX_SCORE) / MAX_SCORE) * (H - PAD * 2),
      })),
    }));
  }, [points]);

  const latest = points[points.length - 1];
  const prev = points.length > 1 ? points[points.length - 2] : null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Tren Skor Skrining</Text>
      <Text style={styles.sub}>
        {points.length} skrining terakhir, disimpan lokal di perangkat. Grafik ini bukan penilaian
        medis, hanya cermin untuk melihat arah perubahanmu.
      </Text>

      <View style={styles.chart}>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <View key={g} style={[styles.gridLine, { top: PAD + g * (H - PAD * 2) }]} />
        ))}

        {series.map((s) =>
          s.coords.slice(0, -1).map((c, i) => {
            const next = s.coords[i + 1];
            const dx = next.x - c.x;
            const dy = next.y - c.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            return (
              <View
                key={`${s.key}-seg-${i}`}
                style={[
                  styles.segment,
                  {
                    left: (c.x + next.x) / 2 - len / 2,
                    top: (c.y + next.y) / 2 - 1,
                    width: len,
                    transform: [{ rotate: `${angle}deg` }],
                    backgroundColor: s.color,
                  },
                ]}
              />
            );
          })
        )}

        {series.map((s) =>
          s.coords.map((c, i) => (
            <View
              key={`${s.key}-dot-${i}`}
              style={[
                styles.dot,
                { left: c.x - 3.5, top: c.y - 3.5, backgroundColor: s.color },
                i === s.coords.length - 1 && styles.dotLatest,
              ]}
            />
          ))
        )}
      </View>

      <View style={styles.legend}>
        {DIMENSIONS.map((d) => {
          const delta = prev ? latest[d.key] - prev[d.key] : 0;
          return (
            <View key={d.key} style={styles.legendRow}>
              <View style={[styles.legendSwatch, { backgroundColor: d.color }]} />
              <Text style={styles.legendLabel}>{d.label}</Text>
              <Text style={styles.legendValue}>{latest[d.key]}</Text>
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
                  {delta > 0 ? `+${delta}` : delta === 0 ? 'sama' : String(delta)}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      <Text style={styles.footnote}>
        Angka makin kecil berarti gejala makin ringan. Bila tiga kali berturut-turut naik,
        pertimbangkan membawa cetakan ringkasan gejala ke faskes terdekat.
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
  sub: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: spacing.sm, marginTop: 2 },
  chart: { height: H, position: 'relative', marginBottom: spacing.sm },
  gridLine: {
    position: 'absolute',
    left: PAD,
    right: PAD,
    height: 1,
    backgroundColor: colors.surfaceContainerHigh,
  },
  segment: { position: 'absolute', height: 2.5, borderRadius: 2 },
  dot: { position: 'absolute', width: 7, height: 7, borderRadius: 4 },
  dotLatest: { width: 9, height: 9, borderRadius: 5, borderWidth: 2, borderColor: colors.surface },
  legend: { gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: { ...typography.bodySm, color: colors.onSurface, flex: 1 },
  legendValue: { ...typography.labelMd, color: colors.onSurface },
  legendDelta: { ...typography.labelSm, width: 44, textAlign: 'right' },
  footnote: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
  },
});
