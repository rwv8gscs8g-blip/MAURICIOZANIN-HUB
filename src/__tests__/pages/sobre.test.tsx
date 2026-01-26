import { render, screen } from '@testing-library/react'
import SobrePage from '@/app/sobre/page'

// Mock components that might cause issues in tests
jest.mock('@/components/gallery/ProfessionalGallery', () => ({
  ProfessionalGallery: () => <div data-testid="professional-gallery">Gallery</div>,
}))

jest.mock('@/components/youtube/YouTubePlaylist', () => ({
  YouTubePlaylist: () => <div data-testid="youtube-playlist">Playlist</div>,
}))

jest.mock('@/components/seo/JsonLd', () => ({
  JsonLd: () => null,
}))

describe('SobrePage', () => {
  it('renders the page title', () => {
    render(<SobrePage />)
    expect(screen.getByText('Luís Maurício Junqueira Zanin')).toBeInTheDocument()
  })

  it('displays the professional title', () => {
    render(<SobrePage />)
    expect(screen.getByText('Estrategista de Compras Públicas')).toBeInTheDocument()
  })

  it('displays formation section', () => {
    render(<SobrePage />)
    expect(screen.getByText('Formação e Atuação')).toBeInTheDocument()
    expect(screen.getByText(/Administração Pública/)).toBeInTheDocument()
    expect(screen.getByText(/Unesp/)).toBeInTheDocument()
    expect(screen.getByText(/FGV/)).toBeInTheDocument()
  })

  it('displays professional activity', () => {
    render(<SobrePage />)
    expect(screen.getByText(/Sebrae Nacional/)).toBeInTheDocument()
    expect(screen.getByText(/Compras.gov.br/)).toBeInTheDocument()
  })

  it('displays control bodies section', () => {
    render(<SobrePage />)
    expect(screen.getByText(/Tribunais de Contas/)).toBeInTheDocument()
    expect(screen.getByText(/Ministério Público/)).toBeInTheDocument()
  })
})
