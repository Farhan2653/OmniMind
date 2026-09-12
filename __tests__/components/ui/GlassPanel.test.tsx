import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GlassPanel } from '@/components/ui/GlassPanel'

describe('GlassPanel Component', () => {
  it('renders correctly with children', () => {
    render(
      <GlassPanel>
        <p>Panel Content</p>
      </GlassPanel>
    )
    const content = screen.getByText(/panel content/i)
    expect(content).toBeInTheDocument()
    
    // Check if it has the base glass-card class
    const panel = content.parentElement?.parentElement
    expect(panel).toHaveClass('glass-card', 'rounded-2xl', 'p-6')
  })

  it('merges custom classNames correctly', () => {
    render(
      <GlassPanel className="custom-glass-class">
        <p>Panel Content</p>
      </GlassPanel>
    )
    const content = screen.getByText(/panel content/i)
    const panel = content.parentElement?.parentElement
    expect(panel).toHaveClass('glass-card', 'custom-glass-class')
  })
})
