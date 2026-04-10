import { Keyboard, Platform, Pressable, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '@screens/HomeScreen/Components/Header'
import HomeFeed from '@screens/HomeScreen/Components/HomeFeed'
import { styles } from '@screens/HomeScreen/styles'

export default function HomeScreen() {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.screenWeb}>
        <View style={styles.pressable}>
          <Header />
          <HomeFeed />
        </View>
      </View>
    )
  }
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Pressable style={styles.pressable} onPress={Keyboard.dismiss}>
        <Header />
        <HomeFeed />
      </Pressable>
    </SafeAreaView>
  )
}
