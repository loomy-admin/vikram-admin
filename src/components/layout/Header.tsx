import React from 'react';
import { Menu, Server, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/axios';

interface HeaderProps {
  onOpenMobile: () => void;
  title: string;
  breadcrumbs?: string[];
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobile, title, breadcrumbs }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-[#f7fbff] border-b border-[#d7e7f8] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left section: mobile hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 rounded-lg text-[#12335f] hover:bg-[#e8f2ff] transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#60728a] mb-0.5 font-medium">
              <span>Console</span>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <span>/</span>
                  <span className={idx === breadcrumbs.length - 1 ? 'font-bold text-[#12335f]' : ''}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
          <h1 className="text-lg font-black text-[#12335f] leading-none tracking-tight">{title}</h1>
        </div>
      </div>

      {/* Right section: API Status & User quick profile */}
      <div className="flex items-center gap-4">
        {/* Backend API Connection Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate max-w-[200px]" title={API_BASE_URL}>
            {API_BASE_URL}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="API Configured" />
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-slate-900">{user?.name || 'Administrator'}</p>
            <div className="flex items-center justify-end gap-1 text-[11px] text-slate-500">
              <Shield className="w-3 h-3 text-blue-600" />
              <span>Full Access</span>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
