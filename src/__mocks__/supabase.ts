import { vi } from 'vitest'

const mockGetSession = vi.fn()
const mockGetUser = vi.fn()
const mockSignIn = vi.fn()
const mockSignUp = vi.fn()
const mockSignOut = vi.fn()
const mockOnAuthStateChange = vi.fn()

export const mockSupabase = {
  auth: {
    getSession: mockGetSession,
    getUser: mockGetUser,
    signInWithPassword: mockSignIn,
    signUp: mockSignUp,
    signOut: mockSignOut,
    onAuthStateChange: mockOnAuthStateChange,
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn().mockResolvedValue({ data: [], error: null }),
  })),
  rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
}

export function resetMocks() {
  vi.clearAllMocks()
  mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
  mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
  mockSignIn.mockResolvedValue({ data: { user: null, session: null }, error: null })
  mockSignUp.mockResolvedValue({ data: { user: null, session: null }, error: null })
  mockSignOut.mockResolvedValue({ error: null })
  mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
}
