import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Cours, Professeur, Salle, Delegue, EmploiTemps, Seance, SeanceProfesseur, ConfigPlanning } from '@/types';

interface DataContextType {
  cours: Cours[];
  professeurs: Professeur[];
  salles: Salle[];
  delegues: Delegue[];
  emploiTemps: EmploiTemps[];
  seances: Seance[];
  configPlanning: ConfigPlanning | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refetch: () => Promise<void>;
  addSeance: (seance: Omit<Seance, 'id_seance'>) => Promise<void>;
  deleteSeance: (id: number) => Promise<void>;
  addCours: (nom: string, code: string) => Promise<void>;
  deleteCours: (id: number) => Promise<void>;
  updateEmploiStatut: (id: number, statut: 'brouillon' | 'publié') => Promise<void>;
  saveConfigPlanning: (config: ConfigPlanning) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [cours, setCours] = useState<Cours[]>([]);
  const [professeurs, setProfesseurs] = useState<Professeur[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [delegues, setDelegues] = useState<Delegue[]>([]);
  const [emploiTemps, setEmploiTemps] = useState<EmploiTemps[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [configPlanning, setConfigPlanning] = useState<ConfigPlanning | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursRes, profsRes, sallesRes, deleguesRes, emploiRes, seancesRes, spRes, configRes] = await Promise.all([
        supabase.from('cours').select('*'),
        supabase.from('professeurs').select('*'),
        supabase.from('salles').select('*'),
        supabase.from('delegues').select('*'),
        supabase.from('emploi_temps').select('*'),
        supabase.from('seances').select('*'),
        supabase.from('seance_professeurs').select('*'),
        supabase.from('config_planning').select('*').limit(1).maybeSingle(),
      ]);

      const results = [coursRes, profsRes, sallesRes, deleguesRes, emploiRes, seancesRes, spRes];
      const names = ['cours', 'professeurs', 'salles', 'delegues', 'emploi_temps', 'seances', 'seance_professeurs'];
      for (let i = 0; i < results.length; i++) {
        if (results[i].error) throw new Error(`Erreur table ${names[i]}: ${results[i].error.message}`);
      }

      setCours(coursRes.data || []);
      setProfesseurs(profsRes.data || []);
      setSalles(sallesRes.data || []);
      setDelegues(deleguesRes.data || []);
      setEmploiTemps(emploiRes.data || []);
      setConfigPlanning(configRes.data || null);

      const spData = (spRes.data || []) as { id_seance: number; id_prof: number; role: string }[];
      const enrichedSeances: Seance[] = (seancesRes.data || []).map((s: any) => ({
        ...s,
        professeurs: spData
          .filter(sp => sp.id_seance === s.id_seance)
          .map(sp => ({ id_prof: sp.id_prof, role: sp.role as SeanceProfesseur['role'] })),
      }));
      setSeances(enrichedSeances);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addCours = async (nom: string, code: string) => {
    const { error } = await supabase.from('cours').insert([{ nom_cours: nom, code_cours: code }]);
    if (error) throw new Error(error.message);
    await fetchAll();
  };

  const deleteCours = async (id: number) => {
    const { error } = await supabase.from('cours').delete().eq('id_cours', id);
    if (error) throw new Error(error.message);
    await fetchAll();
  };

  const addSeance = async (seance: Omit<Seance, 'id_seance'>) => {
    const { professeurs: profs, ...seanceData } = seance;
    const { data, error: insertError } = await supabase.from('seances').insert(seanceData).select().single();
    if (insertError) throw new Error(insertError.message);
    if (profs.length > 0) {
      const spRows = profs.map(p => ({ id_seance: data.id_seance, id_prof: p.id_prof, role: p.role }));
      await supabase.from('seance_professeurs').insert(spRows);
    }
    await fetchAll();
  };

  const deleteSeance = async (id: number) => {
    await supabase.from('seance_professeurs').delete().eq('id_seance', id);
    const { error } = await supabase.from('seances').delete().eq('id_seance', id);
    if (error) throw new Error(error.message);
    await fetchAll();
  };

  const updateEmploiStatut = async (id: number, statut: 'brouillon' | 'publié') => {
    const { error } = await supabase.from('emploi_temps').update({ statut }).eq('id_emploi', id);
    if (error) throw new Error(error.message);
    await fetchAll();
  };

  const saveConfigPlanning = async (config: ConfigPlanning) => {
    if (configPlanning?.id) {
      const { error } = await supabase.from('config_planning').update({
        date_semaine: config.date_semaine,
        nb_colonnes: config.nb_colonnes,
        nb_lignes: config.nb_lignes,
      }).eq('id', configPlanning.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from('config_planning').insert([{
        date_semaine: config.date_semaine,
        nb_colonnes: config.nb_colonnes,
        nb_lignes: config.nb_lignes,
      }]);
      if (error) throw new Error(error.message);
    }
    await fetchAll();
  };

  return (
    <DataContext.Provider value={{ 
      cours, professeurs, salles, delegues, emploiTemps, seances, configPlanning, loading, error, 
      refresh: fetchAll, refetch: fetchAll, addSeance, deleteSeance, addCours, deleteCours, updateEmploiStatut, saveConfigPlanning
    }}>
      {children}
    </DataContext.Provider>
  );
};
