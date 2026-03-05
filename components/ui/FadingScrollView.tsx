import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { StyleSheet, View, ScrollView as DefaultScrollView } from 'react-native'

import { spacing } from '@constants/Themes'
import type { ThemeProps } from '@hooks/useThemeColor'
import { useThemeColor } from '@hooks/useThemeColor'

const DEFAULT_FADE_HEIGHT = spacing.sm

export type FadingScrollViewProps = ThemeProps &
  DefaultScrollView['props'] & {
    fadeHeight?: number
  }

export function FadingScrollView(props: FadingScrollViewProps) {
  const {
    style,
    lightColor,
    darkColor,
    fadeHeight = DEFAULT_FADE_HEIGHT,
    ...otherProps
  } = props
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background',
  )

  return (
    <MaskedView
      style={styles.fill}
      maskElement={
        <View style={styles.maskContainer}>
          <LinearGradient
            colors={['transparent', 'black']}
            style={{ height: fadeHeight }}
          />
          <View style={styles.maskFill} />
          <LinearGradient
            colors={['black', 'transparent']}
            style={{ height: fadeHeight }}
          />
        </View>
      }
    >
      <DefaultScrollView style={[{ backgroundColor }, style]} {...otherProps} />
    </MaskedView>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  maskContainer: { flex: 1, borderColor: '#FFFFFF', borderWidth: 1 },
  maskFill: { flex: 1, backgroundColor: 'black' },
})
