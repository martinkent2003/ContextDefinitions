import * as Haptics from 'expo-haptics'
import type { ViewStyle } from 'react-native'
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { radii, spacing, typography } from '@/constants/Themes'
import type { ThemeProps } from '@/hooks/useThemeColor'
import { useThemeColor } from '@/hooks/useThemeColor'
import { Text } from '@components/ui/Text'

export type RadioItem = {
  label: string
  description: string
  value: string
  warning?: string
}

export type RadioButtonProps = ThemeProps & {
  items: RadioItem[]
  selected?: string
  onSelect?: (value: string) => void
  label?: string
  subLabel?: string
  direction?: 'row' | 'column'
  containerStyle?: ViewStyle
}

const SPRING = { mass: 0.5, stiffness: 150, damping: 15 }

type RadioOptionProps = {
  item: RadioItem
  isSelected: boolean
  borderColor: string
  backgroundColor: string
  textColor: string
  labelColor: string
  tintColor: string
  warningColor: string
  onPress: (item: RadioItem) => void
}

function RadioOption({
  item,
  isSelected,
  borderColor,
  backgroundColor,
  textColor,
  labelColor,
  tintColor,
  warningColor,
  onPress,
}: RadioOptionProps) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Pressable
      onHoverIn={() => {
        scale.value = withSpring(1.02, SPRING)
      }}
      onHoverOut={() => {
        scale.value = withSpring(1, SPRING)
      }}
      onPressIn={() => {
        scale.value = withSpring(0.97, SPRING)
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING)
      }}
      onPress={() => onPress(item)}
    >
      <Animated.View
        style={[
          styles.option,
          { borderColor: borderColor, backgroundColor: backgroundColor },
          animatedStyle,
        ]}
      >
        <View style={styles.textContainer}>
          <Text style={[styles.optionText, { color: textColor }]}>{item.label}</Text>
          {item.description && (
            <Text style={[styles.optionDescription, { color: labelColor }]}>
              {item.description}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.circle,
            {
              borderColor: isSelected
                ? item.warning
                  ? warningColor
                  : tintColor
                : borderColor,
            },
          ]}
        >
          {isSelected && (
            <View
              style={[
                styles.filled,
                {
                  backgroundColor: item.warning ? warningColor : tintColor,
                },
              ]}
            />
          )}
        </View>
      </Animated.View>
    </Pressable>
  )
}

export function RadioButton(props: RadioButtonProps) {
  const {
    lightColor,
    darkColor,
    items,
    selected,
    onSelect,
    label,
    subLabel,
    direction = 'column',
    containerStyle,
  } = props

  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text')
  const labelColor = useThemeColor({}, 'textSecondary')
  const backgroundColor = useThemeColor({}, 'backgroundSecondary')
  const borderColor = useThemeColor({}, 'border')
  const tintColor = useThemeColor({}, 'tint')
  const warningColor = useThemeColor({}, 'error')

  const handleSelect = (item: RadioItem) => {
    if (item.value === selected) return

    if (item.warning && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      Alert.alert('Warning', item.warning, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => onSelect?.(item.value),
        },
      ])
    } else {
      onSelect?.(item.value)
    }
  }

  return (
    <View
      style={[
        styles.wrapper,
        { borderColor: borderColor, backgroundColor: backgroundColor },
      ]}
    >
      {label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}
      {subLabel && (
        <Text style={[styles.subLabel, { color: labelColor }]}>{subLabel}</Text>
      )}
      <View style={[styles.group, { flexDirection: direction }, containerStyle]}>
        {items.map((item) => (
          <RadioOption
            key={item.value}
            item={item}
            isSelected={item.value === selected}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
            textColor={textColor}
            labelColor={labelColor}
            tintColor={tintColor}
            warningColor={warningColor}
            onPress={handleSelect}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    padding: spacing.sm,
    marginHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  label: {
    fontSize: typography.sizes.xxl,
    marginLeft: spacing.xs,
  },
  subLabel: {
    fontSize: typography.sizes.sm,
    paddingBottom: spacing.xs,
    marginLeft: spacing.sm,
    marginBottom: spacing.sm,
  },
  group: {
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    ...Platform.select({ web: { outlineStyle: 'none' } as object }),
  },
  textContainer: {
    flex: 1,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: radii.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
  },
  optionText: {
    fontSize: typography.sizes.lg,
  },
  optionDescription: {
    fontSize: typography.sizes.sm,
  },
})
