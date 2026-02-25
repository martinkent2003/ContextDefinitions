import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Icon } from "@components/ui/Icon";
import { spacing } from "@constants/Themes";

export type BackButtonProps = Omit<TouchableOpacityProps, "children"> & {
  size?: number;
};

export function BackButton({ size = 22, style, ...otherProps }: BackButtonProps) {
  return (
    <TouchableOpacity style={[styles.base, style]} {...otherProps}>
      <Icon library="Ionicons" name="chevron-back-circle-outline" size={size} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: spacing.xs,
  },
});
