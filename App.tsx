
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import WebinarInfo from './components/WebinarInfo';
import RegistrationForm from './components/RegistrationForm';
import AdminPage from './components/AdminPage';
import { APP_NAME } from './constants';

type ViewState = 'landing' | 'admin';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f172a]">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <Header />

      <main className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
        {view === 'landing' ? (
          <>
            <Hero />
            <WebinarInfo />
            <RegistrationForm />
          </>
        ) : (
          <AdminPage onBack={() => setView('landing')} />
        )}
        
        <footer className="mt-24 border-t border-white/5 pt-12 text-center">
          <div className="flex flex-col items-center space-y-4">
             <div className="flex items-center space-x-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
              <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center font-bold text-white text-[10px]">N</div>
              <span className="text-sm font-bold tracking-tight text-white uppercase italic">{APP_NAME}</span>
            </div>
            
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} {APP_NAME}. Hosted on <a href="https://finisher33.github.io/Landingpage/" className="hover:text-blue-400 underline">GitHub Pages</a>.
            </p>
            
            <button 
              onClick={() => setView('admin')}
              className="mt-2 px-3 py-1 border border-slate-800 rounded-full text-slate-600 hover:text-slate-400 hover:border-slate-600 text-[10px] transition-all"
            >
              Control Center
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
