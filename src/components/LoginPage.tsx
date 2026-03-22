import { useState } from 'react';
import { UserRole } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Shield, GraduationCap, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoginPageProps {
  onLogin: (role: UserRole, id?: number, needsPasswordChange?: boolean) => void;
}

const ADMIN_PASSWORD = 'admin@2026';
const DEFAULT_PROF_PASSWORD = 'prof@2026';
const DEFAULT_DELEGUE_PASSWORD = 'delegue@2026';

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const { professeurs, delegues, salles } = useData();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [profId, setProfId] = useState('');
  const [delegueId, setDelegueId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!selectedRole) return;
    
    if (selectedRole === 'professeur') {
      if (!profId) return;
      const prof = professeurs.find(p => p.id_prof === parseInt(profId));
      if (!prof) { setError('Professeur introuvable'); return; }
      const currentPassword = prof.mot_de_passe || DEFAULT_PROF_PASSWORD;
      if (password !== currentPassword) { setError('Mot de passe incorrect'); return; }
      const needsChange = !prof.mot_de_passe || prof.mot_de_passe === DEFAULT_PROF_PASSWORD;
      setError('');
      onLogin('professeur', parseInt(profId), needsChange);
    } else if (selectedRole === 'delegue') {
      if (!delegueId) return;
      const delegue = delegues.find(d => d.id_delegue === parseInt(delegueId));
      if (!delegue) { setError('Délégué introuvable'); return; }
      const currentPassword = delegue.mot_de_passe || DEFAULT_DELEGUE_PASSWORD;
      if (password !== currentPassword) { setError('Mot de passe incorrect'); return; }
      const needsChange = !delegue.mot_de_passe || delegue.mot_de_passe === DEFAULT_DELEGUE_PASSWORD;
      setError('');
      onLogin('delegue', parseInt(delegueId), needsChange);
    } else if (selectedRole === 'admin') {
      if (password !== ADMIN_PASSWORD) { setError('Mot de passe incorrect'); return; }
      setError('');
      onLogin('admin');
    }
  };

  const roles = [
    { key: 'admin' as UserRole, label: 'Administration', desc: 'Gérer les plannings et les séances', icon: Shield },
    { key: 'professeur' as UserRole, label: 'Professeur', desc: 'Consulter vos séances', icon: GraduationCap },
    { key: 'delegue' as UserRole, label: 'Délégué', desc: 'Voir le planning de votre salle', icon: Users },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl gradient-esgis shadow-esgis">
          <GraduationCap className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-foreground md:text-4xl">
          ESGIS <span className="text-primary">Planning</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Gestion des emplois du temps — 3 Pôles
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          {['Adidogomé', 'Avédji', 'Kodjoviakopé'].map(pole => (
            <span key={pole} className="rounded-full bg-esgis-gold-light px-3 py-1 font-heading text-xs font-semibold text-secondary-foreground">
              {pole}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md space-y-3">
        {roles.map(role => {
          const Icon = role.icon;
          return (
            <button
              key={role.key}
              onClick={() => { setSelectedRole(role.key); setError(''); setPassword(''); }}
              className={cn(
                'flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200',
                selectedRole === role.key
                  ? 'border-primary bg-esgis-red-light shadow-esgis'
                  : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
              )}
            >
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                selectedRole === role.key ? 'gradient-esgis' : 'bg-muted'
              )}>
                <Icon className={cn('h-6 w-6', selectedRole === role.key ? 'text-primary-foreground' : 'text-muted-foreground')} />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-sm font-bold text-foreground">{role.label}</h3>
                <p className="text-xs text-muted-foreground">{role.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {selectedRole === 'professeur' && (
        <div className="mt-4 w-full max-w-md animate-fade-in">
          <label className="mb-1 block font-heading text-xs font-semibold text-foreground">Sélectionnez votre profil</label>
          <select
            value={profId}
            onChange={e => setProfId(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— Choisir un professeur —</option>
            {professeurs.map(p => (
              <option key={p.id_prof} value={p.id_prof}>{p.prenom} {p.nom} — {p.specialite}</option>
            ))}
          </select>
        </div>
      )}

      {selectedRole === 'delegue' && (
        <div className="mt-4 w-full max-w-md animate-fade-in">
          <label className="mb-1 block font-heading text-xs font-semibold text-foreground">Sélectionnez votre profil</label>
          <select
            value={delegueId}
            onChange={e => setDelegueId(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— Choisir un délégué —</option>
            {delegues.map(d => {
              const salle = salles.find(s => s.id_salle === d.id_salle);
              return (
                <option key={d.id_delegue} value={d.id_delegue}>
                  {d.prenom} {d.nom} — {salle?.nom_salle} ({salle?.pole})
                </option>
              );
            })}
          </select>
        </div>
      )}

      {selectedRole && (
        <div className="mt-4 w-full max-w-md animate-fade-in">
          <label className="mb-1 block font-heading text-xs font-semibold text-foreground">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder={selectedRole === 'professeur' ? 'Votre mot de passe (défaut: prof@2026)' : selectedRole === 'delegue' ? 'Votre mot de passe (défaut: delegue@2026)' : 'Mot de passe administrateur'}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {error && <p className="mt-1 text-xs font-semibold text-destructive">{error}</p>}
        </div>
      )}

      {selectedRole && (
        <button
          onClick={handleSubmit}
          disabled={
            !password ||
            (selectedRole === 'professeur' && !profId) ||
            (selectedRole === 'delegue' && !delegueId)
          }
          className="mt-6 flex items-center gap-2 rounded-xl gradient-esgis px-8 py-3 font-heading text-sm font-bold text-primary-foreground shadow-esgis transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed animate-fade-in"
        >
          Accéder <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default LoginPage;
