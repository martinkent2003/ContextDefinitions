import type { TouchableOpacityProps } from 'react-native'

import { IconButton } from '@components/ui/IconButton'

export type BackButtonProps = Omit<TouchableOpacityProps, 'children'> & {
  size?: number
}

export function BackButton({ size = 24, ...otherProps }: BackButtonProps) {
  return (
    <IconButton
      icon={{ library: 'Ionicons', name: 'arrow-back-outline', size }}
      label="Return"
      {...otherProps}
    />
  )
}
