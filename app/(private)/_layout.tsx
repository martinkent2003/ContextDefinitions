import { Stack } from 'expo-router'

import { HomeProvider } from '@/hooks/useHome'
import { ProfileProvider } from '@/hooks/useProfile'
import { ReadingProvider } from '@/hooks/useReading'
import { UploadProvider } from '@/hooks/useUpload'

export default function PrivateLayout() {
  return (
    <ProfileProvider>
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
    </ProfileProvider>
  )
}
