import React from 'react';
import { View, ScrollView as DefaultScrollView } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeProps, useThemeColor } from '@hooks/useThemeColor';
import { spacing } from '@constants/Themes';

const DEFAULT_FADE_HEIGHT = spacing.sm;

export type FadingScrollViewProps = ThemeProps & DefaultScrollView['props'] & {
  fadeHeight?: number;
};

export function FadingScrollView(props: FadingScrollViewProps) {
  const { style, lightColor, darkColor, fadeHeight = DEFAULT_FADE_HEIGHT, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <MaskedView
      style={{ flex: 1 }}
      maskElement={
        <View style={{ flex: 1,     borderColor: "#FFFFFF",
     borderWidth: 1, }}>
          <LinearGradient
            colors={['transparent', 'black']}
            style={{ height: fadeHeight }}
          />
          <View style={{ flex: 1, backgroundColor: 'black' }} />
          <LinearGradient
            colors={['black', 'transparent']}
            style={{ height: fadeHeight }}
          />
        </View>
      }
    >
      <DefaultScrollView style={[{ backgroundColor }, style]} {...otherProps} />
    </MaskedView>
  );
}
