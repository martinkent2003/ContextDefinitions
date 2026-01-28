import { useThemeColors } from '@/hooks/useThemeColor'
import { signUpWithEmail } from '@/services/auth'
import { LanguageCode, SignUpData } from '@/types/auth'
import { FontAwesome } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { Button, Input, Text } from '@rneui/themed'
import React, { useState } from 'react'
import { Alert, AppState, ScrollView, StyleSheet, View } from 'react-native'
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

export default function Auth() {
  const colors = useThemeColors()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [nativeLanguage, setNativeLanguage] = useState<LanguageCode>('en')
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('ja')

  const [loading, setLoading] = useState(false)


  async function signUp() {
    setLoading(true)
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
    setLoading(false)
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={<FontAwesome  name='envelope' size={20} color={colors.text}/>}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          inputStyle={{ color: colors.text }}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={<FontAwesome name="lock" size={20} color={colors.text}/>}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
          inputStyle={{ color: colors.text }}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Username"
          leftIcon={<FontAwesome name="user" size={20} color={colors.text}/>}
          onChangeText={(text) => setUsername(text)}
          value={username}
          placeholder="Username (min 6 characters)"
          autoCapitalize={'none'}
          inputStyle={{ color: colors.text }}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Full Name"
          leftIcon={<FontAwesome name="id-card" size={20} color={colors.text}/>}
          onChangeText={(text) => setFullName(text)}
          value={fullName}
          placeholder="Your full name"
          inputStyle={{ color: colors.text }}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Native Language</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={nativeLanguage}
            onValueChange={(value) => setNativeLanguage(value)}
          >
            {LANGUAGES.map((lang) => (
              <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
            ))}
          </Picker>
        </View>
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Target Language</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={targetLanguage}
            onValueChange={(value) => setTargetLanguage(value)}
          >
            {LANGUAGES.map((lang) => (
              <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
            ))}
          </Picker>
        </View>
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button title="Sign up" disabled={loading} onPress={() => signUp()} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#86939e',
    marginLeft: 10,
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    marginTop: 10,
    borderColor: '#86939e',
    borderRadius: 20,
    marginHorizontal: 20,
  },
})