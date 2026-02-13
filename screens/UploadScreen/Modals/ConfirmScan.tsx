import { Button, Text } from "@/components/ui";
import { spacing } from "@/constants/Themes";
import { useUpload } from "@/hooks/useUpload";
import DocumentScanner from "react-native-document-scanner-plugin";
import React from "react";
import ConfirmModal from "../Components/ConfirmModal";
import ImageCarousel from "../Components/ImageCarousel";

export default function ConfirmScan() {
  const { upload, setImages, isConfirmScanModalVisible, hideConfirmScanModal, processUpload, clearUpload } = useUpload();

  const launchScanner = async () => {
    const { scannedImages, status } = await DocumentScanner.scanDocument();
    if (status === "success" && scannedImages && scannedImages.length > 0) {
      setImages(scannedImages);
    }
  };

  const handleConfirm = async () => {
    hideConfirmScanModal();
    await processUpload();
  };

  const hasImages = upload.images.length > 0;

  return (
    <ConfirmModal
      visible={isConfirmScanModalVisible}
      title="Scan Document"
      icon="scan-outline"
      onCancel={() => { clearUpload(); hideConfirmScanModal(); }}
      onConfirm={handleConfirm}
      confirmDisabled={!hasImages}
    >
      {hasImages && (
        <Text style={{ textAlign: "center", marginBottom: spacing.sm }}>
          {upload.images.length} page{upload.images.length !== 1 ? "s" : ""} scanned
        </Text>
      )}
      <Button
        variant={hasImages ? "secondary" : "primary"}
        onPress={launchScanner}
        style={{ marginHorizontal: spacing.sm, marginBottom: spacing.md }}
      >
        {hasImages ? "Rescan" : "Start Scan"}
      </Button>
      {hasImages && <ImageCarousel imageUris={upload.images} />}
    </ConfirmModal>
  );
}
