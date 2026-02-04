import { Button, Text, View } from '@/components/ui';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Yomu</Text>
        <Text style={styles.subtitle}>Get started, sign in or creating an account</Text>
        
        <View style={styles.buttonContainer}>
          <Button variant="primary" size="lg" onPress={() => {router.push("/signin") }}>Sign In</Button>
          <Button variant="secondary" size="lg" onPress={() => {router.push("/signup") }}>Sign Up</Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
});
