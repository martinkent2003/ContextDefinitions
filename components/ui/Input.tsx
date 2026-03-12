import type { InputProps as DefaultInputProps } from '@rneui/themed'
import { Input as DefaultInput } from '@rneui/themed'
import { Platform } from 'react-native'

import { radii, spacing, typography } from '@constants/Themes'
import type { ThemeProps } from '@hooks/useThemeColor'
import { useThemeColor } from '@hooks/useThemeColor'

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'input-autofill-override'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0px 1000px var(--input-bg, transparent) inset !important;
        -webkit-text-fill-color: var(--input-color, inherit) !important;
        transition: background-color 5000s ease-in-out 0s;
      }
    `
    document.head.appendChild(style)
  }
}

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
    height: currentSize.height,
  }

  return (
    <DefaultInput
      placeholderTextColor={placeholderTextColor ?? placeholderColor}
      inputStyle={[
        { color, fontSize: currentSize.fontSize },
        Platform.OS === 'web'
          ? ({
              // @ts-ignore — web-only CSS variables for autofill override
              '--input-bg': backgroundColor,
              '--input-color': color,
            } as object)
          : undefined,
        inputStyle,
      ]}
      labelStyle={[{ color: labelColor }, labelStyle]}
      containerStyle={containerStyle}
      inputContainerStyle={[inputContainerBaseStyle, inputContainerStyle]}
      errorStyle={errorHideStyle}
      {...otherProps}
    />
  )
}
