// Der Hilfe-Reiter zeigt die MCP-Adresse nur, wenn dort ein Server antwortet.
// Auf der öffentlichen Seite (und in der Vorschau) gibt es keinen; im
// Docker-Abbild leitet nginx /mcp an ihn weiter.

import { test, expect } from '@playwright/test';
import { oeffneDemo } from './hilfsmittel.js';

test('sagt ohne MCP-Server, dass hier keiner läuft', async ({ page }) => {
  await oeffneDemo(page, { tab: 'help' });
  await expect(page.getByTestId('mcp-nicht-hier')).toBeVisible();
  await expect(page.getByTestId('ansicht-hilfe')).toContainText('https://ihr-server.example/mcp');
  await expect(page.getByTestId('ansicht-hilfe')).toContainText('tba3_list_materials');
});

test('zeigt die Adresse, wenn unter /mcp ein Server antwortet', async ({ page }) => {
  // Ein MCP-Server beantwortet ein GET ohne Sitzung mit 405.
  await page.route('**/mcp', (route) => route.fulfill({ status: 405, contentType: 'application/json', body: '{}' }));
  await oeffneDemo(page, { tab: 'help' });
  const adresse = page.getByTestId('mcp-adresse');
  await expect(adresse).toBeVisible();
  await expect(adresse).toContainText(new URL(page.url()).origin + '/mcp');
});
