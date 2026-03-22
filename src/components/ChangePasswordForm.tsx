import { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ChangePasswordFormProps {
  userType: 'professeur' | 'delegue';
  userId: number;
  userName: string;
  onPasswordChanged: () => void;
}

const DEFAULT_PASSWORDS = {
  professeur: 'prof@2026',
  delegue: 'delegue@2026',
};

const ChangePasswordForm = ({ userType, userId, userName, onPasswordChanged }: ChangePasswordFormProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword === DEFAULT_PASSWORDS[userType]) {
      setError('Vous ne pouvez pas réutiliser le mot de passe par défaut.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSaving(true);
    try {
      const table = userType === 'professeur' ? 'professeurs' : 'delegues';
      const idColumn = userType === 'professeur' ? 'id_prof' : 'id_delegue';
      const { error: updateError } = await supabase
        .from(table)
        .update({ mot_de_passe: newPassword })
        .eq(idColumn, userId);
      if (updateError) throw new Error(updateError.message);
      toast.success('Mot de passe mis à jour avec succès !');
      onPasswordChanged();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/20">
            <Lock className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="font-heading text-2xl font-black text-foreground">
            Changez votre mot de passe
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bonjour <strong>{userName}</strong>, pour sécuriser votre compte, veuillez définir un nouveau mot de passe personnel.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Vous êtes le/la seul(e) à connaître ce mot de passe. L'administration n'y a pas accès.
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div>
            <label className="mb-1 block font-heading text-xs font-semibold text-foreground">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError(''); }}
                placeholder="Au moins 6 caractères"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-heading text-xs font-semibold text-foreground">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                placeholder="Retapez le mot de passe"
                className="w-full rounded-lg border border-input bg-background px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-destructive">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={saving || !newPassword || !confirmPassword}
            className="flex w-full items-center justify-center gap-2 rounded-xl gradient-esgis px-6 py-3 font-heading text-sm font-bold text-primary-foreground shadow-esgis transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Enregistrement...' : <>Valider <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
