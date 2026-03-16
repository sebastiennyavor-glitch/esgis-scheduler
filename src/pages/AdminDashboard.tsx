import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { LogOut, Plus, Trash2, BookOpen, Users, Home, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { cours, professeurs, salles, seances, deleteCours, addCours } = useData();
  const [currentWeek, setCurrentWeek] = useState(1);
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  // Filtrer les séances pour la semaine sélectionnée
  const weekSeances = seances.filter(s => s.semaine === currentWeek);

  const handleDeleteCours = async (id: number) => {
    if (window.confirm("Supprimer cette matière ?")) {
      try {
        await deleteCours(id);
        toast.success("Matière supprimée");
      } catch (error) {
        toast.error("Erreur de suppression");
      }
    }
  };

  const handleAddCours = async () => {
    const nom = window.prompt("Nom de la matière :");
    if (!nom) return;
    const code = window.prompt("Code (ex: INFO101) :") || "";
    try {
      await addCours(nom, code);
      toast.success("Matière ajoutée");
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Rouge comme sur la capture */}
      <header className="bg-[#C1272D] text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider">ESGIS Planning</h1>
            <p className="text-xs opacity-80">Administration</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={onLogout} className="bg-white/10 hover:bg-white/20 border-none text-white">
          <LogOut className="mr-2 h-4 w-4" /> Déconnexion
        </Button>
      </header>

      <main className="p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* Stats Rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-none shadow-sm"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Séances</p><p className="text-2xl font-bold">{seances.length}</p></CardContent></Card>
          <Card className="border-none shadow-sm"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Matières</p><p className="text-2xl font-bold">{cours.length}</p></CardContent></Card>
          <Card className="border-none shadow-sm"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Salles</p><p className="text-2xl font-bold">{salles.length}</p></CardContent></Card>
          <Card className="border-none shadow-sm"><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Profs</p><p className="text-2xl font-bold">{professeurs.length}</p></CardContent></Card>
        </div>

        <Tabs defaultValue="planning" className="space-y-6">
          <TabsList className="bg-white p-1 shadow-sm border">
            <TabsTrigger value="planning" className="data-[state=active]:bg-[#C1272D] data-[state=active]:text-white">Planning</TabsTrigger>
            <TabsTrigger value="cours" className="data-[state=active]:bg-[#C1272D] data-[state=active]:text-white">Matières</TabsTrigger>
            <TabsTrigger value="salles" className="data-[state=active]:bg-[#C1272D] data-[state=active]:text-white">Salles</TabsTrigger>
            <TabsTrigger value="profs" className="data-[state=active]:bg-[#C1272D] data-[state=active]:text-white">Professeurs</TabsTrigger>
          </TabsList>

          {/* CONTENU PLANNING (AVEC LES JOURS) */}
          <TabsContent value="planning" className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
              <h2 className="text-lg font-bold">Semaine {currentWeek}</h2>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(w => (
                  <Button 
                    key={w} 
                    variant={currentWeek === w ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentWeek(w)}
                    className={currentWeek === w ? "bg-[#C1272D]" : ""}
                  >
                    S{w}
                  </Button>
                ))}
              </div>
            </div>

            {/* Grille des Jours */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {jours.map(jour => (
                <div key={jour} className="space-y-3">
                  <div className="bg-[#C1272D] text-white text-center py-2 rounded-md font-bold shadow-sm">
                    {jour}
                  </div>
                  <div className="min-h-[200px] space-y-3">
                    {weekSeances.filter(s => s.jour === jour).length === 0 ? (
                      <div className="text-center py-10 text-xs text-muted-foreground bg-white rounded-lg border border-dashed">
                        Aucun cours
                      </div>
                    ) : (
                      weekSeances.filter(s => s.jour === jour).map((s, idx) => (
                        <Card key={idx} className="border-l-4 border-l-blue-500 shadow-sm overflow-hidden">
                          <CardContent className="p-3">
                            <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Cours</p>
                            <p className="text-sm font-bold leading-tight mb-1">
                              {cours.find(c => c.id_cours === s.id_cours)?.nom_cours || 'Matière'}
                            </p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {s.heure_debut} - {s.heure_fin}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                              {salles.find(sl => sl.id_salle === s.id_salle)?.nom_salle || 'Salle'}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ONGLET MATIÈRES (GARDÉ DE LA VERSION PRÉCÉDENTE) */}
          <TabsContent value="cours">
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <CardTitle>Gestion des Matières</CardTitle>
                <Button onClick={handleAddCours} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-4 text-left">Nom</th>
                      <th className="p-4 text-left">Code</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cours.map(c => (
                      <tr key={c.id_cours} className="border-b">
                        <td className="p-4 font-medium">{c.nom_cours}</td>
                        <td className="p-4 text-muted-foreground">{c.code_cours}</td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCours(c.id_cours)} className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
