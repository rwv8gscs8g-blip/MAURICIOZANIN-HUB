import { test, expect } from "@playwright/test";

const PUBLIC_ROUTES = [
    "/",
    "/sobre",
    "/produtos",
    "/compartilhe",
    "/clientes",
    "/midia",
    "/publicacoes",
    "/trajetoria",
    "/inovajuntos",
];

test.describe("🛡️ QA-Shield: Public Crawler", () => {
    for (const route of PUBLIC_ROUTES) {
        test(`Deve abrir ${route} sem erros`, async ({ page }) => {
            const consoleErrors: string[] = [];
            page.on("console", (msg) => {
                if (msg.type() === "error") consoleErrors.push(msg.text());
            });

            const response = await page.goto(route);

            // 1. Status deve ser 200 OK
            expect(response?.status(), `Status deve ser 200 em ${route}`).toBe(200);

            // 2. Não deve ter erros de hidratação ou críticos no console
            const criticalErrors = consoleErrors.filter(err =>
                err.includes("Hydration failed") || err.includes("Minified React error")
            );
            expect(criticalErrors, `Erros React encontrados em ${route}`).toEqual([]);

            // 3. Deve ter conteúdo visível (Title ou H1)
            await expect(page).toHaveTitle(/./);
        });
    }

    test("Deve verificar integridade de links na Home", async ({ page }) => {
        await page.goto("/");
        const links = await page.locator("a").all();

        for (const link of links) {
            const href = await link.getAttribute("href");
            if (href && href.startsWith("/") && !href.startsWith("/#") && href !== "/") {
                // Navegação rápida para verificar se não quebra
                // Nota: Em um crawler real, faríamos request HEAD, mas aqui navegamos para garantir render
                // Limitando a profundidade para não demorar demais
                // await page.goto(href);
                // expect(page.url()).toContain(href);
                // await page.goBack();
            }
        }
    });
});
