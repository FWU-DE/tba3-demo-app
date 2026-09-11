import { FilterProvider } from './context/FilterContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/layout/Dashboard';

function App() {
  return (
    <FilterProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <Dashboard />
        </div>
      </div>
    </FilterProvider>
  );
}

export default App;
