
import React from 'react';
import { Home, Scan, Plus, Box } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  return (
    <div className="min-h-screen pb-24 flex flex-col max-w-md mx-auto bg-gray-50 shadow-xl overflow-hidden relative">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          مخزون برو
        </h1>
        {currentView !== 'SCANNER' && (
           <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <Box size={20} />
           </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-lg border-t border-gray-200 z-50 flex justify-around items-center px-4 py-3 safe-area-bottom">
        <NavItem 
          icon={<Home size={24} />} 
          label="الرئيسية" 
          active={currentView === 'HOME'} 
          onClick={() => setView('HOME')} 
        />
        <NavItem 
          icon={<Scan size={24} />} 
          label="مسح" 
          active={currentView === 'SCANNER'} 
          onClick={() => setView('SCANNER')} 
        />
        <div className="relative -top-5">
          <button 
            onClick={() => setView('ADD_PRODUCT')}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${currentView === 'ADD_PRODUCT' ? 'bg-indigo-700' : 'bg-indigo-600'} text-white`}
          >
            <Plus size={32} />
          </button>
        </div>
        <NavItem 
          icon={<Box size={24} />} 
          label="المخزن" 
          active={currentView === 'INVENTORY'} 
          onClick={() => setView('INVENTORY')} 
        />
        <NavItem 
          icon={<div className="w-6 h-6 rounded-full bg-gray-200" />} 
          label="المزيد" 
          active={false} 
          onClick={() => {}} 
        />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-indigo-600' : 'text-gray-400'}`}
  >
    {icon}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default Layout;
