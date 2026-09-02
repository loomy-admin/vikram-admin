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
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container - #0E51B1 Corporate Blue */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-40 flex flex-col bg-[#0E51B1] text-white border-r border-white/10 shadow-[2px_0_12px_rgba(14,81,177,0.18)] transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'w-20 min-w-[80px]' : 'w-[230px] min-w-[230px]'}`}
      >
        {/* Sidebar Logo Container */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/12 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="text-sm font-extrabold text-white tracking-wide block">
                  Shiksha Admin
                </span>
                <span className="block text-[11px] text-white/70 font-medium">
                  Learning Console
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
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
                className={`w-full flex items-center gap-2.5 px-3 min-h-[38px] rounded-md text-[12.5px] font-medium transition-all ${
                  isActive
                    ? 'bg-white/18 text-white font-semibold shadow-2xs'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/80'}`} />
                {!isCollapsed && <span className="truncate leading-snug">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout Footer */}
        <div className="p-3 border-t border-white/12 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/10 border border-white/10">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-white text-[#0E51B1] font-extrabold flex items-center justify-center text-xs uppercase shrink-0">
                  {user?.name ? user.name.slice(0, 2) : 'AD'}
                </div>
                <div className="truncate text-left">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin User'}</p>
                  <p className="text-[11px] text-white/70 truncate">{user?.email || 'admin@cortex.com'}</p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/15 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              title="Logout"
              className="w-full flex items-center justify-center p-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
