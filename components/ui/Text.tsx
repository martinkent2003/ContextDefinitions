import { Text as DefaultText } from 'react-native'

import type { ThemeProps } from '@hooks/useThemeColor'
import { useThemeColor } from '@hooks/useThemeColor'

export type TextProps = ThemeProps & DefaultText['props']

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text')

  return <DefaultText style={[{ color }, style]} {...otherProps} />
}
