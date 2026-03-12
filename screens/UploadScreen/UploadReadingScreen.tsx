import { useRouter } from 'expo-router'
import { Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { View } from '@/components/ui'
import { useUpload } from '@/hooks/useUpload'
import Header from '@screens/UploadScreen/Components/Header'
import UploadActionButton from '@screens/UploadScreen/Components/UploadActionButton'
import ConfirmFile from '@screens/UploadScreen/Modals/ConfirmFile'
import ConfirmImages from '@screens/UploadScreen/Modals/ConfirmImages'
import ConfirmScan from '@screens/UploadScreen/Modals/ConfirmScan'
import ConfirmText from '@screens/UploadScreen/Modals/ConfirmText'
import { styles } from '@screens/UploadScreen/styles'

export default function UploadReadingScreen() {
  const router = useRouter()
  const {
    setFile,
    showConfirmTextModal,
    showConfirmFileModal,
    showConfirmImageModal,
    showConfirmScanModal,
  } = useUpload()

  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Upload Reading" />
      <View style={styles.content}>
        {Platform.OS !== 'web' && (
          <UploadActionButton
            label="Scan"
            icon="scan-outline"
            onPress={showConfirmScanModal}
          />
        )}
        <UploadActionButton
          label="Select Image"
          icon="image-outline"
          onPress={showConfirmImageModal}
        />
        <UploadActionButton
          label="Paste Text"
          icon="text-outline"
          onPress={showConfirmTextModal}
        />
        <UploadActionButton
          label="Upload File"
          icon="cloud-upload-outline"
          onPress={showConfirmFileModal}
        />
        {/* MODALS */}
        <ConfirmText />
        <ConfirmImages />
        <ConfirmFile />
        <ConfirmScan />
      </View>
    </SafeAreaView>
  )
}
