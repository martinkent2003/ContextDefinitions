import { Fragment, useMemo } from 'react'
import { View } from 'react-native'
import { GestureDetector } from 'react-native-gesture-handler'
import { useReadingContent } from '@/screens/ReadingScreen/hooks/useReadingContent'
import { styles } from '@/screens/ReadingScreen/styles'
import WordToken from './WordToken'

export default function ReadingContent() {
  const {
    tokens,
    blocks,
    fontSize,
    isMeasuring,
    isHighlighted,
    pan,
    onContainerLayout,
    onTokenLayout,
  } = useReadingContent()

  // Build a set of token indices that begin a paragraph block.
  const paragraphStartSet = useMemo(() => {
    const set = new Set<number>()
    for (const block of blocks) {
      const first = tokens.find((t) => t.start >= block.start && t.start <= block.end)
      if (first) set.add(first.i)
    }
    return set
  }, [blocks, tokens])

  const indentWidth = fontSize * 2

  return (
    <View style={styles.readingContent} onLayout={onContainerLayout}>
      <GestureDetector gesture={pan}>
        <View style={[styles.tokenContainer, isMeasuring && styles.tokenContainerHidden]}>
          {tokens.map((token, idx) => {
            const prev = idx > 0 ? tokens[idx - 1] : null
            const addLeadingSpace = prev !== null && token.start > prev.end
            const isParaStart = paragraphStartSet.has(token.i)
            return (
              <Fragment key={token.i}>
                {isParaStart && idx > 0 && <View style={{ width: '100%' }} />}
                {isParaStart && <View style={{ width: indentWidth }} />}
                <WordToken
                  token={token}
                  addLeadingSpace={!isParaStart && addLeadingSpace}
                  isHighlighted={isHighlighted(token.i)}
                  fontSize={fontSize}
                  onLayout={(layout) => onTokenLayout(token.i, layout)}
                />
              </Fragment>
            )
          })}
        </View>
      </GestureDetector>
    </View>
  )
}
