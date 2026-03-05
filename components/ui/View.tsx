import { View as DefaultView } from 'react-native'

import type { ThemeProps } from '@/hooks/useThemeColor'
import { useThemeColor } from '@/hooks/useThemeColor'

export type ViewProps = ThemeProps & DefaultView['props']

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background',
  )

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />
}
