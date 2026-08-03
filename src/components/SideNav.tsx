import { NavLink } from 'react-router-dom';
import { FileEdit, Receipt, History, Settings, Layers } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Entry', icon: FileEdit },
  { path: '/bill', label: 'Bill', icon: Receipt },
  { path: '/history', label: 'History', icon: History },
  { path: '/cumulative', label: 'Bulk', icon: Layers },
  { path: '/config', label: 'Config', icon: Settings },
];

export function SideNav() {
  return (
    <div className="hidden md:flex flex-col w-64 h-screen bg-card border-r border-border fixed top-0 left-0 no-print">
      <div className="p-6 flex items-center gap-3">
        <img src="/logo.svg" alt="BillBoy Logo" className="w-8 h-8" />
        <span className="font-bold text-xl text-saffron">BillBoy</span>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-saffron text-white' : 'text-gray-600 hover:bg-saffron-light hover:text-saffron'
              }`
            }
          >
            <tab.icon className="w-5 h-5" />
            <span className="font-medium">{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
