import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  KeyRound,
  BookOpen,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import vikramLogo from '../../assets/vikram_logo.png';
import vikramIcon from '../../assets/vikram_icon.png';

export interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Schools Management', path: '/schools', icon: Building2 },
  { name: 'Student Registry', path: '/students', icon: Users },
  { name: 'Access Code Control', path: '/access-codes', icon: KeyRound },
  { name: 'Curriculum & Content', path: '/content', icon: BookOpen },
  { name: 'Admin Users', path: '/admin-users', icon: ShieldCheck },
  { name: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();

  const handleNav = (path: string) => {
    onNavigate(path);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Light Clean Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-40 flex flex-col bg-white text-slate-800 border-r border-slate-200/90 shadow-[2px_0_12px_rgba(0,0,0,0.02)] transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'w-20 min-w-[80px]' : 'w-[235px] min-w-[235px]'}`}
      >
        {/* Sidebar Logo Container */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {isCollapsed ? (
              <img
                src={vikramIcon}
                alt="Vikram"
                className="w-8 h-8 object-contain shrink-0 mx-auto"
              />
            ) : (
              <div className="flex items-center gap-2 overflow-hidden">
                <img
                  src={vikramLogo}
                  alt="VIKRAM"
                  className="h-8 max-w-[155px] object-contain shrink-0"
                />
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto custom-sidebar-scroll">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPath === item.path ||
              (item.path !== '/dashboard' && currentPath.startsWith(item.path));

            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-2.5 px-3 min-h-[38px] rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white font-semibold shadow-sm shadow-red-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {!isCollapsed && <span className="truncate leading-snug">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout Footer */}
        <div className="p-3 border-t border-slate-100 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs uppercase shrink-0 shadow-xs">
                  {user?.name ? user.name.slice(0, 2) : 'AD'}
                </div>
                <div className="truncate text-left">
                  <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Admin User'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@platform.com'}</p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              title="Logout"
              className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
