import { UploadedFile } from "@/types/upload";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import Header from "./Header";
import { styles } from "./styles";
import UploadActionButton from "./UploadActionButton";
import UploadText from "./UploadText";
import { View } from "@/components/ui";

export default function UploadReadingScreen() {
  const router = useRouter();
  const [upload, setUpload] = useState<UploadedFile>({
    images: [],
    file: null,
    text: null,
  });

  const [isTextModalVisible, setTextModalVisible] = useState(false);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setUpload({
        images: result.assets.map((asset) => asset.uri),
        file: null,
        text: null,
      });
      alert("Images were picked");
      console.log(...upload.images);
    } else {
      alert("You did not select any image.");
    }
  };
  const pickDocumentAsync = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });

    if (!result.canceled) {
      setUpload({
        images: [],
        file: { uri: result.assets[0].uri, name: result.assets[0].name },
        text: null,
      });
      alert("Document was chosen");
      console.log(upload.file?.uri);
    } else {
      alert("You did not select a file");
    }
  };

  // const handleConfirmText = (text: string) => {
  //   setUpload({
  //     images: [],
  //     file: null,
  //     text,
  //   });
  // };

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
          onPress={pickImageAsync}
        />
        <UploadActionButton
          label="Paste Text"
          icon="text-outline"
          onPress={() => setTextModalVisible(true)}
        />
        {/* <UploadText
          visible={isTextModalVisible}
          onClose={() => setTextModalVisible(false)}
          onConfirm={handleConfirmText}
          initialText={upload.text ?? ""}
        /> */}
        <UploadText
          visible={isTextModalVisible}
          onClose={() => setTextModalVisible(false)}
          setDocument={setUpload}
        />
        <UploadActionButton
          label="Upload File"
          icon="cloud-upload-outline"
          onPress={pickDocumentAsync}
        />
      </View>
    </View>
  );
}
