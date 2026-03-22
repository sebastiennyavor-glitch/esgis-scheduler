import { useState } from 'react';
import { UserRole } from '@/types';
import LoginPage from '@/components/LoginPage';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import AdminDashboard from '@/pages/AdminDashboard';
import ProfessorDashboard from '@/pages/ProfessorDashboard';
import DelegateDashboard from '@/pages/DelegateDashboard';

const Index = () => {
  const [auth, setAuth] = useState<{ role: UserRole; id?: number; needsPasswordChange?: boolean } | null>(null);

  const handleLogin = (role: UserRole, id?: number, needsPasswordChange?: boolean) => {
    setAuth({ role, id, needsPasswordChange });
  };

  const handleLogout = () => {
    setAuth(null);
  };

  const handlePasswordChanged = () => {
    if (auth) {
      setAuth({ ...auth, needsPasswordChange: false });
    }
  };

  if (!auth) return <LoginPage onLogin={handleLogin} />;

  // Force password change for profs and delegates using default passwords
  if (auth.needsPasswordChange && (auth.role === 'professeur' || auth.role === 'delegue')) {
    const userName = auth.role === 'professeur' ? 'Professeur' : 'Délégué';
    return (
      <ChangePasswordForm
        userType={auth.role}
        userId={auth.id!}
        userName={userName}
        onPasswordChanged={handlePasswordChanged}
      />
    );
  }

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
