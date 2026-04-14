import { useRouter } from 'expo-router'
import { View, Text, BackButton, IconButton, ActionMenuModal } from '@/components/ui'
import { useReading } from '@/hooks/useReading'
import { useThemeColor } from '@/hooks/useThemeColor'
import { useActionMenu } from '@/screens/ReadingScreen/hooks/useActionMenu'
import { styles } from '@/screens/ReadingScreen/styles'

export default function Header() {
  const { reading } = useReading()
  const router = useRouter()
  const textColor = useThemeColor({}, 'text')
  const { isActionMenuVisible, openActionMenu, closeActionMenu, actions } =
    useActionMenu()

  return (
    <>
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} style={styles.backButton} />
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {reading?.title ?? ''}
        </Text>
        <IconButton
          icon={{ library: 'Ionicons', name: 'settings-outline', size: 22 }}
          onPress={openActionMenu}
        />
      </View>

      <ActionMenuModal
        visible={isActionMenuVisible}
        onClose={closeActionMenu}
        actions={actions}
      />
    </>
  )
}
