import { Stack } from 'expo-router'

import { FullscreenModalProvider } from '@/hooks/useFullscreenModal'
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
            <FullscreenModalProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { overflow: 'visible' },
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="reading" />
              </Stack>
            </FullscreenModalProvider>
          </UploadProvider>
        </HomeProvider>
      </ReadingProvider>
    </ProfileProvider>
  )
}
