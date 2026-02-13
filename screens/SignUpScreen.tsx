import { Button, Icon, Input, Picker, ScrollView, View } from '@/components/ui'
import { signUpWithEmail } from '@/services/auth'
import { useLoading } from '@/hooks/useLoading'
import { LanguageCode, SignUpData } from '@/types/auth'
import React, { useState } from 'react'
import { Alert, AppState, StyleSheet } from 'react-native'
import { supabase } from '../utils/supabase'

const LANGUAGES: { label: string; value: LanguageCode }[] = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Korean', value: 'ko' },
  { label: 'Italian', value: 'it' },
  { label: 'Russian', value: 'ru' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Hindi', value: 'hi' },
]

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

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [nativeLanguage, setNativeLanguage] = useState<LanguageCode>('en')
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('ja')

  const { showLoading, hideLoading } = useLoading()

  async function signUp() {
    showLoading("Creating account...", "typing")
    const signUpData: SignUpData = {
      email,
      password,
      username,
      fullName,
      nativeLanguage,
      targetLanguage,
    }

    const {
      data: { session },
      error,
    } = await signUpWithEmail(signUpData)

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    hideLoading()
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          leftIcon={<Icon library="FontAwesome" name='envelope' size={20}/>}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}

        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          leftIcon={<Icon library="FontAwesome" name="lock" size={20}/>}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}

        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          leftIcon={<Icon library="FontAwesome" name="user" size={20}/>}
          onChangeText={(text) => setUsername(text)}
          value={username}
          placeholder="Username (min 6 characters)"
          autoCapitalize={'none'}

        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          leftIcon={<Icon library="FontAwesome" name="id-card" size={20}/>}
          onChangeText={(text) => setFullName(text)}
          value={fullName}
          placeholder="Your full name"

        />
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
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button variant="primary" size="lg" onPress={() => signUp()}>Sign up</Button>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    marginTop: 100,
    marginBottom: 50,
    padding: 12,
  },
  verticallySpaced: {
    backgroundColor: 'transparent',
    paddingTop: 4,
    paddingBottom: 4,
  },
  mt20: {
    marginTop: 20,
  },
})