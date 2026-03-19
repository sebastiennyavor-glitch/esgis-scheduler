import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import WeekNavigation from '@/components/WeekNavigation';
import ScheduleGrid from '@/components/ScheduleGrid';
import WhatsAppModal from '@/components/WhatsAppModal';
import { LogOut, CalendarDays, Send, CircleCheck as CheckCircle, Plus, ChartBar as BarChart3, Loader as Loader2, BookOpen, Building2, Users, Trash2, MessageCircle, Clock, MapPin, Settings, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'planning' | 'cours' | 'salles' | 'professeurs' | 'delegues' | 'aujourdhui';

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { seances, emploiTemps, salles, cours, professeurs, delegues, configPlanning, loading, error, addSeance, deleteSeance, updateEmploiStatut, refetch, saveConfigPlanning } = useData();
  const [currentWeek, setCurrentWeek] = useState<1 | 2 | 3 | 4>(1);
  const [published, setPublished] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('planning');
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [showConfigForm, setShowConfigForm] = useState(false);

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
  const [coursForm, setCoursForm] = useState({ nom_cours: '', code_cours: '', description: '', heures_total: '' });
  const [addingCours, setAddingCours] = useState(false);

  // Formulaire nouvelle salle
  const [salleForm, setSalleForm] = useState({ nom_salle: '', capacite: '', pole: 'Adidogomé' });
  const [addingSalle, setAddingSalle] = useState(false);

  // Formulaire nouveau professeur
  const [profForm, setProfForm] = useState({ nom: '', prenom: '', email: '', specialite: '', telephone: '' });
  const [addingProf, setAddingProf] = useState(false);

  // Formulaire nouveau délégué
  const [delegueForm, setDelegueForm] = useState({ nom: '', prenom: '', email: '', telephone: '', id_salle: '', niveau: '' });
  const [addingDelegue, setAddingDelegue] = useState(false);

  // Config planning form
  const [configForm, setConfigForm] = useState({
    date_semaine: configPlanning?.date_semaine || '',
    nb_colonnes: configPlanning?.nb_colonnes?.toString() || '1',
    nb_lignes: configPlanning?.nb_lignes?.toString() || '6',
  });
  const [savingConfig, setSavingConfig] = useState(false);

  const weekSeances = seances.filter(s => s.semaine === currentWeek);
  const planning = emploiTemps[0];

  // Today's sessions
  const today = new Date().toISOString().split('T')[0];
  const todaySeances = seances.filter(s => s.date === today).sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));

  const stats = {
    total: seances.length,
    cours: seances.filter(s => s.type_seance === 'cours').length,
    examens: seances.filter(s => s.type_seance === 'examen').length,
    poles: 3,
  };

  // Calculate hours per cours
  const getCoursProgress = (id_cours: number) => {
    const coursInfo = cours.find(c => c.id_cours === id_cours);
    const total = coursInfo?.heures_total || 0;
    const coursSeances = seances.filter(s => s.id_cours === id_cours);
    const done = coursSeances.reduce((sum, s) => {
      const [hd, md] = s.heure_debut.split(':').map(Number);
      const [hf, mf] = s.heure_fin.split(':').map(Number);
      return sum + (hf + mf / 60) - (hd + md / 60);
    }, 0);
    return { done: Math.round(done * 10) / 10, total };
  };

  const handleDeleteSeance = async (id: number) => {
    try {
      await deleteSeance(id);
      toast.success('Séance supprimée du planning.');
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    }
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

  const handleAddCours = async () => {
    if (!coursForm.nom_cours || !coursForm.code_cours) {
      toast.error('Nom et code du cours sont obligatoires.');
      return;
    }
    setAddingCours(true);
    try {
      const { error } = await supabase.from('cours').insert([{
        ...coursForm,
        heures_total: coursForm.heures_total ? parseInt(coursForm.heures_total) : null,
      }]);
      if (error) throw error;
      setCoursForm({ nom_cours: '', code_cours: '', description: '', heures_total: '' });
      refetch();
      toast.success('Cours ajouté !');
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setAddingCours(false);
    }
  };

  const handleDeleteCours = async (id: number) => {
    if (!confirm('Supprimer ce cours ?')) return;
    const { error } = await supabase.from('cours').delete().eq('id_cours', id);
    if (error) toast.error(error.message);
    else { refetch(); toast.success('Cours supprimé.'); }
  };

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

  const handleDeleteSalle = async (id: number) => {
    if (!confirm('Supprimer cette salle ?')) return;
    const { error } = await supabase.from('salles').delete().eq('id_salle', id);
    if (error) toast.error(error.message);
    else { refetch(); toast.success('Salle supprimée.'); }
  };

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

  const handleAddDelegue = async () => {
    if (!delegueForm.nom || !delegueForm.prenom) {
      toast.error('Nom et prénom obligatoires.');
      return;
    }
    setAddingDelegue(true);
    try {
      const dataToInsert = {
        ...delegueForm,
        id_salle: delegueForm.id_salle ? parseInt(delegueForm.id_salle) : null,
        niveau: delegueForm.niveau || null,
      };
      const { error } = await supabase.from('delegues').insert([dataToInsert]);
      if (error) throw error;
      setDelegueForm({ nom: '', prenom: '', email: '', telephone: '', id_salle: '', niveau: '' });
      refetch();
      toast.success('Délégué ajouté !');
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setAddingDelegue(false);
    }
  };

  const handleDeleteProf = async (id: number) => {
    if (!confirm('Supprimer ce professeur ?')) return;
    const { error } = await supabase.from('professeurs').delete().eq('id_prof', id);
    if (error) toast.error(error.message);
    else { refetch(); toast.success('Professeur supprimé.'); }
  };

  const handleDeleteDelegue = async (id: number) => {
    if (!confirm('Supprimer ce délégué ?')) return;
    const { error } = await supabase.from('delegues').delete().eq('id_delegue', id);
    if (error) toast.error(error.message);
    else { refetch(); toast.success('Délégué supprimé.'); }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await saveConfigPlanning({
        date_semaine: configForm.date_semaine,
        nb_colonnes: parseInt(configForm.nb_colonnes),
        nb_lignes: parseInt(configForm.nb_lignes),
      });
      setShowConfigForm(false);
      toast.success('Configuration sauvegardée !');
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setSavingConfig(false);
    }
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
    { key: 'aujourdhui', label: "Aujourd'hui", icon: Clock },
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
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition whitespace-nowrap ${
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
                  {configPlanning?.date_semaine && (
                    <p className="mt-1 text-xs font-semibold text-primary">📅 Semaine : {configPlanning.date_semaine}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { setConfigForm({ date_semaine: configPlanning?.date_semaine || '', nb_colonnes: configPlanning?.nb_colonnes?.toString() || '1', nb_lignes: configPlanning?.nb_lignes?.toString() || '6' }); setShowConfigForm(v => !v); }} className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-heading text-sm font-semibold text-foreground transition hover:bg-muted">
                    <Settings className="h-4 w-4" /> Configurer
                  </button>
                  <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-heading text-sm font-semibold text-foreground transition hover:bg-muted">
                    <Plus className="h-4 w-4" /> Ajouter
                  </button>
                  <button
                    onClick={() => setWhatsappModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-heading text-sm font-bold text-primary-foreground transition hover:bg-green-700"
                    title="Envoyer via WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
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

            {/* Config planning form */}
            {showConfigForm && (
              <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-fade-in">
                <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Configurer la semaine
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">Date de la semaine</label>
                    <input type="text" placeholder="ex: 16 au 21 mars 2026" value={configForm.date_semaine} onChange={e => setConfigForm(p => ({ ...p, date_semaine: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">Colonnes par jour</label>
                    <select value={configForm.nb_colonnes} onChange={e => setConfigForm(p => ({ ...p, nb_colonnes: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="1">1 colonne (Licence 3)</option>
                      <option value="2">2 colonnes (Licence 1 & 2)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">Nombre de lignes</label>
                    <input type="number" min="1" max="12" value={configForm.nb_lignes} onChange={e => setConfigForm(p => ({ ...p, nb_lignes: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveConfig} disabled={savingConfig} className="rounded-lg gradient-esgis px-6 py-2 font-heading text-sm font-bold text-primary-foreground shadow-esgis disabled:opacity-60">
                    {savingConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sauvegarder'}
                  </button>
                  <button onClick={() => setShowConfigForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Annuler</button>
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
            <ScheduleGrid seances={weekSeances} onDeleteSeance={handleDeleteSeance} />
          </>
        )}

        {/* ===== ONGLET AUJOURD'HUI ===== */}
        {activeTab === 'aujourdhui' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-foreground">Séances du jour</h2>
              <span className="rounded-full bg-primary px-3 py-1 font-heading text-sm font-bold text-primary-foreground">
                {todaySeances.length} séance{todaySeances.length !== 1 ? 's' : ''} aujourd'hui
              </span>
            </div>

            {todaySeances.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
                <Clock className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="font-heading text-lg font-semibold text-muted-foreground">Aucune séance programmée aujourd'hui</p>
                <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Heure</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Cours</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Salle</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Professeur(s)</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {todaySeances.map(s => {
                      const c = cours.find(co => co.id_cours === s.id_cours);
                      const sa = salles.find(sl => sl.id_salle === s.id_salle);
                      const profs = s.professeurs.map(sp => professeurs.find(p => p.id_prof === sp.id_prof)).filter(Boolean);
                      return (
                        <tr key={s.id_seance} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono text-xs text-foreground">{s.heure_debut} - {s.heure_fin}</td>
                          <td className="px-4 py-3 font-semibold text-foreground">{c?.nom_cours} <span className="text-muted-foreground font-normal">({c?.code_cours})</span></td>
                          <td className="px-4 py-3 text-muted-foreground">{sa?.nom_salle} — {sa?.pole}</td>
                          <td className="px-4 py-3 text-muted-foreground">{profs.map(p => `${p!.prenom} ${p!.nom}`).join(', ') || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              'rounded-full px-2 py-0.5 text-xs font-bold uppercase',
                              s.type_seance === 'cours' ? 'bg-esgis-cours text-primary-foreground' : 'bg-esgis-examen text-primary-foreground'
                            )}>
                              {s.type_seance}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===== ONGLET COURS ===== */}
        {activeTab === 'cours' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4" /> Ajouter un cours
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Nom du cours *</label>
                  <input type="text" placeholder="ex: Algorithmique Avancée" value={coursForm.nom_cours} onChange={e => setCoursForm(p => ({ ...p, nom_cours: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Code cours *</label>
                  <input type="text" placeholder="ex: INFO301" value={coursForm.code_cours} onChange={e => setCoursForm(p => ({ ...p, code_cours: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Volume horaire total (h)</label>
                  <input type="number" placeholder="ex: 24" value={coursForm.heures_total} onChange={e => setCoursForm(p => ({ ...p, heures_total: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Vol. horaire</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Progression</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cours.map(c => {
                    const { done, total } = getCoursProgress(c.id_cours);
                    const pct = total > 0 ? Math.min(100, (done / total) * 100) : 0;
                    const isComplete = total > 0 && done >= total;
                    return (
                      <tr key={c.id_cours} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-mono text-xs text-primary">{c.code_cours}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{c.nom_cours}</td>
                        <td className="px-4 py-3 text-muted-foreground">{total > 0 ? `${total}h` : '—'}</td>
                        <td className="px-4 py-3">
                          {total > 0 ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                  <div className={cn('h-full rounded-full', isComplete ? 'bg-green-500' : 'bg-primary')} style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{done}h/{total}h</span>
                                {isComplete && <CheckCircle className="h-4 w-4 text-green-500" />}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{c.description || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteCours(c.id_cours)} className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10 transition">
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
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
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Niveau</label>
                  <select value={delegueForm.niveau} onChange={e => setDelegueForm(p => ({ ...p, niveau: e.target.value }))} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Choisir…</option>
                    <option value="Licence 1">Licence 1</option>
                    <option value="Licence 2">Licence 2</option>
                    <option value="Licence 3">Licence 3</option>
                  </select>
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Niveau</th>
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
                        <td className="px-4 py-3">
                          {d.niveau ? (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">{d.niveau}</span>
                          ) : '—'}
                        </td>
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
