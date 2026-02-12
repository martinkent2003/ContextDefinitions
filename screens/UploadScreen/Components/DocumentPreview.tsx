import { View } from "@/components/ui";
import { spacing, radii } from "@/constants/Themes";
import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { useWindowDimensions } from "react-native";
import Pdf from "react-native-pdf";

type Props = {
  fileUri: string;
};

export default function DocumentPreview({ fileUri }: Props) {
  const border = useThemeColor({}, "border");
  const { width } = useWindowDimensions();
  const previewWidth = width - spacing.md * 2;

  return (
    <View
      style={{
        width: previewWidth,
        height: previewWidth * 1.3,
        alignSelf: "center",
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: border,
        overflow: "hidden",
      }}
    >
      <Pdf
        source={{ uri: fileUri }}
        style={{ flex: 1, width: previewWidth }}
        enablePaging
        horizontal
      />
    </View>
  );
}
