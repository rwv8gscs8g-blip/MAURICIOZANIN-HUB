import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function useAccessTracking() {
  const pathname = usePathname();

  useEffect(() => {
    // Registrar acesso quando a rota mudar
    const logAccess = async () => {
      try {
        await fetch("/api/access/log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname,
          }),
        });
      } catch (error) {
        // Silenciosamente falhar em produção
        console.error("Erro ao registrar acesso:", error);
      }
    };

    logAccess();
  }, [pathname]);
}
