import SignUpScreen from '@/components/SignUpScreen';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function SignUp() {
  return (
    <SafeAreaView style={styles.container}>
      <SignUpScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
