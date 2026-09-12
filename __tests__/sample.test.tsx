import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Greeting } from '@/components/dashboard/Greeting'

// Simple mock for useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    profile: { first_name: 'John' },
    loading: false
  })
}))

describe('Greeting Component', () => {
  it('renders a greeting message', () => {
    render(<Greeting />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toBeInTheDocument()
  })
})
