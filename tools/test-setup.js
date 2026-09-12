import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { setzeSprache } from '../apps/shared/sprache.js';

// jsdom meldet en-US als Browsersprache; ohne Vorgabe liefe die Anwendung im
// Test also auf Englisch. Die Tests prüfen die deutsche Fassung — wer die
// englische braucht, ruft `setzeSprache('en')` im Test selbst auf.
beforeEach(() => {
  setzeSprache('de');
});

// Nach jedem Test den gerenderten Baum abräumen, sonst sehen spätere Abfragen
// Elemente aus vorherigen Tests.
afterEach(cleanup);
