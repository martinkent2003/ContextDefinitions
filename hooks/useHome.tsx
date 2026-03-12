import { useRouter } from 'expo-router'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import {
  fetchAllAvailableReadings,
  fetchFeedReadings,
  fetchSavedReadings,
} from '@/services/readings'
import type { ReadingMetadata } from '@/types/readings'
import { useLoading } from '@hooks/useLoading'
import { useReading } from '@hooks/useReading'

type HomeContextType = {
  // Data
  readings: ReadingMetadata[]
  selectedSegment: string
  setSelectedSegment: (segment: string) => void
  refreshReadings: () => Promise<void>
  handleCardPress: (reading: ReadingMetadata) => Promise<void>

  // Modal visibility
  isProfileModalVisible: boolean
  showProfileModal: () => void
  hideProfileModal: () => void
}

const HomeContext = createContext<HomeContextType | null>(null)

export function HomeProvider({ children }: { children: React.ReactNode }) {
  const [isProfileModalVisible, setProfileModalVisible] = useState(false)
  const [readings, setReadings] = useState<ReadingMetadata[]>([])
  const [selectedSegment, setSelectedSegment] = useState('Feed')
  const { showLoading, hideLoading } = useLoading()
  const { handleReadingChange } = useReading()
  const router = useRouter()
  const isNavigating = useRef(false)

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
    const data = await fetchAllAvailableReadings()
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

  useEffect(() => {
    refreshReadings()
  }, [selectedSegment])

  return (
    <HomeContext.Provider
      value={{
        readings,
        selectedSegment,
        setSelectedSegment,
        refreshReadings,
        handleCardPress,
        isProfileModalVisible,
        showProfileModal: () => setProfileModalVisible(true),
        hideProfileModal: () => setProfileModalVisible(false),
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
