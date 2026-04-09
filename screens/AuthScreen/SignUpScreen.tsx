import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { AppState } from 'react-native'
import { Button, Icon, Input, ScrollView, Text, View } from '@/components/ui'
import { useOnboarding } from '@/hooks/useOnboarding'
import { styles } from '@screens/AuthScreen/styles'
import { supabase } from '@utils/supabase'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  const { setEmail: setOnboardingEmail, setPassword: setOnboardingPassword } =
    useOnboarding()
  const router = useRouter()

  const emailValid = EMAIL_REGEX.test(email)
  const passwordValid = password.length >= 6
  const canSubmit = emailValid && passwordValid

  function handleSignUp() {
    setOnboardingEmail(email)
    setOnboardingPassword(password)
    router.push('/metadata' as any)
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          leftIcon={<Icon library="FontAwesome" name="envelope" size={20} />}
          onChangeText={(text) => setEmail(text)}
          onBlur={() => setEmailTouched(true)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          keyboardType="email-address"
        />
        {emailTouched && !emailValid && email.length > 0 && (
          <Text style={styles.errorText}>Enter a valid email address</Text>
        )}
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          leftIcon={<Icon library="FontAwesome" name="lock" size={20} />}
          onChangeText={(text) => setPassword(text)}
          onBlur={() => setPasswordTouched(true)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
        {passwordTouched && !passwordValid && password.length > 0 && (
          <Text style={styles.errorText}>Password must be at least 6 characters</Text>
        )}
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button variant="primary" size="lg" disabled={!canSubmit} onPress={handleSignUp}>
          Sign up
        </Button>
      </View>
    </ScrollView>
  )
}
