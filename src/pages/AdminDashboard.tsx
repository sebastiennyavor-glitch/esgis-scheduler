import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import WeekNavigation from '@/components/WeekNavigation';
import ScheduleGrid from '@/components/ScheduleGrid';
import WhatsAppModal from '@/components/WhatsAppModal';
import { LogOut, CalendarDays, Send, CircleCheck as CheckCircle, Plus, ChartBar as BarChart3, Loader as Loader2, BookOpen, Building2, Users, Trash2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'planning' | 'cours' | 'salles' | 'professeurs' | 'delegues';

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { seances, emploiTemps, salles, cours, professeurs, delegues, loading, error, addSeance, updateEmploiStatut, refetch } = useData();
  const [currentWeek, setCurrentWeek] = useState<1 | 2 | 3 | 4>(1);
  const [published, setPublished] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('planning');
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);

  // Formulaire séance
  const [formData, setFormData] = useState({
    id_cours: '',
    id_salle: '',
    type_seance: 'cours' as 'cours' | 'examen',
    date: '',
    heure_debut: '08:00',
    heure_fin: '10:00',
    profIds: [] as number[],
  });

  // Formulaire nouveau cours
  const [coursForm, setCoursForm] = useState({ nom_cours: '', code_cours: '', description: '' });
  const [addingCours, setAddingCours] = useState(false);

  // Formulaire nouvelle salle
  const [salleForm, setSalleForm] = useState({ nom_salle: '', capacite: '', pole: 'Adidogomé' });
  const [addingSalle, setAddingSalle] = useState(false);

  // Formulaire nouveau professeur
  const [profForm, setProfForm] = useState({ nom: '', prenom: '', email: '', specialite: '', telephone: '' });
  const [addingProf, setAddingProf] = useState(false);

  // Formulaire nouveau délégué
  const [delegueForm, setDelegueForm] = useState({ nom: '', prenom: '', email: '', telephone: '', id_salle: '' });
  const [addingDelegue, setAddingDelegue] = useState(false);

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
      setWhatsappModalOpen(true);
      toast.success('Planning publié !', { duration: 5000 });
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
      profIds: prev.profIds.includes(id)
        ? prev.profIds.filter(p => p !== id)
        : prev.profIds.length < 10 ? [...prev.profIds, id] : prev.profIds,
    }));
  };

  // Ajouter un cours
  const handleAddCours = async () => {
    if (!coursForm.nom_cours || !coursForm.code_cours) {
      toast.error('Nom et code du cours sont obligatoires.');
      return;
    }
    setAddingCours(true);
    try {
      const { error } = await supabase.from('cours').insert([coursForm]);
      if (error) throw error;
      setCoursForm({ nom_cours: '', code_cours: '', description: '' });
      refetch();
      toast.success('Cours ajouté !');
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setAddingCours(false);
    }
  };

  // Supprimer un cours
  const handleDeleteCours = async (id: number) => {
    if (!confirm('Supprimer ce cours ?')) return;
    const { error } = await supabase.from('cours').delete().eq('id_cours', id);
    if (error) toast.error(error.message);
    else { refetch(); toast.success('Cours supprimé.'); }
  };

  // Ajouter une salle
  const handleAddSalle = async () => {
    if (!salleForm.nom_salle || !salleForm.capacite) {
      toast.error('Nom et capacité obligatoires.');
      return;
    }
    setAddingSalle(true);
    try {
      const { error } = await supabase.from('salles').insert([{ ...salleForm, capacite: parseInt(salleForm.capacite) }]);
      if (error) throw error;
      setSalleForm({ nom_salle: '', capacite: '', pole: 'Adidogomé' });
      refetch();
      toast.success('Salle ajoutée !');
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setAddingSalle(false);
    }
  };

  // Supprimer une salle
  const handleDeleteSalle = async (id: number) => {
    if (!confirm('Supprimer cette salle ?')) return;
    const { error } = await supabase.from('salles').delete().eq('id_salle', id);
    if (error) toast.error(error.message);
    else { refetch(); toast.success('Salle supprimée.'); }
  };

  // Ajouter un professeur
  const handleAddProf = async () => {
    if (!profForm.nom || !profForm.prenom) {
      toast.error('Nom et prénom obligatoires.');
      return;
    }
    setAddingProf(true);
    try {
      const { error } = await supabase.from('professeurs').insert([profForm]);
      if (error) throw error;
      setProfForm({ nom: '', prenom: '', email: '', specialite: '', telephone: '' });
      refetch();
      toast.success('Professeur ajouté !');
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setAddingProf(false);
    }
  };

  // Ajouter un délégué
  const handleAddDelegue = async () => {
    if (!delegueForm.nom || !delegueForm.prenom) {
      toast.error('Nom et prénom obligatoires.');
      return;
    }
    setAddingDelegue(true);
    try {
      const dataToInsert = { ...delegueForm, id_salle: delegueForm.id_salle ? parseInt(delegueForm.id_salle) : null };
      const { error } = await supabase.from('delegues').insert([dataToInsert]);
      if (error) throw error;
      setDelegueForm({ nom: '', prenom: '', email: '', telephone: '', id_salle: '' });
      refetch();
      toast.success('Délégué ajouté !');
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setAddingDelegue(false);
    }
  };

  // Supprimer un professeur
  const handleDeleteProf = async (id: number) => {
    if (!confirm('Supprimer ce professeur ?')) return;
    const { error } = await supabase.from('professeurs').delete().eq('id_prof', id);
    if (error) toast.error(error.message);
    else { refetch(); toast.success('Professeur supprimé.'); }
  };

  // Supprimer un délégué
  const handleDeleteDelegue = async (id: number) => {
    if (!confirm('Supprimer ce délégué ?')) return;
    const { error } = await supabase.from('delegues').delete().eq('id_delegue', id);
    if (error) toast.error(error.message);
    else { refetch(); toast.success('Délégué supprimé.'); }
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

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'planning', label: 'Planning', icon: CalendarDays },
    { key: 'cours', label: 'Cours', icon: BookOpen },
    { key: 'salles', label: 'Salles', icon: Building2 },
    { key: 'professeurs', label: 'Professeurs', icon: Users },
    { key: 'delegues', label: 'Délégués', icon: Users },
  ];

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
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Total séances', value: stats.total },
            { label: 'Cours', value: stats.cours },
            { label: 'Examens', value: stats.examens },
            { label: 'Pôles', value: stats.poles },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-1 font-heading text-2xl font-black text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? 'gradient-esgis text-primary-foreground shadow'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ===== ONGLET PLANNING ===== */}
        {activeTab === 'planning' && (
          <>
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
                    title="Publier et envoyer notifications"
                  >
                    {published || planning.statut === 'publié'
                      ? <><CheckCircle className="h-4 w-4" /> Publié</>
                      : <><Send className="h-4 w-4" /> C'est Parti !</>}
                  </button>
                </div>
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
                      <button key={p.id_prof} onClick={() => toggleProf(p.id_prof)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${formData.profIds.includes(p.id_prof) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
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
          </>
        )}

        {/* ===== ONGLET COURS ===== */}
        {activeTab === 'cours' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4" /> Ajouter un cours
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Nom du cours *</label>
                  <input type="text" placeholder="ex: Algorithmique Avancée" value={coursForm.nom_cours} onChange={e => setCoursForm(p => ({ ...p, nom_cours: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Code cours *</label>
                  <input type="text" placeholder="ex: INFO301" value={coursForm.code_cours} onChange={e => setCoursForm(p => ({ ...p, code_cours: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Description</label>
                  <input type="text" placeholder="Description optionnelle" value={coursForm.description} onChange={e => setCoursForm(p => ({ ...p, description: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <button onClick={handleAddCours} disabled={addingCours} className="flex items-center gap-2 rounded-lg gradient-esgis px-6 py-2 font-heading text-sm font-bold text-primary-foreground disabled:opacity-60">
                {addingCours ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Ajouter</>}
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nom</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cours.map(c => (
                    <tr key={c.id_cours} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs text-primary">{c.code_cours}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{c.nom_cours}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.description || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteCours(c.id_cours)} className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10 transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== ONGLET SALLES ===== */}
        {activeTab === 'salles' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4" /> Ajouter une salle
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Nom de la salle *</label>
                  <input type="text" placeholder="ex: Salle A3" value={salleForm.nom_salle} onChange={e => setSalleForm(p => ({ ...p, nom_salle: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Capacité *</label>
                  <input type="number" placeholder="ex: 40" value={salleForm.capacite} onChange={e => setSalleForm(p => ({ ...p, capacite: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Pôle *</label>
                  <select value={salleForm.pole} onChange={e => setSalleForm(p => ({ ...p, pole: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Adidogomé</option>
                    <option>Avédji</option>
                    <option>Kodjoviakopé</option>
                  </select>
                </div>
              </div>
              <button onClick={handleAddSalle} disabled={addingSalle} className="flex items-center gap-2 rounded-lg gradient-esgis px-6 py-2 font-heading text-sm font-bold text-primary-foreground disabled:opacity-60">
                {addingSalle ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Ajouter</>}
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nom</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Pôle</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Capacité</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {salles.map(s => (
                    <tr key={s.id_salle} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-semibold text-foreground">{s.nom_salle}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.pole}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.capacite} places</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteSalle(s.id_salle)} className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10 transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== ONGLET PROFESSEURS ===== */}
        {activeTab === 'professeurs' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4" /> Ajouter un professeur
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Nom *</label>
                  <input type="text" placeholder="ex: Mensah" value={profForm.nom} onChange={e => setProfForm(p => ({ ...p, nom: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Prénom *</label>
                  <input type="text" placeholder="ex: Kofi" value={profForm.prenom} onChange={e => setProfForm(p => ({ ...p, prenom: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Email</label>
                  <input type="email" placeholder="ex: prof@esgis.tg" value={profForm.email} onChange={e => setProfForm(p => ({ ...p, email: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Téléphone</label>
                  <input type="tel" placeholder="ex: +228 XX XX XX XX" value={profForm.telephone} onChange={e => setProfForm(p => ({ ...p, telephone: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Spécialité</label>
                  <input type="text" placeholder="ex: Informatique" value={profForm.specialite} onChange={e => setProfForm(p => ({ ...p, specialite: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <button onClick={handleAddProf} disabled={addingProf} className="flex items-center gap-2 rounded-lg gradient-esgis px-6 py-2 font-heading text-sm font-bold text-primary-foreground disabled:opacity-60">
                {addingProf ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Ajouter</>}
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nom complet</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Téléphone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Spécialité</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {professeurs.map(p => (
                    <tr key={p.id_prof} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-semibold text-foreground">{p.prenom} {p.nom}</td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">{p.email || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-sm font-mono">{p.telephone || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">{p.specialite || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteProf(p.id_prof)} className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10 transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== ONGLET DÉLÉGUÉS ===== */}
        {activeTab === 'delegues' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4" /> Ajouter un délégué
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Nom *</label>
                  <input type="text" placeholder="ex: Mensah" value={delegueForm.nom} onChange={e => setDelegueForm(p => ({ ...p, nom: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Prénom *</label>
                  <input type="text" placeholder="ex: Kofi" value={delegueForm.prenom} onChange={e => setDelegueForm(p => ({ ...p, prenom: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Email</label>
                  <input type="email" placeholder="ex: delegue@esgis.tg" value={delegueForm.email} onChange={e => setDelegueForm(p => ({ ...p, email: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Téléphone</label>
                  <input type="tel" placeholder="ex: +228 XX XX XX XX" value={delegueForm.telephone} onChange={e => setDelegueForm(p => ({ ...p, telephone: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Salle</label>
                  <select value={delegueForm.id_salle} onChange={e => setDelegueForm(p => ({ ...p, id_salle: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Choisir…</option>
                    {salles.map(s => <option key={s.id_salle} value={s.id_salle}>{s.nom_salle}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleAddDelegue} disabled={addingDelegue} className="flex items-center gap-2 rounded-lg gradient-esgis px-6 py-2 font-heading text-sm font-bold text-primary-foreground disabled:opacity-60">
                {addingDelegue ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Ajouter</>}
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nom complet</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Téléphone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Salle</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {delegues.map(d => {
                    const salle = salles.find(s => s.id_salle === d.id_salle);
                    return (
                      <tr key={d.id_delegue} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-semibold text-foreground">{d.prenom} {d.nom}</td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">{d.email || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground text-sm font-mono">{d.telephone || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">{salle?.nom_salle || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteDelegue(d.id_delegue)} className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10 transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <WhatsAppModal
        isOpen={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
        professeurs={professeurs}
        delegues={delegues}
        planningTitle={planning?.titre || 'Planning ESGIS'}
      />
    </div>
  );
};

export default AdminDashboard;
