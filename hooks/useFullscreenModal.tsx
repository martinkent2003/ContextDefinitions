import React from 'react'

type FullscreenModalContextType = {
  isFullscreenModalOpen: boolean
  setIsFullscreenModalOpen: (open: boolean) => void
}

const FullscreenModalContext = React.createContext<FullscreenModalContextType>({
  isFullscreenModalOpen: false,
  setIsFullscreenModalOpen: () => {},
})

export function FullscreenModalProvider({ children }: { children: React.ReactNode }) {
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = React.useState(false)
  return (
    <FullscreenModalContext.Provider
      value={{ isFullscreenModalOpen, setIsFullscreenModalOpen }}
    >
      {children}
    </FullscreenModalContext.Provider>
  )
}

export function useFullscreenModal() {
  return React.useContext(FullscreenModalContext)
}
