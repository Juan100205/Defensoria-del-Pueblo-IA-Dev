import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

const mockRpc = vi.hoisted(() => vi.fn())

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) },
    rpc: mockRpc,
  },
}))

import { AlertasView } from '../features/admin/AlertasView'

describe('AlertasView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRpc.mockResolvedValue({
      data: [
        { alert_type: 'overdue', severity: 'red', title: 'Caso vencido DP-001', description: 'Vencio hace 3 dias', case_number: 'DP-001', created_at: '2026-08-17' },
        { alert_type: 'due_soon', severity: 'gold', title: 'Por vencer DP-002', description: 'Vence en 2 dias', case_number: 'DP-002', created_at: '2026-08-19' },
        { alert_type: 'overdue', severity: 'red', title: 'Caso vencido DP-003', description: 'Vencio hace 1 dia', case_number: 'DP-003', created_at: '2026-08-19' },
      ],
      error: null,
    })
  })

  it('renders all 4 KPI labels', async () => {
    render(<AlertasView />)
    await waitFor(() => {
      expect(screen.getByText('Casos prioritarios')).toBeInTheDocument()
    })
    expect(screen.getByText(/Pr.ximos a vencer/)).toBeInTheDocument()
    expect(screen.getByText('Vencidos')).toBeInTheDocument()
    expect(screen.getByText('Total alertas')).toBeInTheDocument()
  })

  it('renders alert cards', async () => {
    render(<AlertasView />)
    await waitFor(() => {
      expect(screen.getByText('Caso vencido DP-001')).toBeInTheDocument()
    })
    expect(screen.getByText('Vencio hace 3 dias')).toBeInTheDocument()
    expect(screen.getByText('Por vencer DP-002')).toBeInTheDocument()
  })

  it('shows activity section', async () => {
    render(<AlertasView />)
    await waitFor(() => {
      expect(screen.getByText('Actividad del sistema')).toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    mockRpc.mockReturnValue(new Promise(() => {}))
    render(<AlertasView />)
    expect(screen.getByText('Cargando alertas...')).toBeInTheDocument()
  })

  it('shows empty state', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    render(<AlertasView />)
    await waitFor(() => {
      expect(screen.getByText(/No hay alertas activas/)).toBeInTheDocument()
    })
  })
})
