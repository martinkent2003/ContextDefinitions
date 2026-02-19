import { LayoutRectangle, StyleSheet, Text } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { radii, spacing, typography } from "@/constants/Themes";

type TokenKind = "word" | "number" | "punct" | "symbol" | "other";

type WordTokenProps = {
  token: {
    i: number;
    surface: string;
    kind: TokenKind;
  };
  addLeadingSpace: boolean;
  isHighlighted: boolean;
  onLayout: (layout: LayoutRectangle) => void;
};

export default function WordToken({ token, addLeadingSpace, isHighlighted, onLayout }: WordTokenProps) {
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  return (
    <Text
      onLayout={(e) => onLayout(e.nativeEvent.layout)}
      style={[
        styles.token,
        { color: textColor },
        addLeadingSpace && styles.leadingSpace,
        isHighlighted && { backgroundColor: tintColor + "44" },
      ]}
    >
      {token.surface}
    </Text>
  );
}

const styles = StyleSheet.create({
  token: {
    fontSize: typography.sizes.lg,
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
    borderRadius: radii.xs,
  },
  leadingSpace: {
    marginLeft: spacing.xs,
  },
});
