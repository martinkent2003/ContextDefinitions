import { Button, Text } from "@/components/ui";
import { spacing } from "@/constants/Themes";
import { useUpload } from "@/hooks/useUpload";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import ConfirmModal from "../Components/ConfirmModal";
import ImageCarousel from "../Components/ImageCarousel";

export default function ConfirmImages() {
  const { upload, setImages, isConfirmImagesVisible, hideConfirmImages, clearUpload } = useUpload();

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 1,
      presentationStyle: ImagePicker.UIImagePickerPresentationStyle.PAGE_SHEET,
    });

    if (!result.canceled) {
      setImages(result.assets.map((asset) => asset.uri));
    }
  };

  const hasImages = upload.images.length > 0;

  return (
    <ConfirmModal
      visible={isConfirmImagesVisible}
      title="Select Images"
      icon="images-outline"
      onCancel={() => { clearUpload(); hideConfirmImages(); }}
      onConfirm={hideConfirmImages}
      confirmDisabled={!hasImages}
    >
      {hasImages && (
        <Text style={{ textAlign: "center", marginBottom: spacing.sm }}>
          {upload.images.length} image{upload.images.length !== 1 ? "s" : ""} selected
        </Text>
      )}
      <Button
        variant={hasImages ? "secondary" : "primary"}
        onPress={pickImageAsync}
        style={{ marginHorizontal: spacing.sm, marginBottom: spacing.md }}
      >
        {hasImages ? "Change Selection" : "Choose Images"}
      </Button>
      {hasImages && <ImageCarousel imageUris={upload.images} />}
    </ConfirmModal>
  );
}
