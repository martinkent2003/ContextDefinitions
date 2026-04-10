import { useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { Button, Input, ScrollView, Text, View } from '@/components/ui'
import { useLoading } from '@/hooks/useLoading'
import { useOnboarding } from '@/hooks/useOnboarding'
import { resendSignUpOtp, verifyOtp } from '@/services/auth'
import { styles } from '@screens/AuthScreen/styles'

const RESEND_COOLDOWN = 60

export default function VerifyScreen() {
  const [token, setToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  const { email, clearOnboarding } = useOnboarding()
  const { showLoading, hideLoading } = useLoading()
  const router = useRouter()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  async function handleVerify() {
    setError(null)
    showLoading('Verifying...', 'typing')

    const { error: verifyError } = await verifyOtp(email, token)

    if (verifyError) {
      hideLoading()
      if (
        verifyError.message.includes('expired') ||
        verifyError.message.includes('invalid')
      ) {
        setError('The code is invalid or has expired. Please request a new one.')
      } else {
        setError(verifyError.message)
      }
      return
    }

    clearOnboarding()
    hideLoading()
  }

  async function handleResend() {
    setError(null)
    const { error: resendError } = await resendSignUpOtp(email)

    if (resendError) {
      setError(resendError.message)
      return
    }

    setResendCooldown(RESEND_COOLDOWN)
    intervalRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function handleDifferentEmail() {
    router.replace('/signup' as any)
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Check your inbox.</Text>
        <Text style={styles.screenSubtitle}>We sent a verification code to {email}</Text>
      </View>

      {error && <Text style={styles.formError}>{error}</Text>}

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          onChangeText={(text) => setToken(text)}
          value={token}
          placeholder="Enter 8-digit code"
          keyboardType="number-pad"
          maxLength={8}
          autoCapitalize={'none'}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          variant="primary"
          size="lg"
          disabled={token.length !== 8}
          onPress={handleVerify}
        >
          Verify
        </Button>
      </View>

      <View style={styles.verticallySpaced}>
        <Button
          variant="ghost"
          size="lg"
          disabled={resendCooldown > 0}
          onPress={handleResend}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
        </Button>
      </View>

      <View style={styles.verticallySpaced}>
        <Button variant="ghost" size="lg" onPress={handleDifferentEmail}>
          Use a different email
        </Button>
      </View>
    </ScrollView>
  )
}
