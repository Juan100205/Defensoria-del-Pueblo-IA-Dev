import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRpc = vi.fn()
const mockFrom = vi.fn()

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) },
    rpc: mockRpc,
    from: mockFrom,
  },
}))

describe('API Layer - RPC calls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')
  })

  it('getDashboardStats', async () => {
    mockRpc.mockResolvedValue({ data: { total_cases: 50, active_cases: 40, urgent_cases: 7 }, error: null })
    const { getDashboardStats } = await import('../lib/api')
    const result = await getDashboardStats()
    expect(mockRpc).toHaveBeenCalledWith('get_dashboard_stats')
    expect(result.total_cases).toBe(50)
  })

  it('getActiveAlerts', async () => {
    mockRpc.mockResolvedValue({ data: [{ alert_type: 'overdue', severity: 'red' }], error: null })
    const { getActiveAlerts } = await import('../lib/api')
    expect(await getActiveAlerts()).toHaveLength(1)
  })

  it('getCasesByDepartment', async () => {
    mockRpc.mockResolvedValue({ data: [{ department: 'Bogota', count: 12 }], error: null })
    const { getCasesByDepartment } = await import('../lib/api')
    expect((await getCasesByDepartment())[0].department).toBe('Bogota')
  })

  it('getCasesByType', async () => {
    mockRpc.mockResolvedValue({ data: [{ type_name: 'Peticion', count: 15 }], error: null })
    const { getCasesByType } = await import('../lib/api')
    expect((await getCasesByType())[0].type_name).toBe('Peticion')
  })

  it('getCasesByWeek', async () => {
    mockRpc.mockResolvedValue({ data: [{ week_label: 'Ago 4', number: 1, received: 5, resolved: 3 }], error: null })
    const { getCasesByWeek } = await import('../lib/api')
    expect((await getCasesByWeek())[0].received).toBe(5)
  })

  it('getRecentActivity', async () => {
    mockRpc.mockResolvedValue({ data: [{ icon: 'doc', color: 'navy', title: 'Nueva solicitud' }], error: null })
    const { getRecentActivity } = await import('../lib/api')
    expect((await getRecentActivity())[0].icon).toBe('doc')
  })

  it('getPortalStats', async () => {
    mockRpc.mockResolvedValue({ data: [{ total_solicitudes: 12847, avg_response_days: 4.2 }], error: null })
    const { getPortalStats } = await import('../lib/api')
    expect((await getPortalStats())[0].total_solicitudes).toBe(12847)
  })

  it('getTotalCasesCount', async () => {
    mockRpc.mockResolvedValue({ data: 50, error: null })
    const { getTotalCasesCount } = await import('../lib/api')
    expect(await getTotalCasesCount()).toBe(50)
  })

  it('getAlertsCount', async () => {
    mockRpc.mockResolvedValue({ data: 7, error: null })
    const { getAlertsCount } = await import('../lib/api')
    expect(await getAlertsCount()).toBe(7)
  })

  it('getCases passes correct params', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null })
    const { getCases } = await import('../lib/api')
    await getCases({ query: 'test', status: 'recibida', page: 2 })
    expect(mockRpc).toHaveBeenCalledWith('search_cases', {
      p_query: 'test', p_status: 'recibida', p_department: null,
      p_complaint_type: null, p_urgency: null, p_page: 2, p_page_size: 20,
    })
  })

  it('getDashboardStats throws on error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'Not found' } })
    const { getDashboardStats } = await import('../lib/api')
    await expect(getDashboardStats()).rejects.toThrow()
  })
})

describe('API Layer - CRUD', () => {
  function makeChain() {
    const c: Record<string, any> = {}
    c.select = vi.fn().mockReturnValue(c)
    c.insert = vi.fn().mockReturnValue(c)
    c.update = vi.fn().mockReturnValue(c)
    c.delete = vi.fn().mockReturnValue(c)
    c.eq = vi.fn().mockReturnValue(c)
    c.neq = vi.fn().mockReturnValue(c)
    c.order = vi.fn().mockReturnValue(c)
    c.limit = vi.fn().mockReturnValue(c)
    c.single = vi.fn().mockResolvedValue({ data: null, error: null })
    c.then = vi.fn().mockResolvedValue({ data: [], error: null })
    return c
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')
    mockFrom.mockImplementation(() => makeChain())
  })

  it('getCase fetches by id', async () => {
    const chain = makeChain()
    chain.single.mockResolvedValue({ data: { id: '1', case_number: 'DP-001' }, error: null })
    mockFrom.mockReturnValue(chain)

    const { getCase } = await import('../lib/api')
    expect((await getCase('1')).id).toBe('1')
  })

  it('updateCaseStatus updates status', async () => {
    const chain = makeChain()
    chain.eq.mockResolvedValue({ error: null })
    mockFrom.mockReturnValue(chain)

    const { updateCaseStatus } = await import('../lib/api')
    await updateCaseStatus('case-1', 'finalizada')
    expect(chain.update).toHaveBeenCalledWith({ status: 'finalizada' })
  })

  it('getCaseMessages fetches messages', async () => {
    const chain = makeChain()
    chain.order.mockResolvedValue({ data: [{ id: '1', message: 'Hi' }, { id: '2', message: 'Yo' }], error: null })
    mockFrom.mockReturnValue(chain)

    const { getCaseMessages } = await import('../lib/api')
    expect(await getCaseMessages('c1')).toHaveLength(2)
  })

  it('addCaseMessage inserts message', async () => {
    const chain = makeChain()
    chain.single.mockResolvedValue({ data: { id: '1', message: 'Test' }, error: null })
    mockFrom.mockReturnValue(chain)

    const { addCaseMessage } = await import('../lib/api')
    expect((await addCaseMessage('c1', 'Test')).message).toBe('Test')
  })

  it('getProfiles fetches profiles', async () => {
    const chain = makeChain()
    chain.order.mockResolvedValue({ data: [{ id: '1', full_name: 'User 1' }], error: null })
    mockFrom.mockReturnValue(chain)

    const { getProfiles } = await import('../lib/api')
    expect(await getProfiles()).toHaveLength(1)
  })

  it('getCase throws on error', async () => {
    const chain = makeChain()
    chain.single.mockResolvedValue({ data: null, error: { message: 'Not found' } })
    mockFrom.mockReturnValue(chain)

    const { getCase } = await import('../lib/api')
    await expect(getCase('x')).rejects.toThrow()
  })
})
