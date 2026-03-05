import type { Ionicons } from '@expo/vector-icons'
import { Button, View, Text, Icon } from '@/components/ui'
import { styles } from '@screens/UploadScreen/styles'

type Props = {
  label: string
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
}
export default function UploadActionButton({ label, icon, onPress }: Props) {
  return (
    <>
      <Button size="md" variant="upload" onPress={onPress}>
        <View style={styles.uploadButtonRow}>
          <Icon
            library="Ionicons"
            name={icon}
            size={22}
            style={styles.uploadButtonIcon}
          />
          <Text style={styles.uploadButtonLabel}> {label}</Text>
        </View>
      </Button>
    </>
  )
}
