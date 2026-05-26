import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SideNav } from './components/SideNav';
import { BottomNav } from './components/BottomNav';
import { EntryPage } from './pages/EntryPage';
import { BillPage } from './pages/BillPage';
import { HistoryPage } from './pages/HistoryPage';
import { ConfigPage } from './pages/ConfigPage';
import { initDB } from './db';

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initDB()
      .then(() => setDbReady(true))
      .catch(e => {
        console.error("Failed to initialize database", e);
        setError(e.message || "Failed to initialize database");
      });
  }, []);

  if (error) {
    return <div className="p-8 text-red-500 font-bold text-center">Error: {error}</div>;
  }

  if (!dbReady) {
    return <div className="p-8 text-center text-gray-500">Initializing Database...</div>;
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-bg text-gray-900 font-sans">
        <SideNav />
        <main className="flex-1 md:ml-64 overflow-y-auto w-full">
          <Routes>
            <Route path="/" element={<EntryPage />} />
            <Route path="/bill" element={<BillPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/config" element={<ConfigPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
