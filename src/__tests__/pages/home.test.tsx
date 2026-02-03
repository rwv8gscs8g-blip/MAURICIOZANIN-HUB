import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    contentItem: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}));

jest.mock("@/components/home/HeroSection", () => ({
  HeroSection: () => <div data-testid="hero-section">Hero</div>,
}));

jest.mock("@/components/home/TriplePillar", () => ({
  TriplePillar: () => <div data-testid="triple-pillar">Pillars</div>,
}));

jest.mock("@/components/home/InovajuntosTransition", () => ({
  InovajuntosTransition: () => (
    <div data-testid="inovajuntos-transition">Inovajuntos</div>
  ),
}));

describe('HomePage', () => {
  it("renders all main sections", async () => {
    const ui = await HomePage();
    render(ui as any);

    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(screen.getByTestId("triple-pillar")).toBeInTheDocument();
    expect(screen.getByTestId("inovajuntos-transition")).toBeInTheDocument();
    expect(screen.getByText("Últimas atualizações")).toBeInTheDocument();
  });
})
