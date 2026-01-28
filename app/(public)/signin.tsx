import SignInScreen from '@/components/SignInScreen';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function SignIn() {
  return (
    <SafeAreaView style={styles.container}>
      <SignInScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
