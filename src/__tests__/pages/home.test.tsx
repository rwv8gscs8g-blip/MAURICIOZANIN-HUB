import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

// Mock hooks and components
jest.mock('@/hooks/useLinkedIn', () => ({
  useLinkedIn: () => ({
    posts: [],
    loading: false,
  }),
}))

jest.mock('@/components/home/HeroSection', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero</div>,
}))

jest.mock('@/components/home/TriplePillar', () => ({
  TriplePillar: () => <div data-testid="triple-pillar">Pillars</div>,
}))

jest.mock('@/components/linkedin/LinkedInFeed', () => ({
  LinkedInFeed: () => <div data-testid="linkedin-feed">Feed</div>,
}))

describe('HomePage', () => {
  it('renders all main sections', () => {
    render(<HomePage />)
    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(screen.getByTestId('triple-pillar')).toBeInTheDocument()
    expect(screen.getByTestId('linkedin-feed')).toBeInTheDocument()
  })
})
