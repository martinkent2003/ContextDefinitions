/**
 * Tests for hooks/useUpload.tsx
 *
 * UploadProvider manages the file/image/text upload workflow,
 * modal visibility flags, and OCR processing.
 *
 * Mocks:
 *  - @/services/ocr       — ocrExtract
 *  - @/services/readings  — uploadReading
 *  - @hooks/useLoading    — showLoading, hideLoading
 *  - @hooks/useHome       — refreshReadings
 *  - react-native Alert   — alert
 *  - Platform.OS          — controlled per test
 */
import { act, renderHook } from '@testing-library/react-native'
import React from 'react'
import { Platform } from 'react-native'

import { UploadProvider, useUpload } from '@/hooks/useUpload'

// ── Service mocks ─────────────────────────────────────────────────────────────

const mockOcrExtract = jest.fn()
const mockUploadReading = jest.fn()

jest.mock('@/services/ocr', () => ({
  ocrExtract: (...args: any[]) => mockOcrExtract(...args),
}))

jest.mock('@/services/readings', () => ({
  uploadReading: (...args: any[]) => mockUploadReading(...args),
}))

// ── Hook mocks ────────────────────────────────────────────────────────────────

const mockShowLoading = jest.fn()
const mockHideLoading = jest.fn()
jest.mock('@hooks/useLoading', () => ({
  useLoading: () => ({ showLoading: mockShowLoading, hideLoading: mockHideLoading }),
}))

const mockRefreshReadings = jest.fn().mockResolvedValue(undefined)
jest.mock('@hooks/useHome', () => ({
  useHome: () => ({ refreshReadings: mockRefreshReadings }),
}))

const mockAlert = jest.fn()
jest
  .spyOn(require('react-native'), 'Alert', 'get')
  .mockReturnValue({ alert: (...args: any[]) => mockAlert(...args) })

// ─────────────────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UploadProvider>{children}</UploadProvider>
)

beforeEach(() => {
  jest.clearAllMocks()
  jest.replaceProperty(Platform, 'OS', 'ios')
})

// ─────────────────────────────────────────────────────────────────────────────

describe('useUpload — initial state', () => {
  it('starts with empty upload and no modals open', () => {
    const { result } = renderHook(() => useUpload(), { wrapper })

    expect(result.current.upload).toEqual({ images: [], file: null, text: null })
    expect(result.current.metadata).toBeNull()
    expect(result.current.isConfirmTextModalVisible).toBe(false)
    expect(result.current.isConfirmImageModalVisible).toBe(false)
    expect(result.current.isConfirmFileModalVisible).toBe(false)
    expect(result.current.isConfirmScanModalVisible).toBe(false)
  })
})

describe('useUpload — setImages', () => {
  it('sets upload.images and clears file and text', () => {
    const { result } = renderHook(() => useUpload(), { wrapper })

    act(() => {
      result.current.setImages(['/a.jpg', '/b.jpg'])
    })

    expect(result.current.upload.images).toEqual(['/a.jpg', '/b.jpg'])
    expect(result.current.upload.file).toBeNull()
    expect(result.current.upload.text).toBeNull()
    expect(result.current.metadata).toBeNull()
  })
})

describe('useUpload — setFile', () => {
  it('sets upload.file and clears images and text', () => {
    const { result } = renderHook(() => useUpload(), { wrapper })

    act(() => {
      result.current.setFile({ uri: '/doc.pdf', name: 'doc.pdf' })
    })

    expect(result.current.upload.file).toEqual({ uri: '/doc.pdf', name: 'doc.pdf' })
    expect(result.current.upload.images).toEqual([])
    expect(result.current.upload.text).toBeNull()
    expect(result.current.metadata).toBeNull()
  })
})

describe('useUpload — clearUpload', () => {
  it('resets upload and metadata to defaults', () => {
    const { result } = renderHook(() => useUpload(), { wrapper })

    act(() => {
      result.current.setImages(['/a.jpg'])
    })
    act(() => {
      result.current.clearUpload()
    })

    expect(result.current.upload).toEqual({ images: [], file: null, text: null })
    expect(result.current.metadata).toBeNull()
  })
})

describe('useUpload — processUpload', () => {
  it('calls ocrExtract with images and shows then hides loading', async () => {
    mockOcrExtract.mockResolvedValue('extracted text')

    const { result } = renderHook(() => useUpload(), { wrapper })

    act(() => {
      result.current.setImages(['/img.jpg'])
    })

    await act(async () => {
      await result.current.processUpload()
    })

    expect(mockShowLoading).toHaveBeenCalled()
    expect(mockOcrExtract).toHaveBeenCalledWith('en', ['/img.jpg'])
    expect(mockHideLoading).toHaveBeenCalled()
    expect(result.current.upload.text).toBe('extracted text')
  })

  it('calls ocrExtract with file URI when file is set (no images)', async () => {
    mockOcrExtract.mockResolvedValue('file text')

    const { result } = renderHook(() => useUpload(), { wrapper })

    act(() => {
      result.current.setFile({ uri: '/doc.pdf', name: 'doc.pdf' })
    })

    await act(async () => {
      await result.current.processUpload()
    })

    expect(mockOcrExtract).toHaveBeenCalledWith('en', ['/doc.pdf'])
    expect(result.current.upload.text).toBe('file text')
  })

  it('opens the confirm text modal after processing', async () => {
    mockOcrExtract.mockResolvedValue('text')

    const { result } = renderHook(() => useUpload(), { wrapper })
    act(() => {
      result.current.setImages(['/img.jpg'])
    })

    await act(async () => {
      await result.current.processUpload()
    })

    expect(result.current.isConfirmTextModalVisible).toBe(true)
  })

  it('still hides loading when ocrExtract throws', async () => {
    mockOcrExtract.mockRejectedValue(new Error('OCR failed'))

    const { result } = renderHook(() => useUpload(), { wrapper })
    act(() => {
      result.current.setImages(['/img.jpg'])
    })

    await act(async () => {
      try {
        await result.current.processUpload()
      } catch {}
    })

    expect(mockHideLoading).toHaveBeenCalled()
  })
})

describe('useUpload — modal visibility', () => {
  it('showConfirmTextModal / hideConfirmTextModal toggle correctly', () => {
    const { result } = renderHook(() => useUpload(), { wrapper })

    act(() => {
      result.current.showConfirmTextModal()
    })
    expect(result.current.isConfirmTextModalVisible).toBe(true)

    act(() => {
      result.current.hideConfirmTextModal()
    })
    expect(result.current.isConfirmTextModalVisible).toBe(false)
  })

  it('showConfirmImageModal / hideConfirmImageModal toggle correctly', () => {
    const { result } = renderHook(() => useUpload(), { wrapper })

    act(() => {
      result.current.showConfirmImageModal()
    })
    expect(result.current.isConfirmImageModalVisible).toBe(true)

    act(() => {
      result.current.hideConfirmImageModal()
    })
    expect(result.current.isConfirmImageModalVisible).toBe(false)
  })

  it('showConfirmFileModal / hideConfirmFileModal toggle correctly', () => {
    const { result } = renderHook(() => useUpload(), { wrapper })

    act(() => {
      result.current.showConfirmFileModal()
    })
    expect(result.current.isConfirmFileModalVisible).toBe(true)

    act(() => {
      result.current.hideConfirmFileModal()
    })
    expect(result.current.isConfirmFileModalVisible).toBe(false)
  })

  it('showConfirmScanModal opens modal on native', () => {
    jest.replaceProperty(Platform, 'OS', 'ios')
    const { result } = renderHook(() => useUpload(), { wrapper })

    act(() => {
      result.current.showConfirmScanModal()
    })
    expect(result.current.isConfirmScanModalVisible).toBe(true)
  })

  it('showConfirmScanModal shows Alert on web instead of opening modal', () => {
    jest.replaceProperty(Platform, 'OS', 'web')
    const { result } = renderHook(() => useUpload(), { wrapper })

    act(() => {
      result.current.showConfirmScanModal()
    })

    // Modal should NOT open on web
    expect(result.current.isConfirmScanModalVisible).toBe(false)
  })

  it('hideConfirmScanModal closes the scan modal', () => {
    jest.replaceProperty(Platform, 'OS', 'ios')
    const { result } = renderHook(() => useUpload(), { wrapper })

    act(() => {
      result.current.showConfirmScanModal()
    })
    act(() => {
      result.current.hideConfirmScanModal()
    })

    expect(result.current.isConfirmScanModalVisible).toBe(false)
  })

  it('modal flags are independent of each other', () => {
    const { result } = renderHook(() => useUpload(), { wrapper })

    act(() => {
      result.current.showConfirmImageModal()
    })

    expect(result.current.isConfirmImageModalVisible).toBe(true)
    expect(result.current.isConfirmTextModalVisible).toBe(false)
    expect(result.current.isConfirmFileModalVisible).toBe(false)
    expect(result.current.isConfirmScanModalVisible).toBe(false)
  })
})
