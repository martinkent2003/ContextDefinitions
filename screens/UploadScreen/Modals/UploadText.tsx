import { Input, TextArea, RadioButton } from "@/components/ui";
import { useUpload } from "@/hooks/useUpload";
import React, { useEffect, useState } from "react";
import ConfirmModal from "../Components/ConfirmModal";

export default function UploadText() {
  const { upload, isTextModalVisible, hideTextModal, setText, clearUpload } = useUpload();

  const [title, setTitle] = useState<string>("");
  const [genre, setGenre] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [privacy, setPrivacy] = useState<boolean>(false);

  useEffect(() => {
    if (upload.text !== null) {
      setContent(upload.text);
    }
  }, [upload.text]);

  const handleConfirm = () => {
    setText(content, title, genre, privacy);
    hideTextModal();
  };

  const handleCancel = () => {
    clearUpload();
    hideTextModal();
  };

  return (
    <ConfirmModal
      visible={isTextModalVisible}
      title="Upload Text"
      icon="text-outline"
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      confirmDisabled={!(content && title && genre)}
    >
      <Input
        placeholder="Enter Title"
        onChangeText={(text) => setTitle(text)}
        autoCapitalize={'words'}
      />
      <Input
        placeholder="Enter Genre"
        onChangeText={(text) => setGenre(text)}
      />
      <TextArea
        multiline
        placeholder="Enter Content"
        value={content}
        onChangeText={(text) => setContent(text)}
      />
      <RadioButton
        label="Privacy"
        subLabel="Choose who can access"
        items={[
          { label: "Public", description: "Shared with everyone", value: "public" },
          { label: "Private", description: "Only yours ;)", value: "private" },
        ]}
        selected={privacy ? "private" : "public"}
        onSelect={(value) => setPrivacy(value === "private")}
      />
    </ConfirmModal>
  );
}
