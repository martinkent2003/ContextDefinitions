import { radii, spacing, typography } from '@/constants/Themes';
import { ThemeProps, useThemeColor } from '@/hooks/useThemeColor';
import { Picker as DefaultPicker, PickerProps as DefaultPickerProps } from '@react-native-picker/picker';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from './Text';

export type PickerItem = {
  label: string;
  value: string;
};

export type PickerProps<T> = ThemeProps & DefaultPickerProps<T> & {
  label?: string;
  items: PickerItem[];
  containerStyle?: ViewStyle;
};

export function Picker<T extends string>(props: PickerProps<T>) {
  const {
    lightColor,
    darkColor,
    label,
    items,
    containerStyle,
    style,
    ...otherProps
  } = props;

  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const labelColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[styles.label, { color: labelColor }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.container,
          {
            borderColor,
            backgroundColor,
          },
          containerStyle,
        ]}
      >
        <DefaultPicker
          style={[styles.picker, { color: textColor }, style]}
          dropdownIconColor={textColor}
          itemStyle={Platform.select({
            ios: {
              fontSize: typography.sizes.md,
              fontFamily: typography.fonts.excalifont,
              color: textColor,
            },
            android: undefined,
          })}
          {...otherProps}
        >
          {items.map((item) => (
            <DefaultPicker.Item
              key={item.value}
              label={item.label}
              value={item.value}
              color={textColor}
              style={{ fontFamily: typography.fonts.excalifont }}
            />
          ))}
        </DefaultPicker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginLeft: spacing.xs,
    marginBottom: spacing.xs,
  },
  container: {
    borderWidth: 2,
    borderRadius: radii.md,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        height: 100, 
      },
      android: {},
    }),
  },
  picker: {
    ...Platform.select({
      ios: {
        height: 160, // Actual picker height (larger than container)
        marginTop: -30, // Offset to center the selection
      },
      android: {
        height: undefined,
      },
    }),
  },
});
