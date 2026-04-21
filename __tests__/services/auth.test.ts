/**
 * Tests for services/auth.ts
 *
 * Mocks @utils/supabase so no real network calls are made.
 * Each function is a thin wrapper — tests verify the right Supabase method is
 * called with the right arguments and that results are propagated correctly.
 */
import {
  checkEmailAvailable,
  resendSignUpOtp,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  updateProfile,
  verifyOtp,
} from '@/services/auth'

// ── Supabase auth mock ────────────────────────────────────────────────────────

const mockSignInWithPassword = jest.fn()
const mockSignUp = jest.fn()
const mockVerifyOtp = jest.fn()
const mockResend = jest.fn()
const mockSignInWithOtp = jest.fn()
const mockSignOut = jest.fn()
const mockUpsert = jest.fn()
const mockFrom = jest.fn()

jest.mock('@utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args),
      signUp: (...args: any[]) => mockSignUp(...args),
      verifyOtp: (...args: any[]) => mockVerifyOtp(...args),
      resend: (...args: any[]) => mockResend(...args),
      signInWithOtp: (...args: any[]) => mockSignInWithOtp(...args),
      signOut: (...args: any[]) => mockSignOut(...args),
    },
    from: (...args: any[]) => mockFrom(...args),
  },
}))

// ── Chain helper (for from().upsert()) ───────────────────────────────────────

function chain(result: { data: any; error: any }) {
  const c: any = {}
  for (const m of ['upsert', 'update', 'eq', 'select'])
    c[m] = jest.fn().mockReturnValue(c)
  c.then = (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject)
  c.single = jest.fn().mockResolvedValue(result)
  return c
}

// ─────────────────────────────────────────────────────────────────────────────

describe('signInWithEmail', () => {
  it('calls supabase.auth.signInWithPassword with email and password', async () => {
    const mockResult = { data: { user: { id: 'u-1' } }, error: null }
    mockSignInWithPassword.mockResolvedValue(mockResult)

    const result = await signInWithEmail('test@example.com', 'secret123')

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret123',
    })
    expect(result).toEqual(mockResult)
  })

  it('propagates Supabase error on bad credentials', async () => {
    const err = { message: 'Invalid login credentials' }
    mockSignInWithPassword.mockResolvedValue({ data: null, error: err })

    const { error } = await signInWithEmail('bad@example.com', 'wrong')
    expect(error).toEqual(err)
  })
})

describe('signUpWithEmail', () => {
  it('calls signUp without options when no metadata provided', async () => {
    mockSignUp.mockResolvedValue({ data: {}, error: null })

    await signUpWithEmail({ email: 'new@example.com', password: 'pass123' })

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'pass123',
    })
  })

  it('includes user metadata options when metadata is provided', async () => {
    mockSignUp.mockResolvedValue({ data: {}, error: null })

    await signUpWithEmail(
      { email: 'new@example.com', password: 'pass123' },
      {
        username: 'alice',
        fullName: 'Alice Smith',
        nativeLanguage: 'en',
        targetLanguage: 'fr',
      },
    )

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'pass123',
      options: {
        data: {
          username: 'alice',
          full_name: 'Alice Smith',
          native_language: 'en',
          target_language: 'fr',
        },
      },
    })
  })

  it('propagates signup error', async () => {
    const err = { message: 'Email already in use' }
    mockSignUp.mockResolvedValue({ data: null, error: err })

    const { error } = await signUpWithEmail({ email: 'x@x.com', password: 'p' })
    expect(error).toEqual(err)
  })
})

describe('verifyOtp', () => {
  it('calls supabase.auth.verifyOtp with type "signup"', async () => {
    mockVerifyOtp.mockResolvedValue({ data: {}, error: null })

    await verifyOtp('user@example.com', '123456')

    expect(mockVerifyOtp).toHaveBeenCalledWith({
      email: 'user@example.com',
      token: '123456',
      type: 'signup',
    })
  })

  it('propagates error on invalid token', async () => {
    const err = { message: 'Token expired' }
    mockVerifyOtp.mockResolvedValue({ data: null, error: err })

    const { error } = await verifyOtp('user@example.com', 'badtoken')
    expect(error).toEqual(err)
  })
})

describe('resendSignUpOtp', () => {
  it('calls supabase.auth.resend with type "signup"', async () => {
    mockResend.mockResolvedValue({ data: {}, error: null })

    await resendSignUpOtp('user@example.com')

    expect(mockResend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'user@example.com',
    })
  })
})

describe('updateProfile', () => {
  it('upserts profile data into profiles table', async () => {
    mockFrom.mockReturnValue(chain({ data: {}, error: null }))

    await updateProfile('u-1', {
      username: 'bob',
      fullName: 'Bob Jones',
      nativeLanguage: 'en',
      targetLanguage: 'es',
    })

    expect(mockFrom).toHaveBeenCalledWith('profiles')
    const upsertCall = mockFrom.mock.results[0].value.upsert.mock.calls[0]
    expect(upsertCall[0]).toMatchObject({
      id: 'u-1',
      username: 'bob',
      full_name: 'Bob Jones',
      native_language: 'en',
      target_language: 'es',
    })
    expect(upsertCall[1]).toEqual({ onConflict: 'id' })
  })
})

describe('checkEmailAvailable', () => {
  it('returns available: true when signInWithOtp returns an error (no user found)', async () => {
    // Error means the email has no existing account — it is free
    mockSignInWithOtp.mockResolvedValue({ error: { message: 'Signups not allowed' } })

    const { available } = await checkEmailAvailable('free@example.com')
    expect(available).toBe(true)
  })

  it('returns available: false when signInWithOtp returns no error (OTP sent to existing user)', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })

    const { available } = await checkEmailAvailable('taken@example.com')
    expect(available).toBe(false)
  })

  it('calls signInWithOtp with shouldCreateUser: false', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })

    await checkEmailAvailable('any@example.com')

    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'any@example.com',
      options: { shouldCreateUser: false },
    })
  })
})

describe('signOut', () => {
  it('calls supabase.auth.signOut and returns the result', async () => {
    mockSignOut.mockResolvedValue({ error: null })

    const { error } = await signOut()

    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(error).toBeNull()
  })

  it('propagates error if signOut fails', async () => {
    const err = { message: 'Network error' }
    mockSignOut.mockResolvedValue({ error: err })

    const { error } = await signOut()
    expect(error).toEqual(err)
  })
})
