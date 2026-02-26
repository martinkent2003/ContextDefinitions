import { useEffect, useRef, useState } from 'react';
import { radii, spacing, typography } from '@/constants/Themes';
import { ThemeProps, useThemeColor } from '@/hooks/useThemeColor';
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Text } from '@components/ui/Text';

type SegmentedControlSize = 'sm' | 'md' | 'lg';

const sizeStyles = {
  sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    fontSize: typography.sizes.sm,
  },
  md: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
  },
  lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.sizes.lg,
  },
};

export type SegmentedControlProps = ThemeProps & {
  segments: string[];
  selected: string;
  onSelect: (value: string) => void;
  size?: SegmentedControlSize;
  style?: ViewStyle;
};

export function SegmentedControl(props: SegmentedControlProps) {
  const {
    lightColor,
    darkColor,
    segments,
    selected,
    onSelect,
    size = 'md',
    style,
  } = props;

  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = useThemeColor({}, 'border');
  const selectedBg = useThemeColor({}, 'tint');
  const selectedText = useThemeColor({}, 'textInverse');
  const unselectedText = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const currentSize = sizeStyles[size];

  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const selectedIndex = segments.indexOf(selected);
  const segmentWidth = containerWidth / segments.length;

  useEffect(() => {
    if (containerWidth === 0) return;
    Animated.spring(translateX, {
      toValue: selectedIndex * segmentWidth,
      useNativeDriver: true,
      tension: 68,
      friction: 7,
    }).start();
  }, [selectedIndex, segmentWidth]);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    setContainerWidth(width);
    // Set initial position without animation
    translateX.setValue(segments.indexOf(selected) * (width / segments.length));
  };

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
        },
        style,
      ]}
    >
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.slider,
            {
              width: segmentWidth,
              backgroundColor: selectedBg,
              transform: [{ translateX }],
            },
          ]}
        />
      )}
      {segments.map((segment) => {
        const isSelected = segment === selected;
        return (
          <TouchableOpacity
            key={segment}
            onPress={() => onSelect(segment)}
            style={[
              styles.segment,
              {
                paddingVertical: currentSize.paddingVertical,
                paddingHorizontal: currentSize.paddingHorizontal,
              },
            ]}
          >
            <Text
              style={[
                styles.text,
                {
                  fontSize: currentSize.fontSize,
                  color: isSelected ? selectedText : unselectedText,
                },
              ]}
            >
              {segment}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  slider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: radii.md,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
});
