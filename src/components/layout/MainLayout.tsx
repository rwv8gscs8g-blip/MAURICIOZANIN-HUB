"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building2, FileText, Share2, BarChart3, Calendar, Newspaper } from "lucide-react";
import { useAccessTracking } from "@/hooks/useAccessTracking";
import { VersionFooter } from "./VersionFooter";
import { useEffect, useState } from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  useAccessTracking(); // Rastrear acessos
  const [session, setSession] = useState<{ user?: { role?: string } } | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active) return;
        setSession(data);
        setSessionLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setSession(null);
        setSessionLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const publicNavigation = [
    { name: "Início", href: "/", icon: Building2 },
    { name: "Compartilhe", href: "/compartilhe", icon: Share2 },
    { name: "Sobre", href: "/sobre", icon: FileText },
    { name: "Rede Inovajuntos", href: "/inovajuntos", icon: Share2 },
    { name: "Clientes", href: "/clientes", icon: Building2 },
    { name: "Produtos", href: "/produtos", icon: FileText },
    { name: "Publicações", href: "/publicacoes", icon: FileText },
    { name: "Na Mídia", href: "/midia", icon: Newspaper },
    { name: "Agenda", href: "/agenda", icon: Calendar },
  ];

  const privateNavigation = [
    ...publicNavigation,
    { name: "Linha do Tempo", href: "/trajetoria", icon: FileText },
    { name: "Projetos", href: "/projetos", icon: FileText },
    { name: "Hubs", href: "/hubs", icon: Building2 },
    { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  ];

  const navigation = session?.user ? privateNavigation : publicNavigation;
  const adminNavigation =
    session?.user?.role === "ADMIN"
      ? [{ name: "Admin", href: "/admin", icon: Building2 }, ...navigation]
      : navigation;
  const hideChrome =
    pathname?.startsWith("/clientes/sebrae") ||
    pathname?.startsWith("/diagnostico") ||
    pathname?.startsWith("/sala");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {!hideChrome && (
        <header className="bg-white border-b border-[#E2E8F0]">
          <div className="container-fluid">
            <div className="flex items-center justify-between py-4">
              <Link href="/" className="flex items-center space-x-3 group">
                <Building2 className="h-6 w-6 text-[#1E3A8A] transition-colors group-hover:text-[#1E3A8A]/80" />
                <div>
                  <h1 className="text-fluid-lg font-bold text-[#0F172A] tracking-tight">
                    Maurício Zanin
                  </h1>
                  <p className="text-fluid-xs text-[#64748B]">International Project Manager | Public Procurement & Governance Specialist</p>
                </div>
              </Link>

              <nav className="hidden md:flex items-center space-x-1">
                {adminNavigation.map((item) => {
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

              <div className="hidden md:flex items-center gap-2">
                {sessionLoading ? null : session?.user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-fluid-sm hover:bg-[#F8FAFF] transition-colors rounded-md"
                    >
                      Painel
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        await fetch("/api/auth/logout", { method: "POST" });
                        window.location.href = "/";
                      }}
                      className="px-4 py-2 bg-[#1E3A8A] text-white text-fluid-sm rounded-md"
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <Link
                    href="/sobre"
                    className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-fluid-sm hover:bg-[#F8FAFF] transition-colors rounded-md"
                  >
                    Acessar
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      {!hideChrome && (
        <footer className="bg-[#FAFAFA] border-t border-[#E2E8F0] py-12 mt-auto">
          <div className="container-fluid">
            <div className="text-center">
              <p className="text-fluid-sm text-[#64748B]">
                © {new Date().getFullYear()} Maurício Zanin. Todos os direitos reservados.
              </p>
              <p className="text-fluid-xs text-[#64748B] mt-2">
                Especialista em Governança e Compras Públicas
              </p>
              <VersionFooter />
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
