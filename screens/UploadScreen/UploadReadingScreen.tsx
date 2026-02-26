import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUpload } from "@/hooks/useUpload";
import Header from "@screens/UploadScreen/Components/Header";
import { styles } from "@screens/UploadScreen/styles";
import UploadActionButton from "@screens/UploadScreen/Components/UploadActionButton";
import ConfirmImages from "@screens/UploadScreen/Modals/ConfirmImages";
import { View } from "@/components/ui";
import ConfirmText from "@screens/UploadScreen/Modals/ConfirmText";
import ConfirmFile from "@screens/UploadScreen/Modals/ConfirmFile";
import ConfirmScan from "@screens/UploadScreen/Modals/ConfirmScan";

export default function UploadReadingScreen() {
  const router = useRouter();
  const { setFile, showConfirmTextModal, showConfirmFileModal, showConfirmImageModal, showConfirmScanModal } = useUpload();

  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Upload Reading"  />
      <View style={styles.content}>
        <UploadActionButton
          label="Scan"
          icon="scan-outline"
          onPress={showConfirmScanModal}
        />
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
        <ConfirmFile/>
        <ConfirmScan />
      </View>
    </SafeAreaView>
  );
}
