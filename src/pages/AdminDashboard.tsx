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
  const { cours, professeurs, salles, seances, deleteCours, refetch } = useData();
  const [activeTab, setActiveTab] = useState('planning');

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Administration ESGIS</h1>
        <Button variant="ghost" onClick={onLogout} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Déconnexion
        </Button>
      </header>

      <main className="p-6">
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
                <CardTitle>Gestion des Matières</CardTitle>
                <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
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
                      {cours.map((c) => (
                        <tr key={c.id_cours} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-semibold">{c.nom_cours}</td>
                          <td className="p-4 text-muted-foreground">{c.code_cours || 'N/A'}</td>
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Planning (Aperçu rapide) */}
          <TabsContent value="planning">
             <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">Total Matières</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{cours.length}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">Séances prévues</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{seances.length}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">Salles occupées</CardTitle></CardHeader>
                  <CardContent><div className="text-2xl font-bold">{salles.length}</div></CardContent>
                </Card>
             </div>
          </TabsContent>

          {/* Autres onglets (Profs / Salles) - À remplir selon tes besoins */}
          <TabsContent value="profs">
            <Card><CardContent className="pt-6 text-center text-muted-foreground">Liste des professeurs en cours de chargement...</CardContent></Card>
          </TabsContent>
          <TabsContent value="salles">
            <Card><CardContent className="pt-6 text-center text-muted-foreground">Liste des salles disponible dans le DataContext.</CardContent></Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
