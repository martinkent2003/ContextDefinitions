import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Screen
  screen: {
    flex: 1,
    backgroundColor: "#050507",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    marginTop: 50,
  },
  headerRoot: {
    paddingTop: 40, // distance from very top
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
    backgroundColor: "#18181C",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  bookIcon: {
    marginTop: 16,
  },

  // Upload buttons
  uploadButton: {
    backgroundColor: "#18181C",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  uploadButtonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  uploadButtonIcon: {
    marginRight: 12,
  },
  uploadButtonLabel: {
    color: "#FFFFFF",
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
});
