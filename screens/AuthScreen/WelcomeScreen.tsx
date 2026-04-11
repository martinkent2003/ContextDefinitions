import { useRouter } from 'expo-router'
import { Button, Text, View } from '@/components/ui'
import { consumeSignOutReason } from '@/utils/signOutReason'
import { styles } from '@screens/AuthScreen/styles'

export default function WelcomeScreen() {
  const router = useRouter()
  const signOutMessage = consumeSignOutReason()
  return (
    <View style={styles.welcomeContent}>
      <Text style={styles.welcomeTitle}>Context Definitions</Text>
      {signOutMessage && (
        <Text style={styles.welcomeSignOutMessage}>{signOutMessage}</Text>
      )}
      <Text style={styles.welcomeSubtitle}>
        Build your reading vocabulary, one word at a time.
      </Text>
      <View style={styles.welcomeButtonContainer}>
        <Button variant="primary" size="lg" onPress={() => router.push('/signin')}>
          Sign In
        </Button>
        <Button variant="secondary" size="lg" onPress={() => router.push('/signup')}>
          Sign Up
        </Button>
      </View>
    </View>
  )
}
