import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AdminLayout } from './components/layout/AdminLayout';

import { LoginPage } from './pages/Login/LoginPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { SchoolsPage } from './pages/Schools/SchoolsPage';
import { SchoolDetailsPage } from './pages/Schools/SchoolDetailsPage';
import { StudentsPage } from './pages/Students/StudentsPage';
import { StudentDetailsPage } from './pages/Students/StudentDetailsPage';
import { AccessCodesPage } from './pages/AccessCodes/AccessCodesPage';
import { ContentPage } from './pages/Content/ContentPage';
import { AdminUsersPage } from './pages/AdminUsers/AdminUsersPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname && window.location.pathname !== '/'
      ? window.location.pathname
      : '/dashboard';
  });

  // Handle browser back / forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname && window.location.pathname !== '/'
        ? window.location.pathname
        : '/dashboard';
      setCurrentPath(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in, always render Login page
  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => navigate('/dashboard')} />;
  }

  // Render Routes
  const renderRoute = () => {
    // School details route: /schools/:id
    if (currentPath.startsWith('/schools/') && currentPath !== '/schools') {
      const parts = currentPath.split('/');
      const id = parseInt(parts[2], 10);
      if (!isNaN(id)) {
        return (
          <AdminLayout
            title="School Profile"
            breadcrumbs={['Schools', `School #${id}`]}
            currentPath={currentPath}
            onNavigate={navigate}
          >
            <SchoolDetailsPage
              schoolId={id}
              onBack={() => navigate('/schools')}
              onNavigate={navigate}
            />
          </AdminLayout>
        );
      }
    }

    // Student details route: /students/:id
    if (currentPath.startsWith('/students/') && currentPath !== '/students') {
      const parts = currentPath.split('/');
      const id = parseInt(parts[2], 10);
      if (!isNaN(id)) {
        return (
          <AdminLayout
            title="Student Profile"
            breadcrumbs={['Students', `Student #${id}`]}
            currentPath={currentPath}
            onNavigate={navigate}
          >
            <StudentDetailsPage
              studentId={id}
              onBack={() => navigate('/students')}
              onNavigate={navigate}
            />
          </AdminLayout>
        );
      }
    }

    switch (currentPath) {
      case '/schools':
        return (
          <AdminLayout
            title="Partner Schools"
            breadcrumbs={['Schools']}
            currentPath={currentPath}
            onNavigate={navigate}
          >
            <SchoolsPage onNavigate={navigate} />
          </AdminLayout>
        );

      case '/students':
        return (
          <AdminLayout
            title="Registered Students"
            breadcrumbs={['Students']}
            currentPath={currentPath}
            onNavigate={navigate}
          >
            <StudentsPage onNavigate={navigate} />
          </AdminLayout>
        );

      case '/access-codes':
        return (
          <AdminLayout
            title="Access Codes Management"
            breadcrumbs={['Access Codes']}
            currentPath={currentPath}
            onNavigate={navigate}
          >
            <AccessCodesPage />
          </AdminLayout>
        );

      case '/content':
        return (
          <AdminLayout
            title="Curriculum & Content"
            breadcrumbs={['Content Explorer']}
            currentPath={currentPath}
            onNavigate={navigate}
          >
            <ContentPage />
          </AdminLayout>
        );

      case '/admin-users':
        return (
          <AdminLayout
            title="Administrator Accounts"
            breadcrumbs={['Admin Users']}
            currentPath={currentPath}
            onNavigate={navigate}
          >
            <AdminUsersPage />
          </AdminLayout>
        );

      case '/settings':
        return (
          <AdminLayout
            title="Settings & Connectivity"
            breadcrumbs={['Settings']}
            currentPath={currentPath}
            onNavigate={navigate}
          >
            <SettingsPage />
          </AdminLayout>
        );

      case '/dashboard':
      default:
        return (
          <AdminLayout
            title="Dashboard Overview"
            breadcrumbs={['Dashboard']}
            currentPath="/dashboard"
            onNavigate={navigate}
          >
            <DashboardPage onNavigate={navigate} />
          </AdminLayout>
        );
    }
  };

  return renderRoute();
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
