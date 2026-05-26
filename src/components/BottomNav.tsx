import { NavLink } from 'react-router-dom';
import { FileEdit, Receipt, History, Settings } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Entry', icon: FileEdit },
  { path: '/bill', label: 'Bill', icon: Receipt },
  { path: '/history', label: 'History', icon: History },
  { path: '/config', label: 'Config', icon: Settings },
];

export function BottomNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-card border-t border-border flex justify-around p-2 pb-safe no-print z-50">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            `flex flex-col items-center p-2 min-w-[64px] transition-colors rounded-lg ${
              isActive ? 'text-saffron' : 'text-gray-500 hover:text-saffron hover:bg-saffron-light'
            }`
          }
        >
          <tab.icon className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">{tab.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
