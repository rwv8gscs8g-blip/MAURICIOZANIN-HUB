import { defineConfig, devices } from "@playwright/test";

/**
 * Configuração do QA-Shield (Playwright)
 * Referência: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: "./tests",
    /* Rodar testes em paralelo */
    fullyParallel: true,
    /* Fail fast em CI */
    forbidOnly: !!process.env.CI,
    /* Retries */
    retries: process.env.CI ? 2 : 0,
    /* Workers */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter */
    reporter: "html",
    /* Shared settings */
    use: {
        /* Base URL do ambiente de teste */
        baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://127.0.0.1:3070",

        /* Coletar trace quando falhar */
        trace: "on-first-retry",
    },

    /* Projetos de navegadores */
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],

    /* Servidor de desenvolvimento */
    webServer: {
        command: 'PORT=3070 npm run dev',
        url: 'http://127.0.0.1:3070',
        reuseExistingServer: false, // Força subir e derrubar o servidor
        timeout: 120 * 1000, // 2 minutos para subir o server
    },
});
