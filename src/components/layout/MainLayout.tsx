"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building2, FileText, Share2, BarChart3, Calendar, Newspaper } from "lucide-react";
import { useAccessTracking } from "@/hooks/useAccessTracking";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  useAccessTracking(); // Rastrear acessos

  const navigation = [
    { name: "Início", href: "/", icon: Building2 },
    { name: "Sobre", href: "/sobre", icon: FileText },
    { name: "Trajetória", href: "/trajetoria", icon: FileText },
    { name: "Projetos", href: "/projetos", icon: FileText },
    { name: "Publicações", href: "/publicacoes", icon: FileText },
    { name: "Na Mídia", href: "/midia", icon: Newspaper },
    { name: "Compartilhe", href: "/compartilhe", icon: Share2 },
    { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
    { name: "Agenda", href: "/agenda", icon: Calendar },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="container-fluid">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <Building2 className="h-6 w-6 text-[#1E3A8A] transition-colors group-hover:text-[#1E3A8A]/80" />
              <div>
                <h1 className="text-fluid-lg font-bold text-[#0F172A] tracking-tight">
                  Maurício Zanin
                </h1>
                <p className="text-fluid-xs text-[#64748B]">Consultoria & Governança</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-md transition-colors text-fluid-sm",
                      isActive
                        ? "text-[#1E3A8A] bg-slate-50"
                        : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#FAFAFA] border-t border-[#E2E8F0] py-12 mt-auto">
        <div className="container-fluid">
          <div className="text-center">
            <p className="text-fluid-sm text-[#64748B]">
              © {new Date().getFullYear()} Maurício Zanin. Todos os direitos reservados.
            </p>
            <p className="text-fluid-xs text-[#64748B] mt-2">
              Especialista em Governança e Compras Públicas
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
