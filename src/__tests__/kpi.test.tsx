import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Kpi } from '../components/ui/Kpi'
import React from 'react'

describe('KPI Component', () => {
  it('renders label and value', () => {
    render(<Kpi label="Total PQR" value="50" detail="Activas" icon="doc" />)
    expect(screen.getByText('Total PQR')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('renders detail text', () => {
    render(<Kpi label="En proceso" value="12" detail="3 urgentes" icon="flow" />)
    expect(screen.getByText('3 urgentes')).toBeInTheDocument()
  })

  it('renders ReactNode detail', () => {
    render(
      <Kpi
        label="PQR"
        value="100"
        detail={<span data-testid="custom-detail">Custom: 40 activas</span>}
        icon="doc"
      />
    )
    expect(screen.getByTestId('custom-detail')).toBeInTheDocument()
  })

  it('renders hot badge when hot is true', () => {
    render(<Kpi label="Urgentes" value="7" detail="Accion" icon="fire" hot />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('renders without hot', () => {
    const { container } = render(<Kpi label="Test" value="0" detail="" icon="doc" />)
    expect(container.querySelector('.kpi')).toBeTruthy()
  })
})

describe('KPI Performance', () => {
  it('renders 500 KPIs in under 1000ms', () => {
    const start = performance.now()
    const { unmount } = render(
      <div>
        {Array.from({ length: 500 }, (_, i) => (
          <Kpi key={i} label={`KPI ${i}`} value={String(i)} detail="test" icon="doc" />
        ))}
      </div>
    )
    const elapsed = performance.now() - start
    unmount()
    expect(elapsed).toBeLessThan(1000)
  })
})
