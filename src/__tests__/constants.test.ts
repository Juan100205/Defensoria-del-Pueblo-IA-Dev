import { describe, it, expect } from 'vitest'

describe('Constants', () => {
  it('DEPTOS array is not empty', async () => {
    const { DEPTOS } = await import('../data/constants')
    expect(DEPTOS.length).toBeGreaterThan(0)
  })

  it('TIPOS contains all complaint types', async () => {
    const { TIPOS } = await import('../data/constants')
    expect(TIPOS).toContain('Petición')
    expect(TIPOS).toContain('Queja')
    expect(TIPOS).toContain('Reclamo')
    expect(TIPOS).toContain('Sugerencia')
    expect(TIPOS).toContain('Denuncia DDHH')
    expect(TIPOS).toContain('Tutela')
  })

  it('ESTADOS contains all statuses', async () => {
    const { ESTADOS } = await import('../data/constants')
    expect(ESTADOS).toContain('Recibida')
    expect(ESTADOS).toContain('Finalizada')
  })

  it('CITIES has entries', async () => {
    const { CITIES } = await import('../data/constants')
    expect(Object.keys(CITIES).length).toBeGreaterThan(0)
  })

  it('TEMAS has entries', async () => {
    const { TEMAS } = await import('../data/constants')
    expect(Object.keys(TEMAS).length).toBeGreaterThan(0)
  })

  it('MUNIS has entries', async () => {
    const { MUNIS } = await import('../data/constants')
    expect(Object.keys(MUNIS).length).toBeGreaterThan(0)
  })
})

describe('Database Types', () => {
  it('types module is importable', async () => {
    const types = await import('../types/database')
    expect(types).toBeDefined()
  })
})
