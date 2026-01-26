import { render, screen } from '@testing-library/react'
import { CitationBox } from '@/components/citation/CitationBox'

describe('CitationBox', () => {
  it('renders citation box component', () => {
    render(
      <CitationBox
        author="ZANIN, Luís Maurício"
        title="Test Title"
        publisher="Test Publisher"
        year="2024"
        url="https://example.com"
        type="article"
      />
    )

    // Verifica se o componente renderiza (procura por elementos comuns)
    expect(screen.getByText(/ABNT|APA|BibTeX/)).toBeInTheDocument()
  })

  it('displays all citation formats', () => {
    render(
      <CitationBox
        author="ZANIN, Luís Maurício"
        title="Test Title"
        publisher="Test Publisher"
        year="2024"
        url="https://example.com"
        type="article"
      />
    )

    expect(screen.getByText(/ABNT/)).toBeInTheDocument()
    expect(screen.getByText(/APA/)).toBeInTheDocument()
    expect(screen.getByText(/BibTeX/)).toBeInTheDocument()
  })
})
