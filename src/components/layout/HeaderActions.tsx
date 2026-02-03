"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface HeaderActionsProps {
    session: { user?: { role?: string } } | null;
    sessionLoading: boolean;
}

export function HeaderActions({ session, sessionLoading }: HeaderActionsProps) {
    const searchParams = useSearchParams();

    if (sessionLoading) return null;

    if (session?.user) {
        return (
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
        );
    }

    return (
        <Link
            href={searchParams?.get("tab") ? `/sobre?tab=${searchParams.get("tab")}` : "/sobre"}
            className="px-4 py-2 border border-[#1E3A8A] text-[#1E3A8A] text-fluid-sm hover:bg-[#F8FAFF] transition-colors rounded-md active:bg-blue-50"
        >
            Acessar
        </Link>
    );
}
