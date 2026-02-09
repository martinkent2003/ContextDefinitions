
import React from "react";
import { Icon, Text } from "@/components/ui";
import { TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

type Props = {
  title: string;
  onBack: () => void;
};

export default function Header({ title, onBack }: Props) {
  return (
    <View style={styles.headerRoot}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon
          library="Ionicons"
          name="chevron-back" 
          size={22} 
          />
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Icon
          library="Ionicons"
          style={styles.bookIcon}
          name="book-outline"
          size={40}
        />
      </View>
    </View>
  );
}
