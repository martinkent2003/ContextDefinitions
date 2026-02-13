import { spacing } from "@/constants/Themes";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Screen
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    marginTop: 30,
  },
  headerRoot: {
    paddingTop: 40, 
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  // Header
  header: {
    alignItems: "center",
    marginBottom: 8,
    marginTop: 20,
  },
  headerWrapper: {
    flex: 1 / 3, // top third of the screen
    justifyContent: "center", // center header within that third
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  bookIcon: {
    marginTop: 16,
  },

  // Upload buttons
  uploadButton: {
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  uploadButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'transparent',
  },
  uploadButtonIcon: {
    marginRight: 12,
  },
  uploadButtonLabel: {
    fontSize: 20,
    fontWeight: "500",
  },

  // Help link
  helpContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: "auto",
  },
  container:{
    flex: 1,
    padding: spacing.xs
  },
  
});
