import { Stack } from 'expo-router'
import { OnboardingProvider } from '@/hooks/useOnboarding'

export default function PublicLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerTransparent: true,
          headerTitle: '',
        }}
      >
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="signin" options={{ headerShown: true }} />
        <Stack.Screen name="signup" options={{ headerShown: true }} />
        <Stack.Screen name="metadata" options={{ headerShown: true }} />
        <Stack.Screen name="verify" options={{ headerShown: true }} />
      </Stack>
    </OnboardingProvider>
  )
}
