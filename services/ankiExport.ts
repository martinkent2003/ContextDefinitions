import { Platform } from 'react-native'
import RNBlobUtil from 'react-native-blob-util'

import type { SavedWord } from '@/types/words'

function buildFileName(title?: string): string {
  if (!title) return 'anki_flashcards.txt'
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
  return `anki_${slug}.txt`
}

/**
 * Removes tab characters (field separator) and converts newlines to <br> for
 * Anki's HTML import mode.
 */
function escapeField(text: string): string {
  return text.replace(/\t/g, ' ').replace(/\n/g, '<br>')
}

function buildBack(word: SavedWord): string {
  const parts: string[] = []

  parts.push(`<b>${escapeField(word.translation)}</b>`)
  parts.push('<br><br>')
  parts.push(escapeField(word.definition))

  if (word.context) {
    parts.push(`<br><br><i>Context:</i> ${escapeField(word.context)}`)
  }

  if (word.part_of_speech) {
    parts.push(`<br><i>Part of speech:</i> ${escapeField(word.part_of_speech)}`)
  }

  return parts.join('')
}

/**
 * Builds an Anki-compatible tab-separated text file from a list of saved words.
 *
 * Import into Anki via: File → Import → select the .txt file.
 * Each line becomes one Basic note (Front = word, Back = translation + definition).
 */
function buildAnkiContent(words: SavedWord[]): string {
  const header = ['#separator:tab', '#html:true', '#notetype:Basic']
  const rows = words.map((word) => `${escapeField(word.text)}\t${buildBack(word)}`)
  return [...header, ...rows].join('\n')
}

export async function exportToAnki(words: SavedWord[], title?: string): Promise<void> {
  const content = buildAnkiContent(words)
  const fileName = buildFileName(title)

  // Web: trigger a browser file download
  if (Platform.OS === 'web') {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(url)
    return
  }

  // Native: write to cache directory then open the system share sheet
  const path = `${RNBlobUtil.fs.dirs.CacheDir}/${fileName}`
  await RNBlobUtil.fs.writeFile(path, content, 'utf8')

  if (Platform.OS === 'ios') {
    await RNBlobUtil.ios.openDocument(path)
  } else {
    await RNBlobUtil.android.actionViewIntent(path, 'text/plain')
  }
}
