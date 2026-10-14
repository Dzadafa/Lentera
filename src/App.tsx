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
import { SelfCareScreen } from './screens/SelfCareScreen';
import { BurnoutScreen } from './screens/BurnoutScreen';
import { StoryWallScreen } from './screens/StoryWallScreen';
import { PeerSupportScreen } from './screens/PeerSupportScreen';
import { TrendScreen } from './screens/TrendScreen';
import { StealthScreen } from './screens/StealthScreen';
import { WelcomeSplashScreen } from './screens/WelcomeSplashScreen';
import { EmergencyInterceptor } from './components/EmergencyInterceptor';

import { useFonts } from 'expo-font';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Montserrat-Regular': require('../assets/fonts/Montserrat_400Regular.ttf'),
    'Montserrat-Medium': require('../assets/fonts/Montserrat_500Medium.ttf'),
    'Montserrat-SemiBold': require('../assets/fonts/Montserrat_600SemiBold.ttf'),
    'Montserrat-Bold': require('../assets/fonts/Montserrat_700Bold.ttf'),
  });

  const [currentRoute, setCurrentRoute] = useState<ScreenRoute>('home');
  const [previousRoute, setPreviousRoute] = useState<ScreenRoute>('home');
  const isInitialized = useAppStore((s) => s.isInitialized);
  const initialize = useAppStore((s) => s.initialize);
  const markSplashSeen = useAppStore((s) => s.markSplashSeen);

  useEffect(() => {
    if (fontError) {
      console.warn('Gagal memuat font Plus Jakarta Sans:', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    initialize().then(() => {
      const seen = useAppStore.getState().hasSeenSplash;
      if (!seen) {
        setCurrentRoute('splash');
      }
    });
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

  if (!isInitialized || (!fontsLoaded && !fontError)) {
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
          {currentRoute === 'splash' && (
            <WelcomeSplashScreen
              onComplete={async () => {
                await markSplashSeen();
                setCurrentRoute('home');
              }}
            />
          )}

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
              onOpenSelfCare={() => setCurrentRoute('selfcare')}
              onOpenBurnout={() => setCurrentRoute('burnout')}
              onOpenStories={() => setCurrentRoute('stories')}
              onOpenSupport={() => setCurrentRoute('support')}
              onOpenTrend={() => setCurrentRoute('trend')}
              onQuickClose={handleQuickClose}
            />
          )}

          {currentRoute === 'trend' && (
            <TrendScreen
              onBack={() => setCurrentRoute('home')}
              onOpenQuiz={() => setCurrentRoute('quiz')}
              onQuickClose={handleQuickClose}
            />
          )}

          {currentRoute === 'selfcare' && (
            <SelfCareScreen
              onBack={() => setCurrentRoute('home')}
              onOpenCheckIn={() => setCurrentRoute('checkin')}
              onQuickClose={handleQuickClose}
            />
          )}

          {currentRoute === 'burnout' && (
            <BurnoutScreen
              onBack={() => setCurrentRoute('home')}
              onQuickClose={handleQuickClose}
            />
          )}

          {currentRoute === 'stories' && (
            <StoryWallScreen
              onBack={() => setCurrentRoute('home')}
              onQuickClose={handleQuickClose}
            />
          )}

          {currentRoute === 'support' && (
            <PeerSupportScreen
              onBack={() => setCurrentRoute('home')}
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
              onOpenSplash={() => setCurrentRoute('splash')}
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
