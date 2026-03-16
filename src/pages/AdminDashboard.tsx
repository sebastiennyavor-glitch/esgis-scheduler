import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { LogOut, Plus, Trash2, BookOpen, Users, Home, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { cours, professeurs, salles, seances, deleteCours, addCours, refetch } = useData();
  const [activeTab, setActiveTab] = useState('planning');

  // Fonction pour supprimer une matière
  const handleDeleteCours = async (id: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette matière ? Cela peut affecter les séances liées.")) {
      try {
        await deleteCours(id);
        toast.success("Matière supprimée avec succès");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  // Fonction pour ajouter une matière
  const handleAddCours = async () => {
    const nom = window.prompt("Nom de la nouvelle matière (ex: Mathématiques) :");
    if (!nom) return;
    
    const code = window.prompt("Code de la matière (ex: MATH101) :") || "";
    
    try {
      await addCours(nom, code);
      toast.success(`La matière "${nom}" a été ajoutée !`);
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la matière");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Administration ESGIS</h1>
        <Button variant="ghost" onClick={onLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Déconnexion
        </Button>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <Tabs defaultValue="planning" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="planning"><Calendar className="mr-2 h-4 w-4" /> Planning</TabsTrigger>
            <TabsTrigger value="cours"><BookOpen className="mr-2 h-4 w-4" /> Matières</TabsTrigger>
            <TabsTrigger value="profs"><Users className="mr-2 h-4 w-4" /> Profs</TabsTrigger>
            <TabsTrigger value="salles"><Home className="mr-2 h-4 w-4" /> Salles</TabsTrigger>
          </TabsList>

          {/* Onglet Matières (Cours) */}
          <TabsContent value="cours">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestion des Matières</CardTitle>
                  <p className="text-sm text-muted-foreground">Ajoutez ou supprimez les cours pour le nouveau semestre.</p>
                </div>
                <Button onClick={handleAddCours} size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Nouvelle Matière
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-4 text-left font-medium">Nom de la matière</th>
                        <th className="p-4 text-left font-medium">Code</th>
                        <th className="p-4 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cours.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-muted-foreground">
                            Aucune matière trouvée. Cliquez sur "Nouvelle Matière" pour commencer.
                          </td>
                        </tr>
                      ) : (
                        cours.map((c) => (
                          <tr key={c.id_cours} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="p-4 font-semibold">{c.nom_cours}</td>
                            <td className="p-4 text-muted-foreground">{c.code_cours || '---'}</td>
                            <td className="p-4 text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteCours(c.id_cours)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Planning (Stats) */}
          <TabsContent value="planning">
             <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">Matières Actives</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{cours.length}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">Séances au planning</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{seances.length}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">Salles répertoriées</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{salles.length}</div></CardContent>
                </Card>
             </div>
          </TabsContent>

          {/* Autres onglets (À compléter plus tard si besoin) */}
          <TabsContent value="profs">
            <Card><CardContent className="pt-6 text-center text-muted-foreground">Utilisez l'onglet Matières pour gérer les cours du semestre.</CardContent></Card>
          </TabsContent>
          <TabsContent value="salles">
            <Card><CardContent className="pt-6 text-center text-muted-foreground">Liste des salles synchronisée avec la base de données.</CardContent></Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
