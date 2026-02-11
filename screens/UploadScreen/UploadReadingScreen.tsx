import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useUpload } from "@/hooks/useUpload";
import Header from "./Components/Header";
import { styles } from "./styles";
import UploadActionButton from "./Components/UploadActionButton";
import ConfirmImages from "./Modals/ConfirmImages";
import { View } from "@/components/ui";
import ConfirmText from "./Modals/ConfirmText";
import ConfirmFile from "./Modals/ConfirmFile";

export default function UploadReadingScreen() {
  const router = useRouter();
  const { setFile, showConfirmTextModal, showConfirmFileModal, showConfirmImageModal } = useUpload();

  return (
    <View style={styles.screen}>
      <Header title="Upload Reading" onBack={() => router.back()} />
      <View style={styles.content}>
        <UploadActionButton
          label="Scan"
          icon="scan-outline"
          onPress={() => {}}
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
      </View>
    </View>
  );
}
