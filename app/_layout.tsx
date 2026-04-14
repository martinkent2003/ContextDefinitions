import FontAwesome from '@expo/vector-icons/FontAwesome'
import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Redirect, Stack, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import 'react-native-reanimated'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { Colors, spacing } from '@/constants/Themes'
import { useColorScheme } from '@/hooks/useColorScheme'
import { LoadingProvider } from '@/hooks/useLoading'
import { useResponsive } from '@/hooks/useResponsive'
import { SessionProvider, useSession } from '@/hooks/useSession'
import { useThemeColor } from '@/hooks/useThemeColor'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(private)',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const backgroundColor = useThemeColor({}, 'background')
  const { isMobile } = useResponsive()
  const [isMounted, setIsMounted] = useState(false)
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Excalifont: require('../assets/fonts/Excalifont-Regular.ttf'),
    ...FontAwesome.font,
  })

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <LoadingProvider>
      <GestureHandlerRootView
        style={[styles.root, Platform.OS === 'web' && isMounted && { backgroundColor }]}
      >
        <View
          style={[
            Platform.OS === 'web' && !isMobile ? styles.webPadding : styles.root,
            Platform.OS === 'web' && isMounted && { backgroundColor },
            Platform.OS === 'web' && isMobile && styles.webMobileSafeArea,
          ]}
        >
          <SafeAreaProvider>
            <SessionProvider>
              <RootLayoutNav />
            </SessionProvider>
          </SafeAreaProvider>
        </View>
      </GestureHandlerRootView>
    </LoadingProvider>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webPadding: {
    flex: 1,
    paddingHorizontal: spacing.xxxxl,
    paddingTop: spacing.xl,
    overflow: 'visible',
  },
  webMobileSafeArea: {
    flex: 1,
    paddingTop: 'env(safe-area-inset-top)' as unknown as number,
  },
})

function RootLayoutNav() {
  const colorScheme = useColorScheme()
  const { session, isLoading } = useSession()
  const segments = useSegments()

  if (isLoading) {
    return null
  }

  const inAuthGroup = segments[0] === '(public)'

  const scheme = colorScheme === 'dark' ? 'dark' : 'light'
  const navTheme = {
    ...DefaultTheme,
    dark: scheme === 'dark',
    colors: {
      primary: Colors[scheme].tint,
      background: Colors[scheme].background,
      card: Colors[scheme].cardBackground,
      text: Colors[scheme].text,
      border: Colors[scheme].border,
      notification: Colors[scheme].error,
    },
  }

  return (
    <ThemeProvider value={navTheme}>
      <Stack>
        <Stack.Screen
          name="(private)"
          options={{ headerShown: false, contentStyle: { overflow: 'visible' } }}
        />
        <Stack.Screen
          name="(public)"
          options={{ headerShown: false, contentStyle: { overflow: 'visible' } }}
        />
      </Stack>
      {!session && !inAuthGroup && <Redirect href="/(public)/welcome" />}
      {session && inAuthGroup && <Redirect href="/(private)/(tabs)/home" />}
    </ThemeProvider>
  )
}
