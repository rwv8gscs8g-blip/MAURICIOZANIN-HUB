import { test, expect } from "@playwright/test";

const PROTECTED_ROUTES = [
    "/dashboard",
    "/admin",
    "/api/admin/clients",
    "/api/admin/products",
    "/sala",
];

test.describe("🛡️ QA-Shield: Security Barrier", () => {
    // Garantir que estamos deslogados
    test.use({ storageState: { cookies: [], origins: [] } });

    for (const route of PROTECTED_ROUTES) {
        test(`Deve bloquear acesso anônimo a ${route}`, async ({ page, request }) => {
            // Teste para API ou Página
            if (route.startsWith("/api")) {
                // Para API, o Middleware pode redirecionar (307) ou retornar erro (401/403)
                // O cliente de teste segue redirects por padrão, então se cair no /auth/login (200), também está seguro.
                const response = await request.get(route);
                const isError = [401, 403, 500].includes(response.status());
                // Verifica se foi redirecionado para login (com parâmetro next ou denied)
                const isRedirectToLogin = response.url().includes("/auth/login");
                // Verifica se o corpo é um JSON de erro (caso não redirecione)
                let isJsonError = false;
                try {
                    const json = await response.json();
                    if (json.error) isJsonError = true;
                } catch { }

                expect(
                    isError || isRedirectToLogin || isJsonError,
                    `API ${route} permitiu acesso indevido! (Status: ${response.status()}, URL: ${response.url()})`
                ).toBeTruthy();
            } else {
                // Para Páginas, espera redirecionamento para Login
                await page.goto(route);
                await expect(page).toHaveURL(/\/auth\/login/);
            }
        });
    }
});
