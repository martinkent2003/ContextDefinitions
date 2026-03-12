import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui'
import React from 'react'
import { StyleSheet } from 'react-native'

import { CustomTabList } from '@/components/ui/CustomTabList'

export default function TabLayout() {
  return (
    <Tabs>
      <TabSlot />
      <CustomTabList />
      <TabList style={styles.hidden}>
        <TabTrigger name="home" href="/home" />
        <TabTrigger name="create" href="/create" />
        <TabTrigger name="library" href="/library" />
      </TabList>
    </Tabs>
  )
}

const styles = StyleSheet.create({
  hidden: {
    display: 'none',
    overflow: 'visible',
  },
})
