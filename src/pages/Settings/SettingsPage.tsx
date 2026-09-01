import React from 'react';
import { Server, Shield, Database, Lock, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/axios';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">System & Platform Settings</h2>
        <p className="text-sm text-slate-500">
          Environment configuration, administrator credentials, and backend connectivity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Administrator Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Admin Profile</h3>
              <p className="text-xs text-slate-500">Your signed-in administrator session</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-400">Admin Name</p>
              <p className="font-semibold text-slate-900">{user?.name || 'Administrator'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Email Address</p>
              <p className="font-semibold text-slate-900">{user?.email || 'admin@platform.com'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">System Role</p>
              <span className="inline-flex px-2.5 py-0.5 mt-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                SUPER ADMIN
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out Session
            </button>
          </div>
        </div>

        {/* Backend & Environment Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Backend API Services</h3>
              <p className="text-xs text-slate-500">Connected Express & Prisma API service</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-400">API Base Target</p>
              <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-800 break-all block mt-1">
                {API_BASE_URL}
              </code>
            </div>

            <div>
              <p className="text-xs text-slate-400">Authentication Protocol</p>
              <p className="font-semibold text-slate-800 text-xs mt-0.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                JWT Bearer Token with Axios Interceptors
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Database Engine</p>
              <p className="font-semibold text-slate-800 text-xs mt-0.5 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-slate-400" />
                MySQL with Sequelize Database
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
