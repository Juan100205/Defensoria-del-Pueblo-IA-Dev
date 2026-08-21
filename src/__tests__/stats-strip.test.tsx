import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

const mockRpc = vi.hoisted(() => vi.fn())

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) },
    rpc: mockRpc,
  },
}))

import { StatsStrip } from '../features/portal/StatsStrip'

describe('StatsStrip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRpc.mockResolvedValue({
      data: [{ total_solicitudes: 12847, avg_response_days: 4.2, on_time_pct: 96, regionales: 32 }],
      error: null,
    })
  })

  it('renders portal stats with live data', async () => {
    render(<StatsStrip />)
    await waitFor(() => {
      expect(screen.getByText('12.847')).toBeInTheDocument()
    })
    expect(screen.getByText(/4\.2/)).toBeInTheDocument()
    expect(screen.getByText('96%')).toBeInTheDocument()
    expect(screen.getAllByText('32').length).toBeGreaterThanOrEqual(1)
  })

  it('renders labels', async () => {
    render(<StatsStrip />)
    await waitFor(() => {
      expect(screen.getByText(/Solicitudes recibidas en 2026/)).toBeInTheDocument()
    })
    expect(screen.getByText(/Tiempo promedio/)).toBeInTheDocument()
    expect(screen.getByText(/dentro del t.rmino/)).toBeInTheDocument()
    expect(screen.getByText(/Regionales conectadas/)).toBeInTheDocument()
  })

  it('handles empty stats', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    render(<StatsStrip />)
    await waitFor(() => {
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1)
    })
  })
})
