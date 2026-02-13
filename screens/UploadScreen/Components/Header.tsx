
import React, { ComponentProps } from "react";
import { Icon, Text } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import { styles } from "../styles";

type Props = {
  title: string;
  iconName?: ComponentProps<typeof Ionicons>["name"];
  onBack: () => void;
};

export default function Header({ title, iconName, onBack }: Props) {
  return (
    <View style={styles.headerRoot}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon
          library="Ionicons"
          name = "chevron-back" 
          size = {22} 
          />
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Icon
          library="Ionicons"
          style={styles.bookIcon}
          name = { iconName ?? "book-outline"}
          size={40}
        />
      </View>
    </View>
  );
}
