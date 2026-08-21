import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

const mockRpc = vi.hoisted(() => vi.fn())

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: mockRpc,
  },
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    profile: { id: 'admin-id', full_name: 'Marcela Rios', email: 'admin@defensoria.gov.co', role: 'administrador', department: 'Bogota', is_active: true },
    user: { id: 'admin-id' },
  }),
}))

import { AdminSidebar } from '../features/admin/AdminSidebar'

const mockNavigate = vi.fn()

describe('AdminSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRpc.mockImplementation(async (fn: string) => {
      const data: Record<string, any> = { get_total_cases_count: 50, get_alerts_count: 7 }
      return { data: data[fn] ?? null, error: null }
    })
  })

  it('renders navigation groups', () => {
    render(<AdminSidebar currentView="dash" onNavigate={mockNavigate} />)
    expect(screen.getByText(/Operaci.n/)).toBeInTheDocument()
    expect(screen.getByText(/An.lisis/)).toBeInTheDocument()
    expect(screen.getByText(/Administraci.n/)).toBeInTheDocument()
  })

  it('renders nav items', () => {
    render(<AdminSidebar currentView="dash" onNavigate={mockNavigate} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Solicitudes')).toBeInTheDocument()
    expect(screen.getByText('Alertas')).toBeInTheDocument()
    expect(screen.getByText(/Anal.tica/)).toBeInTheDocument()
    expect(screen.getByText('Usuarios')).toBeInTheDocument()
    expect(screen.getByText(/Configuraci.n/)).toBeInTheDocument()
  })

  it('shows active class on current view', () => {
    render(<AdminSidebar currentView="dash" onNavigate={mockNavigate} />)
    const btn = screen.getByText('Dashboard').closest('button')
    expect(btn?.className).toContain('act')
  })

  it('displays user profile name', () => {
    render(<AdminSidebar currentView="dash" onNavigate={mockNavigate} />)
    expect(screen.getByText('Marcela Rios')).toBeInTheDocument()
  })

  it('displays user role', () => {
    render(<AdminSidebar currentView="dash" onNavigate={mockNavigate} />)
    expect(screen.getByText(/Administrador/)).toBeInTheDocument()
  })

  it('shows initials from name', () => {
    render(<AdminSidebar currentView="dash" onNavigate={mockNavigate} />)
    expect(screen.getByText('MR')).toBeInTheDocument()
  })

  it('loads live badge counts', async () => {
    render(<AdminSidebar currentView="dash" onNavigate={mockNavigate} />)
    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument()
    })
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('calls onNavigate when item clicked', () => {
    render(<AdminSidebar currentView="dash" onNavigate={mockNavigate} />)
    screen.getByText('Alertas').closest('button')?.click()
    expect(mockNavigate).toHaveBeenCalledWith('alert')
  })

  it('renders branding', () => {
    render(<AdminSidebar currentView="dash" onNavigate={mockNavigate} />)
    expect(screen.getByText(/Defensor.a del Pueblo/)).toBeInTheDocument()
    expect(screen.getByText(/Gesti.n de PQR/)).toBeInTheDocument()
  })
})
