import { BottomSheetScrollView, useBottomSheet } from '@gorhom/bottom-sheet'
import { Platform, ScrollView, useWindowDimensions, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { Text } from '@/components/ui'
import { WordCard } from '@/components/ui/WordCard'
import { spacing } from '@/constants/Themes'
import { useThemeColor } from '@/hooks/useThemeColor'
import { styles } from '@/screens/ReadingScreen/Components/WordsSheet/styles'
import type { SavedWord } from '@/types/words'

const HANDLE_HEIGHT = 24

type WordFeedProps = {
  savedWords: Map<string, SavedWord>
  handleView: (savedWord: SavedWord) => void
}

function WordFeedWeb({ savedWords, handleView }: WordFeedProps) {
  const textColor = useThemeColor({}, 'text')
  const textSecondary = useThemeColor({}, 'textSecondary')
  const { animatedPosition } = useBottomSheet()
  const { height: screenHeight } = useWindowDimensions()
  const headerHeight = useSharedValue(0)

  const scrollStyle = useAnimatedStyle(() => ({
    maxHeight: Math.max(
      0,
      screenHeight - animatedPosition.value - HANDLE_HEIGHT - headerHeight.value,
    ),
    paddingBottom: spacing.xxl,
  }))

  return (
    <View style={{ flex: 1 }}>
      <View
        onLayout={(e) => {
          headerHeight.value = e.nativeEvent.layout.height
        }}
      >
        <Text style={[styles.feedTitle, { color: textColor }]}>Saved Words</Text>
      </View>
      {savedWords.size === 0 ? (
        <Text style={[styles.feedEmpty, { color: textSecondary }]}>
          No words saved yet. Select text and tap + to add words.
        </Text>
      ) : (
        <Animated.View style={scrollStyle}>
          <BottomSheetScrollView style={{ flex: 1 }}>
            {[...savedWords.values()].map((word) => (
              <WordCard
                key={word.id}
                text={word.text}
                definition={word.translation}
                onPress={() => handleView(word)}
              />
            ))}
          </BottomSheetScrollView>
        </Animated.View>
      )}
    </View>
  )
}

function WordFeedNative({ savedWords, handleView }: WordFeedProps) {
  const textColor = useThemeColor({}, 'text')
  const textSecondary = useThemeColor({}, 'textSecondary')
  const { animatedPosition } = useBottomSheet()
  const { height: screenHeight } = useWindowDimensions()
  const headerHeight = useSharedValue(0)

  const scrollStyle = useAnimatedStyle(() => ({
    maxHeight: Math.max(
      0,
      screenHeight - animatedPosition.value - HANDLE_HEIGHT - headerHeight.value,
    ),
  }))

  return (
    <View style={{ flex: 1 }}>
      <View
        onLayout={(e) => {
          headerHeight.value = e.nativeEvent.layout.height
        }}
      >
        <Text style={[styles.feedTitle, { color: textColor }]}>Saved Words</Text>
      </View>
      {savedWords.size === 0 ? (
        <Text style={[styles.feedEmpty, { color: textSecondary }]}>
          No words saved yet. Select text and tap + to add words.
        </Text>
      ) : (
        <Animated.View style={scrollStyle}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: spacing.xxl }}
          >
            {[...savedWords.values()].map((word) => (
              <WordCard
                key={word.id}
                text={word.text}
                definition={word.translation}
                onPress={() => handleView(word)}
              />
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  )
}

export function WordFeed(props: WordFeedProps) {
  return Platform.OS === 'web' ? (
    <WordFeedWeb {...props} />
  ) : (
    <WordFeedNative {...props} />
  )
}
