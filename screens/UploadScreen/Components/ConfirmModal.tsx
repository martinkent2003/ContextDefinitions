import { Button, View, ScrollView } from "@/components/ui";
import { spacing } from "@/constants/Themes";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import React, { ComponentProps } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Header from "./Header";
import { styles } from "../styles";

type Props = {
  visible: boolean;
  title: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
  onCancel: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  children: React.ReactNode;
};

export default function ConfirmModal({
  visible,
  title,
  icon,
  onCancel,
  onConfirm,
  confirmDisabled = false,
  children,
}: Props) {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaProvider>
        <SafeAreaView style={[{ backgroundColor }, styles.container]}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
              <Header title={title} iconName={icon} onBack={onCancel} />
              {children}
              <View
                style={[
                  {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: spacing.sm,
                    marginBottom: spacing.md,
                  },
                  { backgroundColor },
                ]}
              >
                <Button variant="secondary" onPress={onCancel}>
                  Cancel
                </Button>
                <Button
                  variant={confirmDisabled ? "secondary" : "primary"}
                  disabled={confirmDisabled}
                  onPress={onConfirm}
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
