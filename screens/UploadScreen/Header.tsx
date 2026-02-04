import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

type Props = {
  title: string;
  onBack: () => void;
};

export default function Header({ title, onBack }: Props) {
  return (
    <View style={styles.headerRoot}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="chevron-back" size={22} color="#ffffff" />
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Ionicons
          style={styles.bookIcon}
          name="book-outline"
          color="#fff"
          size={40}
        />
      </View>
    </View>
  );
}
