import UploadReadingScreen from "@/components/UploadScreen/UploadReadingScreen";
import { StyleSheet } from "react-native";

export default function TabTwoScreen() {
  return <UploadReadingScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
