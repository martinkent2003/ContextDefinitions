import { Button, Input, View, TextArea, ScrollView, RadioButton } from "@/components/ui";
import {  spacing } from "@/constants/Themes";
import { useThemeColor } from "@/hooks/useThemeColor";
import { UploadedFile } from "@/types/upload";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Header from "./Header";
import { styles } from "./styles";
// create a modal
// the modal needs to have a safeview area
// it should also

type Props = {
  visible: boolean;
  onClose: () => void;
  setDocument: Dispatch<SetStateAction<UploadedFile>>;
};
export default function UploadText({ visible, onClose, setDocument }: Props) {

  const [title, setTitle] = useState<string>("");
  const [genre, setGenre] = useState<string>("");
  const [content, setContent] = useState<string>("");  
  const [privacy, setPrivacy] = useState<boolean>(false);
  const backgroundColor = useThemeColor({}, "background");
  const [loading, setLoading] = useState(false)
  
  async function uploadText() {
    setLoading(true)
    setDocument({
      images: [],
      file: null,
      text: content,
    });
    console.log(`Title: ${title}`);
    console.log(`Genre: ${genre}`);
    console.log(`Content: ${content}`);
    console.log(`Privacy: ${privacy}`);
    setLoading(false)
  }

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaProvider>
        <SafeAreaView style={[{ backgroundColor }, styles.container]}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <Header title="Upload Reading" iconName="book" onBack={() => onClose()} />
              <Input
                placeholder="Enter Title"
                onChangeText={(text) => setTitle(text)}
                autoCapitalize= {'words'}
                >
              </Input>
              <Input
                placeholder="Enter Genre"
                onChangeText={(text) => setGenre(text)}>
              </Input>
              <TextArea
                multiline
                placeholder="Enter Content"
                onChangeText={(text) => setContent(text)}
              ></TextArea>
              <RadioButton
                  label="Privacy"
                  items={[
                      { label: "Public", description: "Shared with everyone", value: "public" },
                      { label: "Private", description: "Only yours ;)", value: "private" },
                  ]}
                  selected={privacy ? "private" : "public"}
                  onSelect={(value) => setPrivacy(value === "private")}
              />
              <View
                style={[
                  {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: spacing.sm,
                  },
                  { backgroundColor },
                ]}
              >
                <Button
                  variant="ghost"
                  onPress={() => {
                    setDocument({
                      images: [],
                      file: null,
                      text: null,
                    });
                    console.log(`Document is now empty`);
                    onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant={content ? "primary" : "secondary"}
                  disabled={!content}
                  onPress={() => {
                    uploadText()
                  }}
                >
                  Confirm
                </Button>
              
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}


