import { Button, Text } from "@/components/ui";
import { spacing } from "@/constants/Themes";
import { useUpload } from "@/hooks/useUpload";
import * as DocumentPicker from "expo-document-picker";
import React from "react";
import ConfirmModal from "../Components/ConfirmModal";
import DocumentPreview from "../Components/DocumentPreview";

export default function ConfirmFile() {
  const { upload, setFile, isConfirmFileModalVisible, hideConfirmFileModal, processUpload, clearUpload } = useUpload();

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

  const handleConfirm = async () => {
    hideConfirmFileModal();
    await processUpload();
  };

  const hasFile = upload.file !== null;

  return (
    <ConfirmModal
      visible={isConfirmFileModalVisible}
      title="Select File"
      icon="document-outline"
      onCancel={() => { clearUpload(); hideConfirmFileModal(); }}
      onConfirm={handleConfirm}
      confirmDisabled={!hasFile}
    >
      {hasFile && (
        <Text style={{ textAlign: "center", marginBottom: spacing.sm }}>
          {upload.file!.name}
        </Text>
      )}
      <Button
        variant={hasFile ? "secondary" : "primary"}
        onPress={pickDocumentAsync}
        style={{ marginHorizontal: spacing.sm, marginBottom: spacing.md }}
      >
        {hasFile ? "Change File" : "Choose File"}
      </Button>
      {hasFile && <DocumentPreview fileUri={upload.file!.uri} />}
    </ConfirmModal>
  );
}
