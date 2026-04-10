import React, { useState } from 'react'
import { AppState } from 'react-native'
import { useLoading } from '@/hooks/useLoading'
import { resendSignUpOtp, signInWithEmail, verifyOtp } from '@/services/auth'
import { Button, Icon, Input, ScrollView, Text, View } from '@components/ui'
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

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [showOtpRecovery, setShowOtpRecovery] = useState(false)
  const [otpToken, setOtpToken] = useState('')
  const { showLoading, hideLoading } = useLoading()

  async function signIn() {
    setFormError(null)
    showLoading('Signing in...', 'typing')
    const { error } = await signInWithEmail(email, password)
    hideLoading()

    if (error) {
      if (error.message.toLowerCase().includes('not confirmed')) {
        setFormError("Your email isn't verified yet. Request a new code below.")
        setShowOtpRecovery(true)
      } else {
        setFormError(error.message)
      }
    }
  }

  async function handleResend() {
    setFormError(null)
    const { error } = await resendSignUpOtp(email)
    if (error) setFormError(error.message)
  }

  async function handleVerify() {
    setFormError(null)
    showLoading('Verifying...', 'typing')
    const { error } = await verifyOtp(email, otpToken)
    hideLoading()
    if (error) {
      if (error.message.includes('expired') || error.message.includes('invalid')) {
        setFormError('The code is invalid or has expired. Please request a new one.')
      } else {
        setFormError(error.message)
      }
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Welcome back.</Text>
        <Text style={styles.screenSubtitle}>Sign in to continue.</Text>
      </View>

      {formError && <Text style={styles.formError}>{formError}</Text>}

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          leftIcon={<Icon library="FontAwesome" name="envelope" size={20} />}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          keyboardType="email-address"
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          leftIcon={<Icon library="FontAwesome" name="lock" size={20} />}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button variant="primary" size="lg" onPress={() => signIn()}>
          Sign In
        </Button>
      </View>

      {showOtpRecovery && (
        <>
          <View style={[styles.verticallySpaced, styles.mt20]}>
            <Input
              onChangeText={(text) => setOtpToken(text)}
              value={otpToken}
              placeholder="Enter 8-digit code"
              keyboardType="number-pad"
              maxLength={8}
              autoCapitalize={'none'}
            />
          </View>

          <View style={styles.verticallySpaced}>
            <Button
              variant="primary"
              size="lg"
              disabled={otpToken.length !== 8}
              onPress={handleVerify}
            >
              Verify
            </Button>
          </View>

          <View style={styles.verticallySpaced}>
            <Button variant="ghost" size="lg" onPress={handleResend}>
              Resend code
            </Button>
          </View>
        </>
      )}
    </ScrollView>
  )
}
