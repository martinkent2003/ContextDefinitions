import { Stack } from "expo-router";
import { HomeProvider } from "@/hooks/useHome";
import { UploadProvider } from "@/hooks/useUpload";

export default function PrivateLayout() {
  return (
    <HomeProvider>
      <UploadProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="reading" />
        </Stack>
      </UploadProvider>
    </HomeProvider>
  );
}
