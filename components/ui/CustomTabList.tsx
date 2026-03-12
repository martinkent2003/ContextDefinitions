import { TabTrigger } from 'expo-router/ui'
import * as React from 'react'
import { StyleSheet, View } from 'react-native'

import { CustomTabButton } from '@/components/ui/CustomTabButton'
import { ToggleMenuButton } from '@/components/ui/ToggleMenuButton'
import { spacing } from '@/constants/Themes'

const TABS = [
  { name: 'library', iconName: 'folder', label: 'Library', index: 0 },
  { name: 'create', iconName: 'plus', label: 'Create', index: 1 },
  { name: 'home', iconName: 'home', label: 'Home', index: 2 },
] as const

export function CustomTabList() {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <View style={styles.container}>
      {TABS.map((tab) => (
        <TabTrigger key={tab.name} name={tab.name} asChild>
          <CustomTabButton
            iconName={tab.iconName}
            label={tab.label}
            isExpanded={isExpanded}
            index={tab.index}
          />
        </TabTrigger>
      ))}
      <ToggleMenuButton
        isExpanded={isExpanded}
        onPress={() => setIsExpanded((v) => !v)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
})
