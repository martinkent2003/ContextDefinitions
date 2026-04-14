import type { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'
import React from 'react'
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native'

import { Icon } from '@components/ui/Icon'
import { IconButton } from '@components/ui/IconButton'
import { Text } from '@components/ui/Text'
import { View } from '@components/ui/View'
import { radii, shadows, spacing, typography } from '@constants/Themes'
import { useThemeColor } from '@hooks/useThemeColor'

export type ActionMenuItem = {
  label: string
  icon: ComponentProps<typeof Ionicons>['name']
  onPress: () => void
  variant?: 'default' | 'danger'
}

export type ActionMenuModalProps = {
  visible: boolean
  onClose: () => void
  actions: ActionMenuItem[]
}

export function ActionMenuModal({ visible, onClose, actions }: ActionMenuModalProps) {
  const cardBackground = useThemeColor({}, 'cardBackground')
  const cardBorder = useThemeColor({}, 'cardBorder')
  const borderColor = useThemeColor({}, 'border')
  const textColor = useThemeColor({}, 'text')
  const errorColor = useThemeColor({}, 'error')

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <Pressable
            style={[
              styles.card,
              { backgroundColor: cardBackground, borderColor: cardBorder },
              shadows.md,
            ]}
          >
            {/* Close button */}
            <View style={[styles.cardHeader, { backgroundColor: 'transparent' }]}>
              <IconButton
                icon={{ library: 'Ionicons', name: 'close-outline', size: 22 }}
                onPress={onClose}
              />
            </View>

            {/* Action rows */}
            {actions.map((action, index) => {
              const isLast = index === actions.length - 1
              const isDanger = action.variant === 'danger'
              const color = isDanger ? errorColor : textColor

              return (
                <TouchableOpacity
                  key={action.label}
                  style={[
                    styles.actionRow,
                    !isLast && { borderBottomWidth: 1, borderBottomColor: borderColor },
                  ]}
                  onPress={() => {
                    action.onPress()
                    onClose()
                  }}
                  activeOpacity={0.7}
                >
                  <Icon library="Ionicons" name={action.icon} size={20} color={color} />
                  <Text style={[styles.actionLabel, { color }]}>{action.label}</Text>
                </TouchableOpacity>
              )
            })}
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '80%',
    maxWidth: 320,
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing.sm,
    paddingRight: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  actionLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
})
