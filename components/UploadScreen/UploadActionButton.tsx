import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};
export default function UploadActionButton({ label, icon, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.uploadButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.uploadButtonRow}>
        <Ionicons
          name={icon}
          size={22}
          color="#fff"
          style={styles.uploadButtonIcon}
        />
        <Text style={styles.uploadButtonLabel}> {label}</Text>
      </View>
    </TouchableOpacity>
  );
}
