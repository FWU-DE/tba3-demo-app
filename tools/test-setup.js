import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Nach jedem Test den gerenderten Baum abräumen, sonst sehen spätere Abfragen
// Elemente aus vorherigen Tests.
afterEach(cleanup);
