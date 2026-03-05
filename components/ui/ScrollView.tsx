import { ScrollView as DefaultScrollView } from 'react-native'

import type { ThemeProps } from '@/hooks/useThemeColor'
import { useThemeColor } from '@/hooks/useThemeColor'

export type ScrollViewProps = ThemeProps & DefaultScrollView['props']

export function ScrollView(props: ScrollViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background',
  )

  return <DefaultScrollView style={[{ backgroundColor }, style]} {...otherProps} />
}
