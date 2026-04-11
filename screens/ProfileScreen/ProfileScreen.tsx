import {
  launchImageLibraryAsync,
  requestMediaLibraryPermissionsAsync,
} from 'expo-image-picker'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { Alert, Image, Platform, Pressable, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button, Icon, Input, Picker, Text, View } from '@/components/ui'
import { useLoading } from '@/hooks/useLoading'
import { useProfile } from '@/hooks/useProfile'
import { useSession } from '@/hooks/useSession'
import { useThemeColor } from '@/hooks/useThemeColor'
import { signOut, updateProfile } from '@/services/auth'
import { updateProfileAvatarUrl, uploadAvatar } from '@/services/profile'
import type { LanguageCode } from '@/types/language'
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

  const [isEditing, setIsEditing] = useState(false)
  const [editFullName, setEditFullName] = useState('')
  const [editNativeLang, setEditNativeLang] = useState<LanguageCode>('en')
  const [editTargetLang, setEditTargetLang] = useState<LanguageCode>('es')

  const langLabel = (code: string | null) =>
    code ? (LANGUAGES.find((l) => l.value === code)?.label ?? code) : null

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null

  const canSave = editFullName.trim().length > 0 && editNativeLang !== editTargetLang

  function enterEditMode() {
    setEditFullName(profile?.full_name ?? '')
    setEditNativeLang(profile?.native_language ?? 'en')
    setEditTargetLang(profile?.target_language ?? 'es')
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
  }

  async function saveChanges() {
    showLoading('Saving...')
    const { error } = await updateProfile(session!.user.id, {
      username: profile?.username ?? '',
      fullName: editFullName,
      nativeLanguage: editNativeLang,
      targetLanguage: editTargetLang,
    })
    if (error) Alert.alert('Failed to save', error.message)
    else {
      await refreshProfile()
      setIsEditing(false)
    }
    hideLoading()
  }

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
      {/* Avatar row — always visible */}
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
            <Icon library="Ionicons" name="person-circle" size={96} />
          )}
        </Pressable>
        <View style={styles.avatarInfo}>
          <Text style={styles.username}>{profile?.username ?? '—'}</Text>
          <Button
            variant="ghost"
            size="sm"
            style={styles.editButton}
            onPress={isEditing ? cancelEdit : enterEditMode}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </View>
      </View>

      {isEditing ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoSection}>
            <View style={styles.inputRow}>
              <Input
                leftIcon={<Icon library="FontAwesome" name="id-card" size={20} />}
                value={editFullName}
                onChangeText={setEditFullName}
                placeholder="Full name"
              />
            </View>
            <View style={styles.inputRow}>
              <Picker
                label="Native Language"
                items={LANGUAGES}
                selectedValue={editNativeLang}
                onValueChange={(v) => setEditNativeLang(v as LanguageCode)}
              />
            </View>
            <View style={styles.inputRow}>
              <Picker
                label="Target Language"
                items={LANGUAGES}
                selectedValue={editTargetLang}
                onValueChange={(v) => setEditTargetLang(v as LanguageCode)}
              />
            </View>
            <InfoRow label="Member Since" value={memberSince} />
            <View style={styles.editActions}>
              <Button
                variant="primary"
                size="lg"
                onPress={saveChanges}
                disabled={!canSave}
              >
                Save Changes
              </Button>
            </View>
          </View>
        </ScrollView>
      ) : (
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
      )}

      {Platform.OS === 'ios' && <StatusBar style="light" />}
    </SafeAreaView>
  )
}
