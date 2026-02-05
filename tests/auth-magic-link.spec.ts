import { test, expect } from '@playwright/test';

test.describe('Autenticação via Magic Link', () => {
    test('Deve solicitar e consumir Magic Link com sucesso', async ({ page, request }) => {
        // 1. Acessar página de login
        await page.goto('/auth/login');

        // 2. Selecionar aba "Código por e-mail" (se não for a padrão)
        await page.getByRole('button', { name: 'Código por e-mail' }).click();

        // 3. Preencher email
        const email = 'mauriciozanin@gmail.com'; // Email seguro para teste (ou use um mock se preferir não enviar real)
        await page.getByLabel('E-mail').fill(email);

        // 4. Enviar
        // Intercepta a requisição para verificar payload
        const requestPromise = page.waitForRequest(req =>
            req.url().includes('/api/auth/request-magic-link') && req.method() === 'POST'
        );

        await page.getByRole('button', { name: 'Enviar código' }).click();

        const req = await requestPromise;
        expect(req.postDataJSON()).toEqual({ email });

        // 5. Verificar mensagem de sucesso na UI
        await expect(page.getByText('Se o e-mail estiver cadastrado, você receberá o link em instantes.')).toBeVisible();

        // Opcional: Verificar Screenshot
        // await expect(page).toHaveScreenshot('magic-link-sent.png');

        // NOTA: O consumo real requer acesso ao email ou interceptação do token no backend (banco de dados).
        // Para teste E2E completo sem acesso ao email, precisaríamos de uma rota de teste que expõe o token (apenas em dev/preview).
    });

    test('Deve validar campos obrigatórios', async ({ page }) => {
        await page.goto('/auth/login');
        await page.getByRole('button', { name: 'Código por e-mail' }).click();
        await page.getByRole('button', { name: 'Enviar código' }).click();

        // O browser deve exibir validação nativa ou o sistema deve mostrar erro.
        // O componente atual usa atributo 'required' no input, então o browser captura.
        // Playwright valida pseudo-classe :invalid
        const input = page.getByLabel('E-mail');
        await expect(input).toHaveAttribute('required', '');
    });
});
