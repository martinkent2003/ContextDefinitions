import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Button, Icon, Input, Picker, ScrollView, Text, View } from '@/components/ui'
import { useLoading } from '@/hooks/useLoading'
import { useOnboarding } from '@/hooks/useOnboarding'
import { signUpWithEmail } from '@/services/auth'
import { LANGUAGES, type LanguageCode } from '@/types/language'
import { styles } from '@screens/AuthScreen/styles'

export default function MetadataScreen() {
  const {
    email,
    password,
    username,
    setUsername,
    fullName,
    setFullName,
    nativeLanguage,
    setNativeLanguage,
    targetLanguage,
    setTargetLanguage,
  } = useOnboarding()
  const { showLoading, hideLoading } = useLoading()
  const router = useRouter()

  const [usernameTouched, setUsernameTouched] = useState(false)
  const [fullNameTouched, setFullNameTouched] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const usernameValid = username.length >= 6
  const fullNameValid = fullName.trim().length > 0
  const languagesValid = nativeLanguage !== targetLanguage
  const canSubmit = usernameValid && fullNameValid && languagesValid

  async function handleContinue() {
    showLoading('Creating account...', 'typing')

    const { error } = await signUpWithEmail(
      { email, password },
      { username, fullName, nativeLanguage, targetLanguage },
    )

    hideLoading()

    if (error) {
      const message = error.message.includes('Database error saving new user')
        ? 'Could not create account. Your username may already be taken.'
        : error.message
      setFormError(message)
      return
    }

    router.push('/verify' as any)
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Tell us about you.</Text>
        <Text style={styles.screenSubtitle}>
          This helps us personalise your experience.
        </Text>
      </View>

      {formError && <Text style={styles.formError}>{formError}</Text>}

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          leftIcon={<Icon library="FontAwesome" name="user" size={20} />}
          onChangeText={(text) => setUsername(text)}
          onBlur={() => setUsernameTouched(true)}
          value={username}
          placeholder="Username (min 6 characters)"
          autoCapitalize={'none'}
          autoFocus
        />
        {usernameTouched && !usernameValid && username.length > 0 && (
          <Text style={styles.errorText}>Username must be at least 6 characters</Text>
        )}
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          leftIcon={<Icon library="FontAwesome" name="id-card" size={20} />}
          onChangeText={(text) => setFullName(text)}
          onBlur={() => setFullNameTouched(true)}
          value={fullName}
          placeholder="Your full name"
        />
        {fullNameTouched && !fullNameValid && fullName.length > 0 && (
          <Text style={styles.errorText}>Full name is required</Text>
        )}
      </View>

      <View style={styles.verticallySpaced}>
        <Picker
          label="Native Language"
          items={LANGUAGES}
          selectedValue={nativeLanguage}
          onValueChange={(value) => setNativeLanguage(value as LanguageCode)}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Picker
          label="Target Language"
          items={LANGUAGES}
          selectedValue={targetLanguage}
          onValueChange={(value) => setTargetLanguage(value as LanguageCode)}
        />
        {!languagesValid && (
          <Text style={styles.errorText}>
            Target language must be different from native language
          </Text>
        )}
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          variant="primary"
          size="lg"
          disabled={!canSubmit}
          onPress={handleContinue}
        >
          Sign up
        </Button>
      </View>
    </ScrollView>
  )
}
