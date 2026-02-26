import { Stack } from "expo-router";
import { HomeProvider } from "@/hooks/useHome";
import { UploadProvider } from "@/hooks/useUpload";
import { ReadingProvider } from "@/hooks/useReading";

export default function PrivateLayout() {
  return (
    <HomeProvider>
      <UploadProvider>
        <ReadingProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="reading" />
          </Stack>
        </ReadingProvider>
      </UploadProvider>
    </HomeProvider>
  );
}
