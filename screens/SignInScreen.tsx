import { signInWithEmail } from '@/services/auth'
import React, { useState } from 'react'
import { Alert, AppState, ScrollView, StyleSheet } from 'react-native'
import { Button, Icon, Input, View } from '../components/ui'
import { supabase } from '../utils/supabase'

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
  const [loading, setLoading] = useState(false)

  async function signIn() {
    setLoading(true)
    const { error } = await signInWithEmail(email, password)
    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.verticallySpaced}>
        <Input
          leftIcon={<Icon name='envelope' size={20}/> }
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          leftIcon={<Icon name="lock" size={20}/>}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>
      
      <View style={styles.verticallySpaced}>
        <Button variant="primary" size = "lg" disabled={loading} onPress={() => signIn()}>Sign In</Button>
      </View>
      
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    padding: 10,
  },
  verticallySpaced: {
    backgroundColor: 'transparent',
    paddingTop: 4,
    paddingBottom: 4,
  },
})