import { Stack } from "expo-router";

export default function PublicLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerTitle: '',
      }}
    >
      <Stack.Screen
        name="welcome"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="signin"
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="signup"
        options={{ headerShown: true }}
      />
    </Stack>
  );
}
