import { Button, View } from "@/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import { styles } from "./styles";

type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};
export default function UploadActionButton({ label, icon, onPress }: Props) {
  return (
    <>
      <Button style={styles.uploadButton} onPress={onPress}>
        <View style={styles.uploadButtonRow}>
          <Ionicons
            name={icon}
            size={22}
            color="#fff"
            style={styles.uploadButtonIcon}
          />
          <Text style={styles.uploadButtonLabel}> {label}</Text>
        </View>
      </Button>

      {/* <TouchableOpacity
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
      </TouchableOpacity> */}
    </>
  );
}
