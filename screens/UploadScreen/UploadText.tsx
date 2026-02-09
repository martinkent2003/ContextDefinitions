import { Button, View } from "@/components/ui";
import { Colors, radii, spacing, typography } from "@/constants/Themes";
import { useThemeColor } from "@/hooks/useThemeColor";
import { UploadedFile } from "@/types/upload";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
// create a modal
// the modal needs to have a safeview area
// it should also

type Props = {
  visible: boolean;
  onClose: () => void;
  setDocument: Dispatch<SetStateAction<UploadedFile>>;
};
export default function UploadText({ visible, onClose, setDocument }: Props) {
  const [text, setText] = useState<string>("");
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaProvider>
        <SafeAreaView style={[{ backgroundColor }, styles.container]}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
          >
            <TextInput
              style={[styles.textBox, { color: textColor }]}
              multiline
              onChangeText={(text) => setText(text)}
            ></TextInput>
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
                variant={text ? "primary" : "secondary"}
                disabled={!text}
                onPress={() => {
                  setDocument({
                    images: [],
                    file: null,
                    text: text,
                  });
                  console.log(`document set to ${text}`);
                  setText("");
                  onClose();
                }}
              >
                Confirm
              </Button>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textBox: {
    flex: 1,
    minHeight: 300,
    padding: spacing.sm,
    margin: spacing.sm,
    borderColor: Colors.dark.backgroundSecondary,
    borderWidth: 1,
    borderRadius: radii.sm,
    textAlignVertical: "top",
    fontSize: typography.sizes.md,
  },
});
