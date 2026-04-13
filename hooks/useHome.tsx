import { useRouter } from 'expo-router'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import {
  fetchAllAvailableReadings,
  fetchFeedReadings,
  fetchSavedReadings,
  searchReadings,
} from '@/services/readings'
import type { FeedSortOrder, ReadingMetadata } from '@/types/readings'
import { useLoading } from '@hooks/useLoading'
import { useReading } from '@hooks/useReading'

type HomeContextType = {
  // Data
  readings: ReadingMetadata[]
  selectedSegment: string
  setSelectedSegment: (segment: string) => void
  feedSortOrder: FeedSortOrder
  setFeedSortOrder: (sort: FeedSortOrder) => void
  refreshReadings: () => Promise<void>
  isRefreshing: boolean
  pullRefresh: () => Promise<void>
  handleCardPress: (reading: ReadingMetadata) => Promise<void>
  searchQuery: string
  handleSearchChange: (text: string) => void
}

const HomeContext = createContext<HomeContextType | null>(null)

export function HomeProvider({ children }: { children: React.ReactNode }) {
  const [readings, setReadings] = useState<ReadingMetadata[]>([])
  const [selectedSegment, setSelectedSegment] = useState('Feed')
  const [feedSortOrder, setFeedSortOrder] = useState<FeedSortOrder>('recent')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { showLoading, hideLoading } = useLoading()
  const { handleReadingChange } = useReading()
  const router = useRouter()
  const isNavigating = useRef(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCardPress = async (reading: ReadingMetadata) => {
    if (isNavigating.current) return
    isNavigating.current = true
    const t0 = Date.now()
    console.log('[T0] Card pressed')
    showLoading()
    const success = await handleReadingChange(reading)
    console.log(
      `[T1] handleReadingChange done in ${Date.now() - t0}ms, success=${success}`,
    )
    if (success) {
      router.push('/(private)/reading')
      console.log(`[T2] router.push called at ${Date.now() - t0}ms`)
    } else {
      Alert.alert('File was not found \n' + reading.title)
      hideLoading()
    }
    isNavigating.current = false
  }

  const fetchFeed = async () => {
    const data = await fetchFeedReadings(feedSortOrder)
    setReadings(data)
  }

  const fetchPrivate = async () => {
    const data = await fetchSavedReadings()
    setReadings(data)
  }

  const refreshReadings = async () => {
    showLoading('Loading...', 'book')
    try {
      if (selectedSegment === 'Feed') {
        await fetchFeed()
      } else {
        await fetchPrivate()
      }
      //await new Promise(r => setTimeout(r, 2000))
    } finally {
      hideLoading()
    }
  }

  const pullRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (selectedSegment === 'Feed') {
        await fetchFeed()
      } else {
        await fetchPrivate()
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleSearchChange = (text: string) => {
    setSearchQuery(text)
    if (searchTimer.current) clearTimeout(searchTimer.current)

    if (text.trim().length === 0) {
      if (selectedSegment === 'Feed') {
        fetchFeed()
      } else {
        fetchPrivate()
      }
      return
    }

    if (text.trim().length < 2) return

    searchTimer.current = setTimeout(async () => {
      const results = await searchReadings(
        text.trim(),
        selectedSegment === 'Private' ? 'private' : 'feed',
      )
      setReadings(results)
    }, 300)
  }

  useEffect(() => {
    refreshReadings()
  }, [selectedSegment, feedSortOrder])

  return (
    <HomeContext.Provider
      value={{
        readings,
        selectedSegment,
        setSelectedSegment,
        feedSortOrder,
        setFeedSortOrder,
        refreshReadings,
        isRefreshing,
        pullRefresh,
        handleCardPress,
        searchQuery,
        handleSearchChange,
      }}
    >
      {children}
    </HomeContext.Provider>
  )
}

export function useHome() {
  const context = useContext(HomeContext)
  if (!context) {
    throw new Error('useHome must be used within a HomeProvider')
  }
  return context
}
