import type { TouchableOpacityProps } from 'react-native'
import { StyleSheet, TouchableOpacity } from 'react-native'

import type { IconProps } from '@components/ui/Icon'
import { Icon } from '@components/ui/Icon'
import { Text } from '@components/ui/Text'
import { View } from '@components/ui/View'
import { spacing, radii, typography } from '@constants/Themes'
import { useThemeColor } from '@hooks/useThemeColor'

export type IconButtonProps = Omit<TouchableOpacityProps, 'children'> & {
  icon: IconProps
  label?: string
}

export function IconButton({ icon, label, style, ...touchableProps }: IconButtonProps) {
  const borderColor = useThemeColor({}, 'border')
  const backgroundColor = useThemeColor({}, 'cardBackground')

  return (
    <TouchableOpacity style={[styles.container, style]} {...touchableProps}>
      <View style={[styles.iconBox, { borderColor, backgroundColor }]}>
        <Icon {...icon} />
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconBox: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.sizes.xs,
  },
})
