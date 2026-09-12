import { useEffect } from 'react';
import { FilterProvider } from './context/FilterContext';
import { useTexte } from './i18n';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/layout/Dashboard';

function App() {
  const t = useTexte();

  // Der Titel im Browser-Reiter folgt der Sprachwahl; das Markup kann das nicht.
  useEffect(() => {
    document.title = t('header.dokumentTitel');
  }, [t]);

  return (
    <FilterProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col lg:flex-row">
          <Sidebar />
          <Dashboard />
        </div>
      </div>
    </FilterProvider>
  );
}

export default App;
