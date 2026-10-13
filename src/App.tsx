import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './theme';
import { useAppStore } from './store/appStore';
import type { ScreenRoute } from './navigation/routes';
import { HomeScreen } from './screens/HomeScreen';
import { CalmRoomScreen } from './screens/CalmRoomScreen';
import { QuizScreen } from './screens/QuizScreen';
import { ResultScreen } from './screens/ResultScreen';
import { ReferralGuideScreen } from './screens/ReferralGuideScreen';
import { CheckInScreen } from './screens/CheckInScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { StealthScreen } from './screens/StealthScreen';
import { EmergencyInterceptor } from './components/EmergencyInterceptor';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<ScreenRoute>('home');
  const [previousRoute, setPreviousRoute] = useState<ScreenRoute>('home');
  const isInitialized = useAppStore((s) => s.isInitialized);
  const initialize = useAppStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleNavigate = (route: ScreenRoute) => {
    setCurrentRoute(route);
  };

  const handleQuickClose = () => {
    setPreviousRoute(currentRoute);
    setCurrentRoute('stealth');
  };

  const handleExitStealth = () => {
    setCurrentRoute(previousRoute === 'stealth' ? 'home' : previousRoute);
  };

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar
          barStyle={currentRoute === 'stealth' ? 'dark-content' : 'dark-content'}
          backgroundColor={currentRoute === 'stealth' ? '#FFFFFF' : colors.background}
        />
        <View style={styles.container}>
          {currentRoute === 'home' && (
            <HomeScreen onNavigate={handleNavigate} onQuickClose={handleQuickClose} />
          )}

          {currentRoute === 'calm' && (
            <CalmRoomScreen
              onBack={() => setCurrentRoute('home')}
              onQuickClose={handleQuickClose}
            />
          )}

          {currentRoute === 'quiz' && (
            <QuizScreen
              onBack={() => setCurrentRoute('home')}
              onComplete={() => setCurrentRoute('result')}
              onQuickClose={handleQuickClose}
            />
          )}

          {currentRoute === 'result' && (
            <ResultScreen
              onBack={() => setCurrentRoute('home')}
              onOpenReferral={() => setCurrentRoute('referral')}
              onOpenCheckIn={() => setCurrentRoute('checkin')}
              onQuickClose={handleQuickClose}
            />
          )}

          {currentRoute === 'referral' && (
            <ReferralGuideScreen
              onBack={() => setCurrentRoute('result')}
              onQuickClose={handleQuickClose}
            />
          )}

          {currentRoute === 'checkin' && (
            <CheckInScreen
              onBack={() => setCurrentRoute('home')}
              onQuickClose={handleQuickClose}
            />
          )}

          {currentRoute === 'settings' && (
            <SettingsScreen
              onBack={() => setCurrentRoute('home')}
              onQuickClose={handleQuickClose}
            />
          )}

          {currentRoute === 'stealth' && <StealthScreen onExit={handleExitStealth} />}

          {/* Emergency Interceptor global */}
          <EmergencyInterceptor />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
