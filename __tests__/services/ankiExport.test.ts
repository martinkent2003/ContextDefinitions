/**
 * Tests for services/ankiExport.ts
 *
 * Pure functions (buildAnkiContent, buildBack, escapeField) are tested directly.
 * exportToAnki is tested with Platform.OS mocked for web / iOS / Android paths.
 *
 * Note: buildAnkiContent, buildBack, and escapeField are not exported — we test
 * their behaviour through the exported exportToAnki by inspecting what gets
 * written or downloaded.
 */
import { Platform } from 'react-native'

import { exportToAnki } from '@/services/ankiExport'
import type { SavedWord } from '@/types/words'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockOpenDocument = jest.fn().mockResolvedValue(undefined)
const mockActionViewIntent = jest.fn().mockResolvedValue(undefined)
const mockWriteFile = jest.fn().mockResolvedValue(undefined)

// CacheDir must be hardcoded in the factory — jest.mock is hoisted before
// variable declarations, so a const reference would be undefined at factory time.
const mockCacheDir = '/mock/cache'

jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {
    fs: {
      dirs: { CacheDir: '/mock/cache' },
      writeFile: (...args: any[]) => mockWriteFile(...args),
    },
    ios: { openDocument: (...args: any[]) => mockOpenDocument(...args) },
    android: { actionViewIntent: (...args: any[]) => mockActionViewIntent(...args) },
  },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeWord(overrides: Partial<SavedWord> = {}): SavedWord {
  return {
    id: 'w-1',
    text: 'bonjour',
    definition: '• hello\n• hi',
    translation: 'hello',
    context: 'Bonjour monde',
    selection: { tokenStart: 0, tokenEnd: 1, sentenceIndex: 0 } as any,
    selection_start: 0,
    selection_end: 7,
    part_of_speech: 'noun',
    examples: [],
    ...overrides,
  }
}

// Capture the file content written by exportToAnki on native platforms
function capturedContent(): string {
  return mockWriteFile.mock.calls[0][1] as string
}

// ── escapeField (tested indirectly via content output) ────────────────────────

describe('field escaping', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'ios')
    mockWriteFile.mockClear()
    mockOpenDocument.mockClear()
  })

  it('replaces tab characters in word text with a space', async () => {
    await exportToAnki([makeWord({ text: 'bon\tjour' })])
    expect(capturedContent()).not.toContain('\t\t') // tab between front/back is the separator; no extra tab in front field
    expect(capturedContent()).toContain('bon jour')
  })

  it('replaces newlines with <br> in word text', async () => {
    await exportToAnki([makeWord({ text: 'line1\nline2' })])
    expect(capturedContent()).toContain('line1<br>line2')
  })

  it('replaces tabs in translation with a space', async () => {
    await exportToAnki([makeWord({ translation: 'hel\tlo' })])
    expect(capturedContent()).toContain('<b>hel lo</b>')
  })

  it('replaces newlines in definition with <br>', async () => {
    await exportToAnki([makeWord({ definition: 'line1\nline2' })])
    expect(capturedContent()).toContain('line1<br>line2')
  })
})

// ── buildAnkiContent (header + rows) ─────────────────────────────────────────

describe('Anki file content structure', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'ios')
    mockWriteFile.mockClear()
    mockOpenDocument.mockClear()
  })

  it('includes required Anki header lines', async () => {
    await exportToAnki([makeWord()])
    const content = capturedContent()
    expect(content).toContain('#separator:tab')
    expect(content).toContain('#html:true')
    expect(content).toContain('#notetype:Basic')
  })

  it('produces one data row per word', async () => {
    await exportToAnki([
      makeWord({ text: 'word1' }),
      makeWord({ text: 'word2', id: 'w-2' }),
    ])
    const lines = capturedContent().split('\n')
    const dataLines = lines.filter((l) => !l.startsWith('#') && l.trim())
    expect(dataLines).toHaveLength(2)
  })

  it('front field is the word text', async () => {
    await exportToAnki([makeWord({ text: 'bonjour' })])
    const dataLine = capturedContent()
      .split('\n')
      .find((l) => !l.startsWith('#'))!
    expect(dataLine.startsWith('bonjour\t')).toBe(true)
  })

  it('back field contains bold translation', async () => {
    await exportToAnki([makeWord({ translation: 'hello' })])
    const content = capturedContent()
    expect(content).toContain('<b>hello</b>')
  })

  it('back field contains definition', async () => {
    await exportToAnki([makeWord({ definition: 'a greeting' })])
    expect(capturedContent()).toContain('a greeting')
  })

  it('back field contains context when present', async () => {
    await exportToAnki([makeWord({ context: 'Bonjour monde' })])
    expect(capturedContent()).toContain('<i>Context:</i> Bonjour monde')
  })

  it('back field omits context section when context is empty', async () => {
    await exportToAnki([makeWord({ context: '' })])
    expect(capturedContent()).not.toContain('<i>Context:</i>')
  })

  it('back field contains part of speech when present', async () => {
    await exportToAnki([makeWord({ part_of_speech: 'verb' })])
    expect(capturedContent()).toContain('<i>Part of speech:</i> verb')
  })

  it('back field omits part of speech section when null', async () => {
    await exportToAnki([makeWord({ part_of_speech: null })])
    expect(capturedContent()).not.toContain('<i>Part of speech:</i>')
  })

  it('produces only header lines for empty word list', async () => {
    await exportToAnki([])
    const lines = capturedContent().split('\n').filter(Boolean)
    expect(lines.every((l) => l.startsWith('#'))).toBe(true)
  })
})

// ── File name ─────────────────────────────────────────────────────────────────

describe('file naming', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'ios')
    mockWriteFile.mockClear()
    mockOpenDocument.mockClear()
  })

  it('uses default filename when no title provided', async () => {
    await exportToAnki([makeWord()])
    const path: string = mockWriteFile.mock.calls[0][0]
    expect(path).toContain('anki_flashcards.txt')
  })

  it('slugifies the title into the filename', async () => {
    await exportToAnki([makeWord()], 'My Reading Title!')
    const path: string = mockWriteFile.mock.calls[0][0]
    expect(path).toContain('anki_my_reading_title.txt')
  })
})

// ── Platform: iOS ─────────────────────────────────────────────────────────────

describe('exportToAnki — iOS', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'ios')
    mockWriteFile.mockClear()
    mockOpenDocument.mockClear()
  })

  it('writes the file to CacheDir', async () => {
    await exportToAnki([makeWord()])
    expect(mockWriteFile).toHaveBeenCalledTimes(1)
    expect(mockWriteFile.mock.calls[0][0]).toContain(mockCacheDir)
  })

  it('calls RNBlobUtil.ios.openDocument with the file path', async () => {
    await exportToAnki([makeWord()])
    expect(mockOpenDocument).toHaveBeenCalledTimes(1)
    expect(mockOpenDocument.mock.calls[0][0]).toContain(mockCacheDir)
  })

  it('does not call android.actionViewIntent', async () => {
    await exportToAnki([makeWord()])
    expect(mockActionViewIntent).not.toHaveBeenCalled()
  })
})

// ── Platform: Android ─────────────────────────────────────────────────────────

describe('exportToAnki — Android', () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'android')
    mockWriteFile.mockClear()
    mockActionViewIntent.mockClear()
    mockOpenDocument.mockClear()
  })

  it('writes the file to CacheDir', async () => {
    await exportToAnki([makeWord()])
    expect(mockWriteFile).toHaveBeenCalledTimes(1)
  })

  it('calls RNBlobUtil.android.actionViewIntent with path and mime type', async () => {
    await exportToAnki([makeWord()])
    expect(mockActionViewIntent).toHaveBeenCalledTimes(1)
    expect(mockActionViewIntent.mock.calls[0][1]).toBe('text/plain')
  })

  it('does not call ios.openDocument', async () => {
    await exportToAnki([makeWord()])
    expect(mockOpenDocument).not.toHaveBeenCalled()
  })
})

// ── Platform: Web ─────────────────────────────────────────────────────────────

describe('exportToAnki — web', () => {
  let mockAnchorClick: jest.Mock
  let mockCreateObjectURL: jest.Mock
  let mockRevokeObjectURL: jest.Mock

  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'web')
    mockWriteFile.mockClear()

    mockAnchorClick = jest.fn()
    mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock-url')
    mockRevokeObjectURL = jest.fn()

    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL

    const anchor = { href: '', download: '', click: mockAnchorClick }
    // document is not available in the Node test environment — mock it directly
    ;(global as any).document = { createElement: jest.fn().mockReturnValue(anchor) }
  })

  afterEach(() => {
    delete (global as any).document
  })

  it('does not write to native filesystem', async () => {
    await exportToAnki([makeWord()])
    expect(mockWriteFile).not.toHaveBeenCalled()
  })

  it('creates a Blob and triggers anchor click', async () => {
    await exportToAnki([makeWord()])
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1)
    expect(mockAnchorClick).toHaveBeenCalledTimes(1)
  })

  it('revokes the object URL after download', async () => {
    await exportToAnki([makeWord()])
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })
})
