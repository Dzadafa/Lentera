import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { haptics } from '../services/haptics';

export type BreathPattern = 'box' | 'sigh';

interface Props {
  pattern?: BreathPattern;
  isActive: boolean;
}

/**
 * Lingkaran napas sinkron haptik.
 * Box: Tarik (4s) -> Tahan (4s) -> Hembus (4s) -> Tahan (4s).
 * Sigh: Tarik panjang (4s) -> Tarik pendek (1.5s) -> Hembus perlahan (6s).
 */
export const BreathingCircle: React.FC<Props> = ({ pattern = 'box', isActive }) => {
  const scale = useRef(new Animated.Value(0.65)).current;
  const [phaseText, setPhaseText] = useState<string>('Tarik Napas');
  const [phaseKey, setPhaseKey] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const timerRef = useRef<any | null>(null);

  useEffect(() => {
    if (!isActive) {
      scale.setValue(0.65);
      setPhaseText('Siap Bernapas');
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    let isMounted = true;

    const runBoxCycle = () => {
      if (!isMounted) return;

      // 1. Inhale 4s
      setPhaseKey('inhale');
      setPhaseText('Tarik Napas (4 detik)');
      haptics.breathPhase('inhale');
      Animated.timing(scale, {
        toValue: 1.0,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        if (!isMounted) return;

        // 2. Hold 4s
        setPhaseKey('hold');
        setPhaseText('Tahan (4 detik)');
        haptics.breathPhase('hold');
        setTimeout(() => {
          if (!isMounted) return;

          // 3. Exhale 4s
          setPhaseKey('exhale');
          setPhaseText('Hembuskan Perlahan (4 detik)');
          haptics.breathPhase('exhale');
          Animated.timing(scale, {
            toValue: 0.65,
            duration: 4000,
            useNativeDriver: true,
          }).start(() => {
            if (!isMounted) return;

            // 4. Hold empty 4s
            setPhaseKey('hold');
            setPhaseText('Jeda Sejenak (4 detik)');
            haptics.breathPhase('hold');
            setTimeout(() => {
              if (isMounted) runBoxCycle();
            }, 4000);
          });
        }, 4000);
      });
    };

    runBoxCycle();

    return () => {
      isMounted = false;
      scale.stopAnimation();
    };
  }, [isActive, pattern]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.outerCircle,
          {
            transform: [{ scale }],
            backgroundColor:
              phaseKey === 'inhale'
                ? colors.secondaryContainer
                : phaseKey === 'hold'
                ? colors.primaryContainer
                : colors.surfaceContainerHigh,
          },
        ]}
      >
        <View style={styles.innerCircle}>
          <Text style={styles.phaseLabel}>{phaseText}</Text>
          <Text style={styles.guideSub}>Pejamkan mata, ikuti ritme getaran</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerCircle: {
    width: 260,
    height: 260,
    borderRadius: 130,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.outlineVariant,
  },
  innerCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    elevation: 1,
  },
  phaseLabel: {
    ...typography.headlineMd,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  guideSub: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
