import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import type { CheckIn } from '../types/domain';

interface Props {
  checkIns: CheckIn[];
}

interface DayItem {
  dateStr: string;
  isToday: boolean;
  isFuture: boolean;
  isCheckedIn: boolean;
  isPastMissed: boolean;
}

const TOTAL_DAYS = 365;
const ROWS_COUNT = 7; // 7 hari per kolom (seperti GitHub activity grid)

export const YearActivityGrid: React.FC<Props> = ({ checkIns }) => {
  const scrollRef = useRef<ScrollView>(null);

  // Map check-in dates ke Set untuk lookup cepat O(1)
  const checkedDates = useMemo(() => {
    return new Set(checkIns.map((c) => c.date));
  }, [checkIns]);

  // Buat list 365 hari: 300 hari yang lalu sampai 65 hari ke depan, atau 365 hari dalam tahun ini
  const { days, columns, checkedCount } = useMemo(() => {
    const list: DayItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Mulai dari 320 hari yang lalu hingga 44 hari ke depan = 365 hari total
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 320);

    let countChecked = 0;

    for (let i = 0; i < TOTAL_DAYS; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dStr = d.toISOString().split('T')[0];

      const isToday = dStr === todayStr;
      const isFuture = d > today;
      const isCheckedIn = checkedDates.has(dStr);
      const isPastMissed = !isFuture && !isToday && !isCheckedIn;

      if (isCheckedIn) countChecked++;

      list.push({
        dateStr: dStr,
        isToday,
        isFuture,
        isCheckedIn,
        isPastMissed,
      });
    }

    // Kelompokkan menjadi kolom-kolom berisi 7 titik vertikal
    const cols: DayItem[][] = [];
    for (let i = 0; i < list.length; i += ROWS_COUNT) {
      cols.push(list.slice(i, i + ROWS_COUNT));
    }

    return { days: list, columns: cols, checkedCount: countChecked };
  }, [checkedDates]);

  // Auto-scroll ke posisi hari ini saat pertama kali dimuat
  useEffect(() => {
    const timer = setTimeout(() => {
      // Hari ini ada di sekitar kolom ~45 (320 / 7 = ~45)
      // Setiap kolom berjarak 14px (titik 10px + gap 4px)
      const approxOffset = Math.max(0, (320 / 7) * 14 - 100);
      scrollRef.current?.scrollTo({ x: approxOffset, animated: false });
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Aktivitas Cek-in Harian</Text>
        <Text style={styles.counterText}>{checkedCount} hari tercatat</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.gridColumns}>
          {columns.map((col, colIdx) => (
            <View key={`col_${colIdx}`} style={styles.column}>
              {col.map((day) => {
                let dotColor = '#D1D1DB'; // Abu-abu: hari ini atau masa depan belum checkin

                if (day.isCheckedIn) {
                  dotColor = colors.primary; // Ungu LENTERA: sudah check-in
                } else if (day.isPastMissed) {
                  dotColor = colors.error; // Merah: terlewati / belum check-in di hari lalu
                }

                return (
                  <View
                    key={day.dateStr}
                    style={[
                      styles.dot,
                      { backgroundColor: dotColor },
                      day.isToday && styles.todayDot,
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend Keterangan Warna */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Tercatat</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
          <Text style={styles.legendText}>Terlewat</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#D1D1DB' }]} />
          <Text style={styles.legendText}>Hari ini / Nanti</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.labelMd,
    fontFamily: 'Montserrat-Bold',
    color: colors.primary,
  },
  counterText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  gridColumns: {
    flexDirection: 'row',
    gap: 4,
  },
  column: {
    flexDirection: 'column',
    gap: 4,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  todayDot: {
    borderWidth: 1.5,
    borderColor: '#1B1B23',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.sm + 2,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.onSurfaceVariant,
  },
});
