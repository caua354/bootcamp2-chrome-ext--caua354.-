import { test, expect, chromium } from '@playwright/test';
import path from 'node:path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dist = path.resolve(__dirname, '..', 'dist');

test.describe('Testes E2E da Extensão Dicionário Rápido', () => {
  let context;
  let page;
  let extensionId;

  
  test.beforeEach(async () => {
    
    const contextPromise = chromium.launchPersistentContext('', {
      headless: true,
      args: [
        `--disable-extensions-except=${dist}`,
        `--load-extension=${dist}`,
        '--disable-background-timer-throttling' 
      ],
    });

    
    const [context] = await Promise.all([
      contextPromise,
      contextPromise.then(ctx => ctx.waitForEvent('console', {
        predicate: (msg) => msg.text().includes('Service Worker instalado com sucesso'), //
        timeout: 20000 
      }))
    ]);

    
    const consoleMsg = await context.waitForEvent('console', {
      predicate: (msg) => msg.text().includes('Service Worker instalado'),
    });
    const url = consoleMsg.page()?.url() || '';
    extensionId = url.split('/')[2];

    if (!extensionId) {
      throw new Error('Não foi possível capturar o ID da extensão pelo console do Service Worker.');
    }
    
    const popupUrl = `chrome-extension://${extensionId}/popup.html`; //
    page = await context.newPage();
    await page.goto(popupUrl);
  });

  test.afterEach(async () => {
    if (context) {
      await context.close();
    }
  });

  test('Popup deve exibir mensagem inicial', async () => {
    const initialText = page.locator('#result p');
    await expect(initialText).toHaveText(
      'Selecione uma palavra em qualquer página, clique com o botão direito e escolha "Definir" no menu.' //
    );
  });

  test('Popup deve buscar e exibir definição para "hello"', async () => {
  
    const word = 'hello';

    await page.evaluate(
      (w) => chrome.storage.local.set({ selectedWord: w }),
      word
    );

    await page.reload();

    const loadingText = page.locator('#result p strong');
    await expect(loadingText).toHaveText(word);

    const wordTitle = page.locator('#result h2');
    await expect(wordTitle).toHaveText(word, { timeout: 10000 }); 

    const definition = page.locator('#result .definition p');
    const definitionText = await definition.textContent();
    
    expect(definitionText).toBeDefined();
    expect(definitionText.length).toBeGreaterThan(10); 

    const storage = await page.evaluate(() =>
      chrome.storage.local.get('selectedWord')
    );
    expect(storage.selectedWord).toBeUndefined();
  });
});