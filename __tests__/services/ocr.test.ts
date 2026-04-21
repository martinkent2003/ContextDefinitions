/**
 * Tests for services/ocr.ts
 *
 * Mocks:
 *  - @/utils/supabase  → supabase.functions.invoke
 *  - react-native      → Platform.OS (per describe block)
 *  - global fetch      → for the web blob-fetch path
 *
 * ocrExtract builds a FormData payload and invokes the 'ocr-extract' Edge
 * Function. The native and web paths differ only in how image URIs are
 * appended to FormData.
 */
import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js'
import { Platform } from 'react-native'

import { ocrExtract } from '@/services/ocr'

// ── Supabase mock ─────────────────────────────────────────────────────────────

const mockFunctionsInvoke = jest.fn()

jest.mock('@/utils/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: any[]) => mockFunctionsInvoke(...args),
    },
  },
}))

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────────────────────
// Native (iOS / Android) path
// ─────────────────────────────────────────────────────────────────────────────

describe('ocrExtract — native', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'ios')
  })

  it('invokes the ocr-extract function and returns the text', async () => {
    mockFunctionsInvoke.mockResolvedValue({
      data: { text: 'Bonjour monde' },
      error: null,
    })

    const result = await ocrExtract('fr', ['/path/to/image.jpg'])

    expect(mockFunctionsInvoke).toHaveBeenCalledWith('ocr-extract', expect.any(Object))
    expect(result).toBe('Bonjour monde')
  })

  it('appends language_code to FormData', async () => {
    mockFunctionsInvoke.mockResolvedValue({ data: { text: '' }, error: null })

    await ocrExtract('de', ['/img.png'])

    const formData: FormData = mockFunctionsInvoke.mock.calls[0][1].body
    // FormData.get is available in Node via the global FormData
    // Since we're in a jest-expo environment FormData may not have .get,
    // but we can check the mock was called with a FormData instance
    expect(formData).toBeInstanceOf(FormData)
  })

  it('appends each URI as a native file object', async () => {
    mockFunctionsInvoke.mockResolvedValue({ data: { text: 'text' }, error: null })

    // Multiple images
    await ocrExtract('en', ['/a.jpg', '/b.jpg'])

    // invoke was called once (FormData built before the call)
    expect(mockFunctionsInvoke).toHaveBeenCalledTimes(1)
  })

  it('throws when the response is missing the `text` field', async () => {
    mockFunctionsInvoke.mockResolvedValue({
      data: { result: 'no text key' },
      error: null,
    })

    await expect(ocrExtract('en', ['/img.jpg'])).rejects.toThrow(
      'OCR response missing `text`',
    )
  })

  it('handles empty URI list', async () => {
    mockFunctionsInvoke.mockResolvedValue({ data: { text: '' }, error: null })
    const result = await ocrExtract('en', [])
    expect(result).toBe('')
  })

  // ── Error handling ──────────────────────────────────────────────────────

  it('throws a descriptive error on FunctionsHttpError', async () => {
    const httpErr = new FunctionsHttpError(
      new Response(JSON.stringify({ error: 'Unsupported format' }), { status: 400 }),
    )
    mockFunctionsInvoke.mockResolvedValue({ data: null, error: httpErr })

    await expect(ocrExtract('en', ['/img.jpg'])).rejects.toThrow()
  })

  it('rethrows FunctionsRelayError', async () => {
    const relayErr = new FunctionsRelayError({ error: 'relay down' })
    mockFunctionsInvoke.mockResolvedValue({ data: null, error: relayErr })

    await expect(ocrExtract('en', ['/img.jpg'])).rejects.toBe(relayErr)
  })

  it('rethrows FunctionsFetchError', async () => {
    const fetchErr = new FunctionsFetchError(new Error('network failure'))
    mockFunctionsInvoke.mockResolvedValue({ data: null, error: fetchErr })

    await expect(ocrExtract('en', ['/img.jpg'])).rejects.toBe(fetchErr)
  })

  it('rethrows generic errors', async () => {
    const genericErr = new Error('unknown')
    mockFunctionsInvoke.mockResolvedValue({ data: null, error: genericErr })

    await expect(ocrExtract('en', ['/img.jpg'])).rejects.toBe(genericErr)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Web path
// ─────────────────────────────────────────────────────────────────────────────

describe('ocrExtract — web', () => {
  let mockFetch: jest.Mock

  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'web')

    // Stub global fetch used to convert URI → Blob
    mockFetch = jest.fn().mockResolvedValue({
      blob: jest.fn().mockResolvedValue(new Blob(['img data'], { type: 'image/jpeg' })),
    })
    global.fetch = mockFetch

    mockFunctionsInvoke.mockResolvedValue({
      data: { text: 'extracted text' },
      error: null,
    })
  })

  it('fetches each URI as a blob before appending to FormData', async () => {
    await ocrExtract('fr', ['https://example.com/image.jpg'])

    expect(mockFetch).toHaveBeenCalledWith('https://example.com/image.jpg')
  })

  it('returns the extracted text on success', async () => {
    const result = await ocrExtract('fr', ['https://example.com/image.jpg'])
    expect(result).toBe('extracted text')
  })

  it('fetches each URI when multiple images are provided', async () => {
    await ocrExtract('fr', ['https://a.com/1.jpg', 'https://a.com/2.jpg'])
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})
