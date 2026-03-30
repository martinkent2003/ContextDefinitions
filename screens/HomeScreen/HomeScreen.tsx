import { Keyboard, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@screens/HomeScreen/Components/Header'
import HomeFeed from '@screens/HomeScreen/Components/HomeFeed'
import { styles } from '@screens/HomeScreen/styles'

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Pressable style={styles.pressable} onPress={Keyboard.dismiss}>
        <Header />
        <HomeFeed />
      </Pressable>
    </SafeAreaView>
  )
}
