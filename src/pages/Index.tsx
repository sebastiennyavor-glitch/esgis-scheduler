import { useState } from 'react';
import { UserRole } from '@/types';
import LoginPage from '@/components/LoginPage';
import AdminDashboard from '@/pages/AdminDashboard';
import ProfessorDashboard from '@/pages/ProfessorDashboard';
import DelegateDashboard from '@/pages/DelegateDashboard';

const Index = () => {
  const [auth, setAuth] = useState<{ role: UserRole; id?: number } | null>(null);

  const handleLogin = (role: UserRole, id?: number) => {
    setAuth({ role, id });
  };

  const handleLogout = () => {
    setAuth(null);
  };

  if (!auth) return <LoginPage onLogin={handleLogin} />;

  switch (auth.role) {
    case 'admin':
      return <AdminDashboard onLogout={handleLogout} />;
    case 'professeur':
      return <ProfessorDashboard profId={auth.id!} onLogout={handleLogout} />;
    case 'delegue':
      return <DelegateDashboard delegueId={auth.id!} onLogout={handleLogout} />;
  }
};

export default Index;
