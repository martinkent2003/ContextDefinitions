
import React, { ComponentProps } from "react";
import { BackButton, Icon, Text } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { styles } from "@screens/UploadScreen/styles";

type Props = {
  title: string;
  iconName?: ComponentProps<typeof Ionicons>["name"];
  onBack?: () => void;
};

export default function Header({ title, iconName, onBack }: Props) {
  return (
    <View style={styles.headerRoot}>
      {onBack && <BackButton onPress={onBack} style={styles.backButton} />}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Icon
          library="Ionicons"
          style={styles.headerIcon}
          name={ iconName ?? "book-outline"}
          size={40}
        />
      </View>
    </View>
  );
}
