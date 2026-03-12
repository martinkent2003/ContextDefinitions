import { createContext, useContext, useState } from 'react'
import { Alert, Platform } from 'react-native'
import { ocrExtract } from '@/services/ocr'
import { uploadReading } from '@/services/readings'
import type { UploadedFile, UploadMetadata } from '@/types/upload'
import { useHome } from '@hooks/useHome'
import { useLoading } from '@hooks/useLoading'
import { useProfile } from '@hooks/useProfile'

type UploadContextType = {
  // Data
  upload: UploadedFile
  metadata: UploadMetadata | null

  // Setters
  setImages: (uris: string[]) => void
  setFile: (file: { uri: string; name: string }) => void
  setText: (content: string, title: string, genre: string, privacy: boolean) => void
  processUpload: () => Promise<void>
  clearUpload: () => void

  // Modal visibility
  isConfirmTextModalVisible: boolean
  isConfirmImageModalVisible: boolean
  isConfirmFileModalVisible: boolean
  isConfirmScanModalVisible: boolean
  showConfirmTextModal: () => void
  hideConfirmTextModal: () => void
  showConfirmImageModal: () => void
  hideConfirmImageModal: () => void
  showConfirmFileModal: () => void
  hideConfirmFileModal: () => void
  showConfirmScanModal: () => void
  hideConfirmScanModal: () => void
}

const defaultUpload: UploadedFile = {
  images: [],
  file: null,
  text: null,
}

const UploadContext = createContext<UploadContextType | null>(null)

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [upload, setUpload] = useState<UploadedFile>(defaultUpload)
  const [metadata, setMetadata] = useState<UploadMetadata | null>(null)
  const [isConfirmTextModalVisible, setTextModalVisible] = useState(false)
  const [isConfirmImageModalVisible, setConfirmImagesVisible] = useState(false)
  const [isConfirmFileModalVisible, setConfirmFileVisible] = useState(false)
  const [isConfirmScanModalVisible, setConfirmScanVisible] = useState(false)
  const { showLoading, hideLoading } = useLoading()
  const { profile } = useProfile()

  const { refreshReadings } = useHome()

  const setImages = (uris: string[]) => {
    setUpload({ images: uris, file: null, text: null })
    setMetadata(null)
  }

  const setFile = (file: { uri: string; name: string }) => {
    setUpload({ images: [], file, text: null })
    setMetadata(null)
  }

  const setText = async (
    content: string,
    title: string,
    genre: string,
    privacy: boolean,
  ) => {
    setUpload({ images: [], file: null, text: content })
    setMetadata({ title, genre, privacy })
    try {
      showLoading('Uploading Reading...', 'book')
      const success = await uploadReading(
        content,
        title,
        genre,
        privacy,
        profile?.target_language ?? 'en',
      )
      hideLoading()
      if (success) {
        Alert.alert('Successfully uploaded ' + title)
        refreshReadings()
      } else {
        Alert.alert('Failed to upload', 'There was an error uploading ' + title)
      }
    } catch (err) {
      hideLoading()
      Alert.alert('Failed to upload', 'There was an error uploading ' + title)
    }
  }

  const processUpload = async () => {
    showLoading('Processing document...', 'book')
    try {
      let text = ''
      if (upload.images.length > 0) {
        text = await ocrExtract('en', upload.images)
      } else if (upload.file) {
        text = await ocrExtract('en', [upload.file.uri])
      }
      setUpload((prev) => ({ ...prev, text }))
      setTextModalVisible(true)
    } finally {
      hideLoading()
    }
  }

  const clearUpload = () => {
    setUpload(defaultUpload)
    setMetadata(null)
  }

  return (
    <UploadContext.Provider
      value={{
        upload,
        metadata,
        setImages,
        setFile,
        setText,
        processUpload,
        clearUpload,
        isConfirmTextModalVisible,
        showConfirmTextModal: () => setTextModalVisible(true),
        hideConfirmTextModal: () => setTextModalVisible(false),
        isConfirmImageModalVisible,
        showConfirmImageModal: () => setConfirmImagesVisible(true),
        hideConfirmImageModal: () => setConfirmImagesVisible(false),
        isConfirmFileModalVisible,
        showConfirmFileModal: () => setConfirmFileVisible(true),
        hideConfirmFileModal: () => setConfirmFileVisible(false),
        isConfirmScanModalVisible,
        showConfirmScanModal: () =>
          Platform.OS === 'web'
            ? Alert.alert(
                'Not available',
                'Document scanning is only available on mobile.',
              )
            : setConfirmScanVisible(true),
        hideConfirmScanModal: () => setConfirmScanVisible(false),
      }}
    >
      {children}
    </UploadContext.Provider>
  )
}

export function useUpload() {
  const context = useContext(UploadContext)
  if (!context) {
    throw new Error('useUpload must be used within an UploadProvider')
  }
  return context
}
