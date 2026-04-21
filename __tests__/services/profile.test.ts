/**
 * Tests for services/profile.ts
 *
 * Mocks @utils/supabase so no real network calls are made.
 * Covers:
 *  - fetchProfileById   (Supabase select)
 *  - uploadAvatar       (base64 → Uint8Array → storage upload → public URL)
 *  - updateProfileAvatarUrl (Supabase update)
 */
import {
  fetchProfileById,
  updateProfileAvatarUrl,
  uploadAvatar,
} from '@/services/profile'

// ── Supabase mock ─────────────────────────────────────────────────────────────

const mockGetPublicUrl = jest.fn()
const mockStorageUpload = jest.fn()
const mockStorageFrom = jest.fn()
const mockFrom = jest.fn()

jest.mock('@utils/supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
    storage: {
      from: (...args: any[]) => mockStorageFrom(...args),
    },
  },
}))

// ── Chain helpers ─────────────────────────────────────────────────────────────

function dbChain(result: { data: any; error: any }) {
  const c: any = {}
  for (const m of ['select', 'eq', 'update', 'upsert', 'single']) {
    c[m] = jest.fn().mockReturnValue(c)
  }
  c.then = (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject)
  c.single = jest.fn().mockResolvedValue(result)
  return c
}

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────────────────────
// fetchProfileById
// ─────────────────────────────────────────────────────────────────────────────

describe('fetchProfileById', () => {
  it('queries the profiles table and returns the profile', async () => {
    const profile = {
      id: 'u-1',
      username: 'alice',
      full_name: 'Alice Smith',
      avatar_url: null,
    }
    mockFrom.mockReturnValue(dbChain({ data: profile, error: null }))

    const { data, error } = await fetchProfileById('u-1')

    expect(mockFrom).toHaveBeenCalledWith('profiles')
    expect(data).toEqual(profile)
    expect(error).toBeNull()
  })

  it('returns null data when profile is not found', async () => {
    mockFrom.mockReturnValue(dbChain({ data: null, error: { message: 'No rows found' } }))

    const { data, error } = await fetchProfileById('nonexistent')

    expect(data).toBeNull()
    expect(error).not.toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// uploadAvatar
// ─────────────────────────────────────────────────────────────────────────────

describe('uploadAvatar', () => {
  // atob is available in jsdom environment (jest-expo uses jsdom)
  // A minimal valid base64 for a 1-byte payload: btoa('\x00') = 'AA=='
  const validBase64 = btoa('\x00\x01\x02')
  const userId = 'u-1'
  const ext = 'png'

  it('uploads to the avatars storage bucket with the correct path', async () => {
    const storageBucket = {
      upload: mockStorageUpload.mockResolvedValue({ error: null }),
      getPublicUrl: mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://cdn.example.com/u-1/avatar.png' },
      }),
    }
    mockStorageFrom.mockReturnValue(storageBucket)

    await uploadAvatar(userId, validBase64, ext)

    expect(mockStorageFrom).toHaveBeenCalledWith('avatars')
    expect(mockStorageUpload).toHaveBeenCalledWith(
      `${userId}/avatar.${ext}`,
      expect.any(Uint8Array),
      { upsert: true, contentType: `image/${ext}` },
    )
  })

  it('converts base64 to Uint8Array correctly', async () => {
    const storageBucket = {
      upload: mockStorageUpload.mockResolvedValue({ error: null }),
      getPublicUrl: mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://cdn.example.com/avatar' },
      }),
    }
    mockStorageFrom.mockReturnValue(storageBucket)

    await uploadAvatar(userId, validBase64, ext)

    const uploadedBytes: Uint8Array = mockStorageUpload.mock.calls[0][1]
    expect(uploadedBytes).toBeInstanceOf(Uint8Array)
    // validBase64 = btoa('\x00\x01\x02') → 3 bytes
    expect(uploadedBytes.length).toBe(3)
    expect(uploadedBytes[0]).toBe(0)
    expect(uploadedBytes[1]).toBe(1)
    expect(uploadedBytes[2]).toBe(2)
  })

  it('returns the public URL with a cache-bust timestamp', async () => {
    const baseUrl = 'https://cdn.example.com/u-1/avatar.png'
    const storageBucket = {
      upload: mockStorageUpload.mockResolvedValue({ error: null }),
      getPublicUrl: mockGetPublicUrl.mockReturnValue({ data: { publicUrl: baseUrl } }),
    }
    mockStorageFrom.mockReturnValue(storageBucket)

    const { url, error } = await uploadAvatar(userId, validBase64, ext)

    expect(error).toBeNull()
    expect(url).toMatch(/^https:\/\/cdn\.example\.com\/u-1\/avatar\.png\?t=\d+$/)
  })

  it('returns { url: null, error } when upload fails', async () => {
    const uploadErr = { message: 'Storage quota exceeded' }
    mockStorageFrom.mockReturnValue({
      upload: mockStorageUpload.mockResolvedValue({ error: uploadErr }),
      getPublicUrl: mockGetPublicUrl,
    })

    const { url, error } = await uploadAvatar(userId, validBase64, ext)

    expect(url).toBeNull()
    expect(error).toEqual(uploadErr)
    expect(mockGetPublicUrl).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// updateProfileAvatarUrl
// ─────────────────────────────────────────────────────────────────────────────

describe('updateProfileAvatarUrl', () => {
  it('updates the avatar_url field for the given userId', async () => {
    mockFrom.mockReturnValue(dbChain({ data: null, error: null }))

    const { error } = await updateProfileAvatarUrl(
      'u-1',
      'https://cdn.example.com/avatar.png',
    )

    expect(mockFrom).toHaveBeenCalledWith('profiles')
    expect(error).toBeNull()
  })

  it('propagates Supabase error', async () => {
    const err = { message: 'Update failed' }
    mockFrom.mockReturnValue(dbChain({ data: null, error: err }))

    const { error } = await updateProfileAvatarUrl(
      'u-1',
      'https://cdn.example.com/avatar.png',
    )
    expect(error).toEqual(err)
  })
})
