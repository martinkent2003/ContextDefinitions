import { Stack } from 'expo-router'

import { HomeProvider } from '@/hooks/useHome'
import { ReadingProvider } from '@/hooks/useReading'
import { UploadProvider } from '@/hooks/useUpload'

export default function PrivateLayout() {
  return (
    <ReadingProvider>
      <HomeProvider>
        <UploadProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="reading" />
          </Stack>
        </UploadProvider>
      </HomeProvider>
    </ReadingProvider>
  )
}
