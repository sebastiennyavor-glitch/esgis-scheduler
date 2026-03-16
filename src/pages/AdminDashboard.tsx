import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Seance } from '@/types';
import WeekNavigation from '@/components/WeekNavigation';
import ScheduleGrid from '@/components/ScheduleGrid';
import { LogOut, CalendarDays, Send, CheckCircle, Plus, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { seances, emploiTemps, salles, cours, professeurs, loading, error, addSeance, updateEmploiStatut } = useData();
  const [currentWeek, setCurrentWeek] = useState<1 | 2 | 3 | 4>(1);
  const [published, setPublished] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id_cours: '',
    id_salle: '',
    type_seance: 'cours' as 'cours' | 'examen',
    date: '',
    heure_debut: '08:00',
    heure_fin: '10:00',
    profIds: [] as number[],
  });

  const weekSeances = seances.filter(s => s.semaine === currentWeek);
  const planning = emploiTemps[0];

  const stats = {
    total: seances.length,
    cours: seances.filter(s => s.type_seance === 'cours').length,
    examens: seances.filter(s => s.type_seance === 'examen').length,
    poles: 3,
  };

  const handlePublish = async () => {
    if (!planning) return;
    try {
      await updateEmploiStatut(planning.id_emploi, 'publié');
      setPublished(true);
      toast.success('🚀 Planning publié ! Notifications envoyées aux professeurs et délégués.', { duration: 5000 });
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    }
  };

  const handleAddSeance = async () => {
    if (!formData.id_cours || !formData.id_salle || !formData.date || formData.profIds.length === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setSubmitting(true);
    try {
      await addSeance({
        id_emploi: planning?.id_emploi || 1,
        id_cours: parseInt(formData.id_cours),
        id_salle: parseInt(formData.id_salle),
        type_seance: formData.type_seance,
        date: formData.date,
        heure_debut: formData.heure_debut,
        heure_fin: formData.heure_fin,
        semaine: currentWeek,
        professeurs: formData.profIds.map(id => ({
          id_prof: id,
          role: formData.type_seance === 'examen' ? 'surveillant' as const : 'enseignant' as const,
        })),
      });
      setShowForm(false);
      setFormData({ id_cours: '', id_salle: '', type_seance: 'cours', date: '', heure_debut: '08:00', heure_fin: '10:00', profIds: [] });
      toast.success('Séance ajoutée avec succès !');
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleProf = (id: number) => {
    setFormData(prev => ({
      ...prev,
      profIds: prev.profIds.includes(id) ? prev.profIds.filter(p => p !== id) : prev.profIds.length < 10 ? [...prev.profIds, id] : prev.profIds,
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-xl border border-destructive bg-card p-6 text-center">
          <p className="font-heading text-lg font-bold text-destructive">Erreur de connexion</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-esgis shadow-esgis">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-7 w-7 text-primary-foreground" />
            <div>
              <h1 className="font-heading text-lg font-black text-primary-foreground">ESGIS Planning</h1>
              <p className="text-xs text-primary-foreground/80">Administration</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary-foreground/20">
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Total séances', value: stats.total, icon: BarChart3 },
            { label: 'Cours', value: stats.cours, icon: CalendarDays },
            { label: 'Examens', value: stats.examens, icon: CalendarDays },
            { label: 'Pôles', value: stats.poles, icon: CalendarDays },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-1 font-heading text-2xl font-black text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {planning && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">{planning.titre}</h2>
              <p className="text-sm text-muted-foreground">{planning.date_debut} → {planning.date_fin}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-heading text-sm font-semibold text-foreground transition hover:bg-muted">
                <Plus className="h-4 w-4" /> Ajouter
              </button>
              <button
                onClick={handlePublish}
                disabled={published || planning.statut === 'publié'}
                className="flex items-center gap-2 rounded-xl gradient-gold px-6 py-2 font-heading text-sm font-bold text-secondary-foreground shadow-gold transition hover:opacity-90 disabled:opacity-60 animate-pulse-gold"
              >
                {published || planning.statut === 'publié' ? <><CheckCircle className="h-4 w-4" /> Publié</> : <><Send className="h-4 w-4" /> C'est Parti !</>}
              </button>
            </div>
          </div>
        )}

        {(published || planning?.statut === 'publié') && (
          <div className="flex items-center gap-2 rounded-lg bg-esgis-gold-light p-3 text-sm animate-fade-in">
            <CheckCircle className="h-5 w-5 text-esgis-gold" />
            <span className="font-semibold text-secondary-foreground">Notifications envoyées aux professeurs et délégués concernés.</span>
          </div>
        )}

        {showForm && (
          <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-fade-in">
            <h3 className="font-heading text-sm font-bold text-foreground">Nouvelle séance — Semaine {currentWeek}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Cours</label>
                <select value={formData.id_cours} onChange={e => setFormData(p => ({ ...p, id_cours: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Choisir…</option>
                  {cours.map(c => <option key={c.id_cours} value={c.id_cours}>{c.code_cours} — {c.nom_cours}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Salle</label>
                <select value={formData.id_salle} onChange={e => setFormData(p => ({ ...p, id_salle: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Choisir…</option>
                  {salles.map(s => <option key={s.id_salle} value={s.id_salle}>{s.nom_salle} — {s.pole} ({s.capacite} places)</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Type</label>
                <select value={formData.type_seance} onChange={e => setFormData(p => ({ ...p, type_seance: e.target.value as 'cours' | 'examen' }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="cours">Cours</option>
                  <option value="examen">Examen</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Date</label>
                <input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Début</label>
                <input type="time" value={formData.heure_debut} onChange={e => setFormData(p => ({ ...p, heure_debut: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Fin</label>
                <input type="time" value={formData.heure_fin} onChange={e => setFormData(p => ({ ...p, heure_fin: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-muted-foreground">Professeurs (max 10)</label>
              <div className="flex flex-wrap gap-2">
                {professeurs.map(p => (
                  <button
                    key={p.id_prof}
                    onClick={() => toggleProf(p.id_prof)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      formData.profIds.includes(p.id_prof)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {p.prenom} {p.nom}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddSeance} disabled={submitting} className="rounded-lg gradient-esgis px-6 py-2 font-heading text-sm font-bold text-primary-foreground shadow-esgis disabled:opacity-60">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ajouter la séance'}
              </button>
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
                Annuler
              </button>
            </div>
          </div>
        )}

        <WeekNavigation currentWeek={currentWeek} onWeekChange={setCurrentWeek} />
        <ScheduleGrid seances={weekSeances} />
      </main>
    </div>
  );
};

export default AdminDashboard;
