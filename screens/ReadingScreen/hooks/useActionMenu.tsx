import { useRouter } from 'expo-router'
import React from 'react'
import { Alert } from 'react-native'

import type { ActionMenuItem } from '@/components/ui'
import { useProfile } from '@/hooks/useProfile'
import { useReading } from '@/hooks/useReading'
import { useReadingWords } from '@/screens/ReadingScreen/hooks/useReadingWords'
import { exportToAnki } from '@/services/ankiExport'
import { addToLibrary, deleteReading, removeFromLibrary } from '@/services/readings'

type ActionMenuContextType = {
  isActionMenuVisible: boolean
  openActionMenu: () => void
  closeActionMenu: () => void
  actions: ActionMenuItem[]
}

const ActionMenuContext = React.createContext<ActionMenuContextType>({
  isActionMenuVisible: false,
  openActionMenu: () => {},
  closeActionMenu: () => {},
  actions: [],
})

export function ActionMenuProvider({ children }: { children: React.ReactNode }) {
  const [isActionMenuVisible, setIsActionMenuVisible] = React.useState(false)
  const { savedWords } = useReadingWords()
  const { reading, updateReadingLibraryStatus } = useReading()
  const { profile } = useProfile()
  const router = useRouter()

  const openActionMenu = React.useCallback(() => setIsActionMenuVisible(true), [])
  const closeActionMenu = React.useCallback(() => setIsActionMenuVisible(false), [])

  const isOwner = !!reading?.owner_id && reading.owner_id === profile?.id
  const isPublic = reading?.visibility === 'public'
  const isInLibrary = reading?.isInLibrary ?? false
  const libraryStatusKnown = reading?.isInLibrary !== undefined

  React.useEffect(() => {
    console.log('[ActionMenu] reading.id        :', reading?.id)
    console.log('[ActionMenu] reading.owner_id  :', JSON.stringify(reading?.owner_id))
    console.log('[ActionMenu] profile.id        :', JSON.stringify(profile?.id))
    console.log('[ActionMenu] reading.visibility:', reading?.visibility)
    console.log('[ActionMenu] reading.isInLibrary:', reading?.isInLibrary)
    console.log('[ActionMenu] isOwner           :', isOwner)
    console.log('[ActionMenu] isPublic          :', isPublic)
    console.log('[ActionMenu] libraryStatusKnown:', libraryStatusKnown)
    console.log('[ActionMenu] Delete visible?   :', isOwner)
  }, [
    reading?.id,
    reading?.owner_id,
    profile?.id,
    reading?.visibility,
    reading?.isInLibrary,
    isOwner,
    isPublic,
    libraryStatusKnown,
  ])

  const handleExport = React.useCallback(async () => {
    const words = Array.from(savedWords.values())
    if (words.length === 0) {
      Alert.alert('No words to export', 'Save some words first before exporting.')
      return
    }
    try {
      await exportToAnki(words, reading?.title)
    } catch (err) {
      console.error('Anki export failed:', err)
      Alert.alert(
        'Export failed',
        'Something went wrong while exporting your flashcards.',
      )
    }
  }, [savedWords, reading?.title])

  const handleAddToLibrary = React.useCallback(async () => {
    if (!reading) return
    const ok = await addToLibrary(reading.id)
    if (ok) updateReadingLibraryStatus(true)
    else Alert.alert('Error', 'Could not add reading to library.')
  }, [reading, updateReadingLibraryStatus])

  const handleRemoveFromLibrary = React.useCallback(async () => {
    if (!reading) return
    const ok = await removeFromLibrary(reading.id)
    if (ok) updateReadingLibraryStatus(false)
    else Alert.alert('Error', 'Could not remove reading from library.')
  }, [reading, updateReadingLibraryStatus])

  const handleDelete = React.useCallback(() => {
    if (!reading) return
    Alert.alert(
      'Delete Reading',
      'This will permanently delete the reading. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const ok = await deleteReading(reading.id)
            if (ok) router.back()
            else Alert.alert('Error', 'Could not delete reading.')
          },
        },
      ],
    )
  }, [reading, router])

  const actions: ActionMenuItem[] = React.useMemo(() => {
    const items: ActionMenuItem[] = [
      {
        label: 'Export Saved Words',
        icon: 'share-outline',
        onPress: handleExport,
      },
    ]

    if (isPublic && !isOwner && libraryStatusKnown) {
      if (isInLibrary) {
        items.push({
          label: 'Remove From Library',
          icon: 'bookmark',
          onPress: handleRemoveFromLibrary,
        })
      } else {
        items.push({
          label: 'Add To Library',
          icon: 'bookmark-outline',
          onPress: handleAddToLibrary,
        })
      }
    }

    if (isOwner) {
      items.push({
        label: 'Delete',
        icon: 'trash-outline',
        variant: 'danger',
        onPress: handleDelete,
      })
    }

    return items
  }, [
    handleExport,
    isPublic,
    isOwner,
    isInLibrary,
    libraryStatusKnown,
    handleAddToLibrary,
    handleRemoveFromLibrary,
    handleDelete,
  ])

  return (
    <ActionMenuContext.Provider
      value={{ isActionMenuVisible, openActionMenu, closeActionMenu, actions }}
    >
      {children}
    </ActionMenuContext.Provider>
  )
}

export function useActionMenu() {
  return React.useContext(ActionMenuContext)
}
