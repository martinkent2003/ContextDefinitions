import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useUpload } from "@/hooks/useUpload";
import Header from "./Components/Header";
import { styles } from "./styles";
import UploadActionButton from "./Components/UploadActionButton";
import UploadText from "./Modals/UploadText";
import ConfirmImages from "./Modals/ConfirmImages";
import { View } from "@/components/ui";

export default function UploadReadingScreen() {
  const router = useRouter();
  const { setFile, showTextModal, showConfirmImages } = useUpload();

  const pickDocumentAsync = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });

    if (!result.canceled) {
      setFile({ uri: result.assets[0].uri, name: result.assets[0].name });
    }
  };

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
          onPress={showConfirmImages}
        />
        <UploadActionButton
          label="Paste Text"
          icon="text-outline"
          onPress={showTextModal}
        />
        <UploadActionButton
          label="Upload File"
          icon="cloud-upload-outline"
          onPress={pickDocumentAsync}
        />
        {/* MODALS */}
        <UploadText />
        <ConfirmImages />
      </View>
    </View>
  );
}
