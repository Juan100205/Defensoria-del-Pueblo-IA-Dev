import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}))

describe('App routing', () => {
  it('renders portal scene by default', async () => {
    const { default: App } = await import('../App')
    const { AuthProvider } = await import('../contexts/AuthContext')
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    )
    await waitFor(() => {
      expect(screen.getByText(/Defensor.a del Pueblo/)).toBeInTheDocument()
    }, { timeout: 10000 })
  }, 15000)
})
