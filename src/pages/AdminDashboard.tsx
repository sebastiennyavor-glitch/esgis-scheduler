import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { 
  LogOut, Plus, Trash2, BookOpen, Users, Home, 
  Calendar, MapPin, User, Clock, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { cours, professeurs, salles, seances, deleteCours, addCours } = useData();
  const [currentWeek, setCurrentWeek] = useState(1);
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  const handleDeleteCours = async (id: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette matière ?")) {
      try {
        await deleteCours(id);
        toast.success("Matière supprimée avec succès");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleAddCours = async () => {
    const nom = window.prompt("Nom de la nouvelle matière :");
    if (!nom) return;
    const code = window.prompt("Code de la matière (ex: INFO301) :") || "";
    try {
      await addCours(nom, code);
      toast.success("Matière ajoutée !");
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Header ESGIS Rouge */}
      <header className="bg-[#C1272D] text-white px-8 py-6 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-lg">
            <Calendar className="h-8 w-8 text-[#C1272D]" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">ESGIS PLANNING</h1>
            <p className="text-xs font-bold opacity-90 tracking-widest uppercase">Administration</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={onLogout} 
          className="text-white hover:bg-white/20 font-bold border border-white/30"
        >
          <LogOut className="mr-2 h-4 w-4" /> Déconnexion
        </Button>
      </header>

      <main className="p-6 max-w-[1800px] mx-auto space-y-8">
        {/* Cartes de Statistiques Blanches */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total séances', val: seances.length },
            { label: 'Cours', val: cours.length },
            { label: 'Examens', val: seances.filter(s => s.type_seance === 'examen').length },
            { label: 'Pôles/Salles', val: salles.length }
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">{stat.label}</p>
                <p className="text-4xl font-black text-slate-800">{stat.val}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="planning" className="space-y-6">
          <TabsList className="bg-white border shadow-sm p-1 h-14">
            <TabsTrigger value="planning" className="px-8 font-bold data-[state=active]:bg-[#C1272D] data-[state=active]:text-white">
              <Calendar className="mr-2 h-4 w-4" /> Planning
            </TabsTrigger>
            <TabsTrigger value="cours" className="px-8 font-bold data-[state=active]:bg-[#C1272D] data-[state=active]:text-white">
              <BookOpen className="mr-2 h-4 w-4" /> Matières
            </TabsTrigger>
            <TabsTrigger value="profs" className="px-8 font-bold data-[state=active]:bg-[#C1272D] data-[state=active]:text-white">
              <Users className="mr-2 h-4 w-4" /> Professeurs
            </TabsTrigger>
          </TabsList>

          {/* SECTION PLANNING - DESIGN IDENTIQUE À L'ANCIEN */}
          <TabsContent value="planning" className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-800">Planning Semestre 1 - 2025/2026</h2>
                <p className="text-sm text-slate-500 font-medium">Gestion hebdomadaire</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                {[1, 2, 3, 4].map(w => (
                  <Button 
                    key={w} 
                    onClick={() => setCurrentWeek(w)}
                    className={`h-10 w-12 font-bold ${currentWeek === w ? 'bg-[#C1272D] text-white' : 'bg-transparent text-slate-600 hover:bg-slate-200'}`}
                  >
                    S{w}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start">
              {jours.map(jour => (
                <div key={jour} className="space-y-4">
                  <div className="bg-[#C1272D] text-white text-center py-3 rounded-xl font-black shadow-md uppercase tracking-wider text-sm">
                    {jour}
                  </div>
                  
                  <div className="space-y-4 min-h-[500px]">
                    {seances.filter(s => s.jour === jour && s.semaine === currentWeek).map((s, idx) => {
                      const matiere = cours.find(c => c.id_cours === s.id_cours);
                      const salle = salles.find(sl => sl.id_salle === s.id_salle);
                      const isExamen = s.type_seance === 'examen';

                      return (
                        <Card key={idx} className="border-none shadow-md hover:shadow-lg transition-all rounded-2xl overflow-hidden">
                          <CardContent className={`p-4 ${isExamen ? 'bg-orange-50' : 'bg-blue-50'}`}>
                            <Badge className={`mb-3 uppercase font-black text-[10px] border-none ${isExamen ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'}`}>
                              {isExamen ? 'Examen' : 'Cours'}
                            </Badge>
                            
                            <h3 className="font-black text-slate-800 leading-tight text-sm mb-3">
                              {matiere?.nom_cours} <span className="text-slate-400 font-bold">({matiere?.code_cours})</span>
                            </h3>

                            <div className="space-y-2">
                              <div className="flex items-center text-[11px] font-bold text-slate-600 gap-2">
                                <Clock className="h-3 w-3 text-slate-400" /> {s.heure_debut} - {s.heure_fin}
                              </div>
                              <div className="flex items-center text-[11px] font-bold text-slate-600 gap-2">
                                <MapPin className="h-3 w-3 text-slate-400" /> {salle?.nom_salle || 'Salle non définie'}
                              </div>
                              <div className="flex items-center text-[11px] font-bold text-slate-600 gap-2">
                                <User className="h-3 w-3 text-slate-400" /> Professeur invité
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {seances.filter(s => s.jour === jour && s.semaine === currentWeek).length === 0 && (
                      <div className="border-2 border-dashed rounded-2xl p-8 text-center bg-slate-50/50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Aucun cours</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* SECTION MATIÈRES - AVEC AJOUT/SUPPRESSION */}
          <TabsContent value="cours">
            <Card className="border-none shadow-sm bg-white">
              <CardHeader className="flex flex-row items-center justify-between border-b px-8 py-6">
                <div>
                  <CardTitle className="text-xl font-black">Répertoire des Matières</CardTitle>
                  <p className="text-sm font-medium text-slate-500">Mise à jour du semestre en cours</p>
                </div>
                <Button onClick={handleAddCours} className="bg-blue-600 hover:bg-blue-700 font-bold px-6">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter une matière
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-8 py-4 text-left text-xs font-black text-slate-500 uppercase">Nom complet de la matière</th>
                        <th className="px-8 py-4 text-left text-xs font-black text-slate-500 uppercase">Code de référence</th>
                        <th className="px-8 py-4 text-right text-xs font-black text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {cours.map(c => (
                        <tr key={c.id_cours} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-8 py-5 font-bold text-slate-700">{c.nom_cours}</td>
                          <td className="px-8 py-5 font-mono text-sm text-blue-600 font-bold">{c.code_cours}</td>
                          <td className="px-8 py-5 text-right">
                            <Button 
                              variant="ghost" 
                              onClick={() => handleDeleteCours(c.id_cours)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
