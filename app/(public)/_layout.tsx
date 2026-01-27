import { Stack } from 'expo-router';

export default function PublicLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Sign In', headerShown: false }} />
    </Stack>
  );
}
