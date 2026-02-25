import { TouchableOpacity } from "react-native";
import { View, Text, Icon } from "@/components/ui";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useReading } from "@/hooks/useReading";
import { styles } from "@/screens/ReadingScreen/styles";
import { typography } from "@/constants/Themes";

// Ordered list of available font sizes derived from the theme.
type FontSize = typeof typography.sizes[keyof typeof typography.sizes];
const FONT_SIZES = Object.values(typography.sizes).sort((a, b) => a - b) as FontSize[];

export default function Footer() {
  const { currentPage, setCurrentPage, totalPages, fontSize, setFontSize } = useReading();
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");

  const isFirst = currentPage === 0;
  const isLast = currentPage >= totalPages - 1;

  const fontSizeIdx = FONT_SIZES.indexOf(fontSize as FontSize);
  const canDecrease = fontSizeIdx > 0;
  const canIncrease = fontSizeIdx < FONT_SIZES.length - 1;

  return (
    <View style={[styles.footer, { borderColor }]}>

      {/* Font size control */}
      <View style={styles.footerFontSizeGroup}>
        <TouchableOpacity
          onPress={() => setFontSize(FONT_SIZES[fontSizeIdx - 1])}
          disabled={!canDecrease}
          style={[styles.footerButton, !canDecrease && styles.footerButtonDisabled]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon library="Ionicons" name="remove-circle-outline" size={28} />
        </TouchableOpacity>

        <Text style={[styles.footerFontSizeLabel, { color: textColor }]}>
          aA
        </Text>

        <TouchableOpacity
          onPress={() => setFontSize(FONT_SIZES[fontSizeIdx + 1])}
          disabled={!canIncrease}
          style={[styles.footerButton, !canIncrease && styles.footerButtonDisabled]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon library="Ionicons" name="add-circle-outline" size={28} />
        </TouchableOpacity>
      </View>

      {/* Page navigation */}
      <View style={styles.footerPaginationGroup}>
        <TouchableOpacity
          onPress={() => setCurrentPage(currentPage - 1)}
          disabled={isFirst}
          style={[styles.footerButton, isFirst && styles.footerButtonDisabled]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon library="Ionicons" name="chevron-back-circle-outline" size={32} />
        </TouchableOpacity>

        <Text style={[styles.footerPageLabel, { color: textColor }]}>
          {totalPages === 0 ? "—" : `${currentPage + 1} / ${totalPages}`}
        </Text>

        <TouchableOpacity
          onPress={() => setCurrentPage(currentPage + 1)}
          disabled={isLast}
          style={[styles.footerButton, isLast && styles.footerButtonDisabled]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon library="Ionicons" name="chevron-forward-circle-outline" size={32} />
        </TouchableOpacity>
      </View>

    </View>
  );
}
