import type { InputProps as DefaultInputProps } from '@rneui/themed'
import { Input as DefaultInput } from '@rneui/themed'

import { radii, spacing, typography } from '@constants/Themes'
import type { ThemeProps } from '@hooks/useThemeColor'
import { useThemeColor } from '@hooks/useThemeColor'

type InputSize = 'sm' | 'md' | 'lg'

const sizeStyles = {
  sm: {
    height: 36,
    paddingHorizontal: spacing.xs,
    fontSize: typography.sizes.sm,
    borderRadius: radii.lg,
  },
  md: {
    height: 44,
    paddingHorizontal: spacing.sm,
    fontSize: typography.sizes.md,
    borderRadius: radii.lg,
  },
  lg: {
    height: 52,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.lg,
    borderRadius: radii.lg,
  },
}

export type InputProps = ThemeProps &
  DefaultInputProps & {
    size?: InputSize
  }

export function Input(props: InputProps) {
  const {
    lightColor,
    darkColor,
    size = 'md',
    style,
    inputStyle,
    labelStyle,
    containerStyle,
    inputContainerStyle,
    placeholderTextColor,
    ...otherProps
  } = props
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text')
  const labelColor = useThemeColor({}, 'textSecondary')
  const borderColor = useThemeColor({}, 'border')
  const backgroundColor = useThemeColor({}, 'backgroundSecondary')
  const placeholderColor = useThemeColor({}, 'textTertiary')

  const currentSize = sizeStyles[size]

  const errorHideStyle = { height: 0, margin: 0 }

  const inputContainerBaseStyle = {
    borderWidth: 1,
    borderColor: borderColor,
    borderRadius: currentSize.borderRadius,
    backgroundColor: backgroundColor,
    paddingHorizontal: currentSize.paddingHorizontal,
    borderBottomWidth: 2,
    height: currentSize.height,
  }

  return (
    <DefaultInput
      placeholderTextColor={placeholderTextColor ?? placeholderColor}
      inputStyle={[{ color, fontSize: currentSize.fontSize }, inputStyle]}
      labelStyle={[{ color: labelColor }, labelStyle]}
      containerStyle={containerStyle}
      inputContainerStyle={[inputContainerBaseStyle, inputContainerStyle]}
      errorStyle={errorHideStyle}
      {...otherProps}
    />
  )
}
