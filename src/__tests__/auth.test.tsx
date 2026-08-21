import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

const mockGetSession = vi.hoisted(() => vi.fn())
const mockSignInWithPassword = vi.hoisted(() => vi.fn())
const mockSignOut = vi.hoisted(() => vi.fn())
const mockOnAuthStateChange = vi.hoisted(() => vi.fn())

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      signInWithPassword: mockSignInWithPassword,
      signUp: vi.fn(),
      signOut: mockSignOut,
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}))

import { AuthProvider, useAuth } from '../contexts/AuthContext'

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

const mockUser = { id: 'uid-1', email: 't@t.com', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: '2026-01-01' }

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
  })

  it('starts in loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.loading).toBe(true)
  })

  it('signIn calls signInWithPassword', async () => {
    mockSignInWithPassword.mockResolvedValue({ data: { user: mockUser, session: { access_token: 't' } }, error: null })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    const res = await result.current.signIn('t@t.com', 'pass')
    expect(res.error).toBeUndefined()
    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 't@t.com', password: 'pass' })
  })

  it('signIn returns error on failure', async () => {
    mockSignInWithPassword.mockResolvedValue({ data: null, error: { message: 'Invalid' } })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    const res = await result.current.signIn('x@x.com', 'bad')
    expect(res.error).toBe('Invalid')
  })

  it('signOut calls supabase signOut', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))
    await result.current.signOut()
    expect(mockSignOut).toHaveBeenCalled()
  })

  it('subscribes to auth state changes', () => {
    renderHook(() => useAuth(), { wrapper })
    expect(mockOnAuthStateChange).toHaveBeenCalled()
  })
})
