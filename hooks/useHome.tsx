import { createContext, useContext, useEffect, useState } from 'react'
import {
  fetchAllAvailableReadings,
  fetchFeedReadings,
  fetchSavedReadings,
} from '@/services/readings'
import type { ReadingMetadata } from '@/types/readings'
import { useLoading } from '@hooks/useLoading'

type HomeContextType = {
  // Data
  readings: ReadingMetadata[]
  selectedSegment: string
  setSelectedSegment: (segment: string) => void
  refreshReadings: () => Promise<void>

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
