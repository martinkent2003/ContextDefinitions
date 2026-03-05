import FontAwesome from '@expo/vector-icons/FontAwesome'
import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Redirect, Stack, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import 'react-native-reanimated'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { Colors } from '@/constants/Themes'
import { useColorScheme } from '@/hooks/useColorScheme'
import { LoadingProvider } from '@/hooks/useLoading'
import { SessionProvider, useSession } from '@/hooks/useSession'

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
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <LoadingProvider>
          <SessionProvider>
            <RootLayoutNav />
          </SessionProvider>
        </LoadingProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})

function RootLayoutNav() {
  const colorScheme = useColorScheme()
  const { session, isLoading } = useSession()
  const segments = useSegments()

  if (isLoading) {
    return null
  }

  const inAuthGroup = segments[0] === '(public)'

  const scheme = colorScheme ?? 'light'
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
        <Stack.Screen name="(private)" options={{ headerShown: false }} />
        <Stack.Screen name="(public)" options={{ headerShown: false }} />
      </Stack>
      {!session && !inAuthGroup && <Redirect href="/(public)/welcome" />}
      {session && inAuthGroup && <Redirect href="/(private)/(tabs)/home" />}
    </ThemeProvider>
  )
}
