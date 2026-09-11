import { useContext } from 'react';
import { FilterContext } from './filterKontext';

/** Zugriff auf die globalen Filter. Nur innerhalb des FilterProvider gültig. */
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

export default useFilters;
