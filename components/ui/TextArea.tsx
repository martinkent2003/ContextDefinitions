import type { TextInputProps as DefaultInputProps } from 'react-native'
import { TextInput as DefaultInput } from 'react-native'

import { radii, spacing, typography } from '@/constants/Themes'
import type { ThemeProps } from '@/hooks/useThemeColor'
import { useThemeColor } from '@/hooks/useThemeColor'

export type TextAreaProps = ThemeProps &
  DefaultInputProps & {
    minHeight?: number
  }

export function TextArea(props: TextAreaProps) {
  const {
    lightColor,
    darkColor,
    style,
    placeholderTextColor,
    minHeight = 300,
    ...otherProps
  } = props

  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text')
  const borderColor = useThemeColor({}, 'border')
  const placeholderColor = useThemeColor({}, 'textTertiary')
  const backgroundColor = useThemeColor({}, 'backgroundSecondary')

  const baseStyle = {
    minHeight,
    padding: spacing.sm,
    marginHorizontal: spacing.sm,
    borderColor: borderColor,
    borderWidth: 1,
    borderRadius: radii.lg,
    fontSize: typography.sizes.md,
    backgroundColor: backgroundColor,
    color: color,
  }

  return (
    <DefaultInput
      multiline
      scrollEnabled={false}
      textAlignVertical="top"
      placeholderTextColor={placeholderTextColor ?? placeholderColor}
      style={[baseStyle, style]}
      {...otherProps}
    />
  )
}
