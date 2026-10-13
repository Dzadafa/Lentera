import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, radius, spacing } from '../theme';

const PAPER_H = 196;
const SWEEP_START = 0.06;
const SWEEP_END = 0.86;
const SWEEP_SPAN = SWEEP_END - SWEEP_START;

const N_EMBER = 16;
const N_SMOKE = 7;
const N_ASH = 6;

/** Posisi garis api (px dari atas) pada progres t. */
function frontTopAt(t: number): number {
  const k = Math.min(Math.max((t - SWEEP_START) / SWEEP_SPAN, 0), 1);
  return PAPER_H * (1 - k);
}

interface Props {
  text: string;
  onDone: () => void;
  durationMs?: number;
}

/**
 * Animasi kertas dibakar.
 *
 * Satu `Animated.Value` menggerakkan seluruh lapisan (tepi api, bara, asap, abu)
 * sehingga animasi tetap ringan: tidak ada timer per partikel, semua turunan
 * memakai interpolasi dengan rentang waktu yang berbeda-beda.
 */
export const BurnAnimation: React.FC<Props> = ({ text, onDone, durationMs = 2400 }) => {
  const p = useRef(new Animated.Value(0)).current;

  const embers = useMemo(
    () =>
      Array.from({ length: N_EMBER }, (_, i) => {
        const t0 = SWEEP_START + (SWEEP_SPAN - 0.04) * ((i + 0.5) / N_EMBER);
        const life = 0.2 + ((i * 13) % 5) * 0.02;
        return {
          key: `e${i}`,
          t0,
          t1: Math.min(t0 + life, 1),
          y0: frontTopAt(t0),
          rise: 46 + ((i * 37) % 74),
          drift: ((i * 53) % 61) - 30,
          left: `${6 + ((i * 71) % 88)}%`,
          size: 3 + (i % 3),
        };
      }),
    []
  );

  const smoke = useMemo(
    () =>
      Array.from({ length: N_SMOKE }, (_, j) => {
        const t0 = 0.16 + 0.6 * (j / N_SMOKE);
        return {
          key: `s${j}`,
          t0,
          t1: Math.min(t0 + 0.44, 1),
          y0: frontTopAt(t0) - 4,
          rise: 78 + ((j * 29) % 52),
          drift: ((j * 43) % 51) - 25,
          left: `${14 + ((j * 59) % 72)}%`,
          size: 22 + ((j * 17) % 22),
        };
      }),
    []
  );

  const ash = useMemo(
    () =>
      Array.from({ length: N_ASH }, (_, k) => {
        const t0 = 0.52 + 0.4 * (k / N_ASH);
        return {
          key: `a${k}`,
          t0,
          t1: Math.min(t0 + 0.36, 1),
          y0: frontTopAt(t0),
          fall: 52 + ((k * 31) % 46),
          drift: ((k * 47) % 45) - 22,
          left: `${10 + ((k * 67) % 80)}%`,
          size: 3 + (k % 3),
        };
      }),
    []
  );

  useEffect(() => {
    const anim = Animated.timing(p, {
      toValue: 1,
      duration: durationMs,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) onDone();
    });
    return () => anim.stop();
  }, [durationMs, onDone, p]);

  const clipHeight = p.interpolate({
    inputRange: [SWEEP_START, SWEEP_END],
    outputRange: [PAPER_H, 0],
    extrapolate: 'clamp',
  });

  const frontY = p.interpolate({
    inputRange: [SWEEP_START, SWEEP_END],
    outputRange: [PAPER_H, 0],
    extrapolate: 'clamp',
  });

  const frontOpacity = p.interpolate({
    inputRange: [0, SWEEP_START, SWEEP_START + 0.04, SWEEP_END - 0.06, SWEEP_END, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const glowOpacity = p.interpolate({
    inputRange: [0, SWEEP_START + 0.03, SWEEP_END - 0.08, SWEEP_END, 1],
    outputRange: [0, 0.95, 0.8, 0, 0],
    extrapolate: 'clamp',
  });

  const paperLift = p.interpolate({
    inputRange: [0, 0.08, 1],
    outputRange: [1, 1.018, 1.01],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.stage} accessible={false}>
      <Animated.View style={[styles.paperFrame, { transform: [{ scale: paperLift }] }]}>
        {/* Lapisan kertas yang sudah menjadi arang — terlihat saat kertas utuh menyusut */}
        <LinearGradient
          colors={['#3A342E', '#1C1917', '#0B0A09']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Kertas utuh, terpotong dari bawah ke atas */}
        <Animated.View style={[styles.clip, { height: clipHeight }]}>
          <View style={styles.paperInner}>
            <Text style={styles.paperText} numberOfLines={8}>
              {text}
            </Text>
          </View>
        </Animated.View>

        {/* Tepi membara di garis api */}
        <Animated.View
          pointerEvents="none"
          style={[styles.frontWrap, { opacity: frontOpacity, transform: [{ translateY: frontY }] }]}
        >
          <LinearGradient
            colors={['rgba(255,120,0,0)', 'rgba(255,166,38,0.85)', 'rgba(255,232,150,0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.frontGlow}
          />
          <View style={styles.frontCore} />
          <LinearGradient
            colors={['rgba(255,196,84,0.75)', 'rgba(180,58,10,0.28)', 'rgba(120,40,10,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.frontHalo}
          />
        </Animated.View>

        {/* Cahaya hangat yang naik dari tepi api */}
        <Animated.View
          pointerEvents="none"
          style={[styles.warmWrap, { opacity: glowOpacity, transform: [{ translateY: frontY }] }]}
        >
          <LinearGradient
            colors={['rgba(255,150,40,0.34)', 'rgba(255,150,40,0)']}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Bara api */}
        {embers.map((e) => {
          const inR = [e.t0, e.t1];
          return (
            <Animated.View
              key={e.key}
              pointerEvents="none"
              style={[
                styles.ember,
                {
                  left: e.left as any,
                  width: e.size,
                  height: e.size,
                  borderRadius: e.size / 2,
                  backgroundColor: p.interpolate({
                    inputRange: [e.t0, (e.t0 + e.t1) / 2, e.t1],
                    outputRange: ['#FFE9A8', '#FF8A16', '#8C2B00'],
                    extrapolate: 'clamp',
                  }),
                  opacity: p.interpolate({
                    inputRange: [e.t0, e.t0 + (e.t1 - e.t0) * 0.12, e.t1 - (e.t1 - e.t0) * 0.25, e.t1],
                    outputRange: [0, 1, 1, 0],
                    extrapolate: 'clamp',
                  }),
                  transform: [
                    {
                      translateY: p.interpolate({
                        inputRange: inR,
                        outputRange: [e.y0, e.y0 - e.rise],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      translateX: p.interpolate({
                        inputRange: inR,
                        outputRange: [0, e.drift],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      scale: p.interpolate({
                        inputRange: [
                          e.t0,
                          e.t0 + (e.t1 - e.t0) * 0.25,
                          e.t0 + (e.t1 - e.t0) * 0.5,
                          e.t0 + (e.t1 - e.t0) * 0.75,
                          e.t1,
                        ],
                        outputRange: [1.2, 0.78, 1.15, 0.82, 0.16],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            />
          );
        })}

        {/* Asap */}
        {smoke.map((s) => {
          const inR = [s.t0, s.t1];
          return (
            <Animated.View
              key={s.key}
              pointerEvents="none"
              style={[
                styles.smoke,
                {
                  left: s.left as any,
                  width: s.size,
                  height: s.size,
                  borderRadius: s.size / 2,
                  opacity: p.interpolate({
                    inputRange: [s.t0, s.t0 + (s.t1 - s.t0) * 0.22, s.t1],
                    outputRange: [0, 0.3, 0],
                    extrapolate: 'clamp',
                  }),
                  transform: [
                    {
                      translateY: p.interpolate({
                        inputRange: inR,
                        outputRange: [s.y0, s.y0 - s.rise],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      translateX: p.interpolate({
                        inputRange: inR,
                        outputRange: [0, s.drift],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      scale: p.interpolate({
                        inputRange: inR,
                        outputRange: [0.45, 2.7],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            />
          );
        })}

        {/* Serpihan abu yang jatuh */}
        {ash.map((a) => {
          const inR = [a.t0, a.t1];
          return (
            <Animated.View
              key={a.key}
              pointerEvents="none"
              style={[
                styles.ash,
                {
                  left: a.left as any,
                  width: a.size,
                  height: a.size * 0.7,
                  opacity: p.interpolate({
                    inputRange: [a.t0, a.t0 + (a.t1 - a.t0) * 0.15, a.t1],
                    outputRange: [0, 0.85, 0],
                    extrapolate: 'clamp',
                  }),
                  transform: [
                    {
                      translateY: p.interpolate({
                        inputRange: inR,
                        outputRange: [a.y0, a.y0 + a.fall],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      translateX: p.interpolate({
                        inputRange: inR,
                        outputRange: [0, a.drift],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      scale: p.interpolate({
                        inputRange: inR,
                        outputRange: [1, 0.35],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            />
          );
        })}
      </Animated.View>

      <Animated.Text
        style={[
          styles.caption,
          {
            opacity: p.interpolate({
              inputRange: [0, 0.1, 0.8, 1],
              outputRange: [1, 1, 1, 0.25],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        Membakar dan melepaskan…
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  stage: { alignItems: 'center', marginVertical: spacing.sm },
  paperFrame: {
    width: '100%',
    height: PAPER_H,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#0B0A09',
  },
  clip: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden' },
  paperInner: {
    height: PAPER_H,
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  paperText: { ...typography.bodyMd, color: colors.onSurface, lineHeight: 22 },
  frontWrap: { position: 'absolute', left: 0, right: 0, top: -3, height: 6 },
  frontGlow: { height: 6, width: '100%' },
  frontCore: {
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FFF3C4',
    opacity: 0.9,
  },
  frontHalo: { position: 'absolute', top: 4, left: 0, right: 0, height: 26 },
  warmWrap: { position: 'absolute', left: 0, right: 0, top: -90, height: 90 },
  ember: { position: 'absolute', top: 0 },
  smoke: { position: 'absolute', top: 0, backgroundColor: '#6B6B6B' },
  ash: { position: 'absolute', top: 0, backgroundColor: '#4A4A4A', borderRadius: 1 },
  caption: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: spacing.sm,
  },
});
