import {
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from 'expo-image-picker'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { Alert, Image, Platform, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'


import { Button, Icon, Text, View } from '@/components/ui'
import { useLoading } from '@/hooks/useLoading'
import { useProfile } from '@/hooks/useProfile'
import { useSession } from '@/hooks/useSession'
import { useThemeColor } from '@/hooks/useThemeColor'
import { signOut } from '@/services/auth'
import { updateProfileAvatarUrl, uploadAvatar } from '@/services/profile'
import { LANGUAGES } from '@/types/language'
import { styles } from '@screens/ProfileScreen/styles'

function InfoRow({ label, value }: { label: string; value: string | null }) {
  const labelColor = useThemeColor({}, 'textSecondary')
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <Text style={styles.value}>{value ?? '—'}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const { showLoading, hideLoading } = useLoading()
  const { profile, refreshProfile } = useProfile()
  const { session } = useSession()
  const backgroundColor = useThemeColor({}, 'background')
  const [avatarError, setAvatarError] = useState(false)

  const langLabel = (code: string | null) =>
    code ? (LANGUAGES.find((l) => l.value === code)?.label ?? code) : null

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null

  async function pickAndUploadAvatar() {
    const { granted } = await requestMediaLibraryPermissionsAsync()
    if (!granted) {
      Alert.alert(
        'Permission required',
        'Allow photo library access to change your avatar.',
      )
      return
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    })
    if (result.canceled) return

    const asset = result.assets[0]
    const ext = asset.uri.split('.').pop()?.split('?')[0] ?? 'jpg'
    showLoading('Uploading avatar...')

    const { url, error: uploadError } = await uploadAvatar(
      session!.user.id,
      asset.base64!,
      ext,
    )
    if (uploadError || !url) {
      Alert.alert('Upload failed', uploadError?.message ?? 'Unknown error')
      hideLoading()
      return
    }

    const { error: updateError } = await updateProfileAvatarUrl(session!.user.id, url)
    if (updateError) Alert.alert('Failed to save avatar', updateError.message)
    else {
      setAvatarError(false)
      await refreshProfile()
    }
    hideLoading()
  }

  async function logOut() {
    showLoading('Signing out...', 'typing')
    const { error } = await signOut()
    if (error) Alert.alert(error.message)
    hideLoading()
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor }]} edges={['top']}>
      <View style={styles.avatarRow}>
        <Pressable
          style={({ pressed }) => [styles.avatarWrapper, { opacity: pressed ? 0.7 : 1 }]}
          onPress={pickAndUploadAvatar}
        >
          {profile?.avatar_url && !avatarError ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={styles.avatar}
              onError={() => setAvatarError(true)}
            />
          ) : (
            <Icon library="Ionicons" name="person-circle" size={72} />
          )}
        </Pressable>
        <Text style={styles.username}>{profile?.username ?? '—'}</Text>
      </View>

      <View style={styles.infoSection}>
        <InfoRow label="Full Name" value={profile?.full_name ?? null} />
        <InfoRow
          label="Native Language"
          value={langLabel(profile?.native_language ?? null)}
        />
        <InfoRow
          label="Target Language"
          value={langLabel(profile?.target_language ?? null)}
        />
        <InfoRow label="Member Since" value={memberSince} />
        <Button variant="danger" size="lg" onPress={logOut} style={styles.signOut}>
          Sign Out
        </Button>
      </View>

      {Platform.OS === 'ios' && <StatusBar style="light" />}
    </SafeAreaView>
  )
}
