import { StatusBar } from 'expo-status-bar'
import { Alert, Image, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button, Icon, Text, View } from '@/components/ui'
import { useLoading } from '@/hooks/useLoading'
import { useProfile } from '@/hooks/useProfile'
import { useThemeColor } from '@/hooks/useThemeColor'
import { signOut } from '@/services/auth'
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
  const { profile } = useProfile()
  const backgroundColor = useThemeColor({}, 'background')

  const langLabel = (code: string | null) =>
    code ? (LANGUAGES.find((l) => l.value === code)?.label ?? code) : null

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null

  async function logOut() {
    showLoading('Signing out...', 'typing')
    const { error } = await signOut()
    if (error) Alert.alert(error.message)
    hideLoading()
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor }]} edges={['top']}>
      <View style={styles.avatarRow}>
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <Icon library="Ionicons" name="person-circle" size={72} />
        )}
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
      </View>

      <View style={styles.spacer} />

      <View style={styles.signOutContainer}>
        <Button variant="danger" size="lg" onPress={logOut}>
          Sign Out
        </Button>
      </View>

      {Platform.OS === 'ios' && <StatusBar style="light" />}
    </SafeAreaView>
  )
}
