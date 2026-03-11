import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { useSession } from '@/hooks/useSession'
import { fetchProfileById } from '@/services/profile'
import type { Profile } from '@/types/profile'

type ProfileContextType = {
  profile: Profile | null
  isLoading: boolean
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  isLoading: true,
  refreshProfile: async () => {},
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!session?.user?.id) {
      setProfile(null)
      setIsLoading(false)
      return
    }

    const { data, error } = await fetchProfileById(session.user.id)

    if (!error && data) {
      setProfile(data)
    }
    console.log('[useProfile] fetchProfile result:', { data, error })
    setIsLoading(false)
  }, [session?.user?.id])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return (
    <ProfileContext.Provider value={{ profile, isLoading, refreshProfile: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
