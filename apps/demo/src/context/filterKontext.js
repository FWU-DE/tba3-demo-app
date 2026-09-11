import { createContext } from 'react';

// Eigene Datei, damit FilterContext.jsx ausschließlich Komponenten exportiert —
// sonst verliert Vites Fast Refresh bei jeder Änderung den Zustand.
export const FilterContext = createContext();
