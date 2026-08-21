import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

const mockRpc = vi.hoisted(() => vi.fn())

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) },
    rpc: mockRpc,
  },
}))

import { DashboardView } from '../features/admin/DashboardView'

describe('DashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRpc.mockImplementation(async (fn: string) => {
      const data: Record<string, any> = {
        get_dashboard_stats: { total_cases: 50, active_cases: 40, urgent_cases: 7, resolved_this_month: 3, avg_response_days: 4.2 },
        get_cases_by_department: [{ department: 'Bogota D.C.', count: 12 }, { department: 'Antioquia', count: 8 }],
        get_cases_by_type: [{ type_name: 'Peticion', count: 15 }, { type_name: 'Queja', count: 10 }],
        get_cases_by_week: [{ week_label: 'Ago 4', number: 1, received: 5, resolved: 3 }],
        get_recent_activity: [{ icon: 'doc', color: 'navy', title: 'Nueva solicitud', subtitle: 'DP-2026-000042', created_at: '2026-08-20' }],
      }
      return { data: data[fn] || [], error: null }
    })
  })

  it('renders KPI labels with live data', async () => {
    render(<DashboardView />)
    await waitFor(() => {
      expect(screen.getByText('PQR recibidas')).toBeInTheDocument()
    })
    expect(screen.getAllByText('50').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('En proceso')).toBeInTheDocument()
    expect(screen.getAllByText('Urgentes').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Finalizadas')).toBeInTheDocument()
  })

  it('renders territory map section', async () => {
    render(<DashboardView />)
    await waitFor(() => {
      expect(screen.getByText(/Distribuci.n territorial/)).toBeInTheDocument()
    })
  })

  it('renders weekly chart', async () => {
    render(<DashboardView />)
    await waitFor(() => {
      expect(screen.getByText('Solicitudes por semana')).toBeInTheDocument()
    })
  })

  it('renders activity feed', async () => {
    render(<DashboardView />)
    await waitFor(() => {
      expect(screen.getByText('Actividad reciente')).toBeInTheDocument()
    })
  })

  it('renders type breakdown', async () => {
    render(<DashboardView />)
    await waitFor(() => {
      expect(screen.getByText('Por tipo de solicitud')).toBeInTheDocument()
    })
  })

  it('renders inventory donut', async () => {
    render(<DashboardView />)
    await waitFor(() => {
      expect(screen.getByText('Estado del inventario')).toBeInTheDocument()
    })
  })

  it('handles empty data', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    render(<DashboardView />)
    await waitFor(() => {
      expect(screen.getByText('PQR recibidas')).toBeInTheDocument()
    })
  })

  it('handles RPC errors gracefully', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'fail' } })
    render(<DashboardView />)
    await waitFor(() => {
      expect(screen.getByText('PQR recibidas')).toBeInTheDocument()
    })
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1)
  })
})
