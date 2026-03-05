import { useRouter } from 'expo-router'
import { View, Text, BackButton } from '@/components/ui'
import { useReading } from '@/hooks/useReading'
import { useThemeColor } from '@/hooks/useThemeColor'
import { styles } from '@/screens/ReadingScreen/styles'

export default function Header() {
  const { reading } = useReading()
  const router = useRouter()
  const textColor = useThemeColor({}, 'text')

  return (
    <View style={styles.header}>
      <BackButton onPress={() => router.back()} style={styles.backButton} />
      <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
        {reading?.title ?? ''}
      </Text>
    </View>
  )
}
