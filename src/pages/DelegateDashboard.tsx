import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import WeekNavigation from '@/components/WeekNavigation';
import ScheduleGrid from '@/components/ScheduleGrid';
import { LogOut, CalendarDays, Printer, MapPin, Loader2 } from 'lucide-react';

interface DelegateDashboardProps {
  delegueId: number;
  onLogout: () => void;
}

const DelegateDashboard = ({ delegueId, onLogout }: DelegateDashboardProps) => {
  const { seances, delegues, salles, loading } = useData();
  const [currentWeek, setCurrentWeek] = useState<1 | 2 | 3 | 4>(1);
  const delegue = delegues.find(d => d.id_delegue === delegueId);
  const salle = salles.find(s => s.id_salle === delegue?.id_salle);

  const salleSeances = seances.filter(
    s => s.semaine === currentWeek && s.id_salle === delegue?.id_salle
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-esgis shadow-esgis print:hidden">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-7 w-7 text-primary-foreground" />
            <div>
              <h1 className="font-heading text-lg font-black text-primary-foreground">ESGIS Planning</h1>
              <p className="text-xs text-primary-foreground/80">Espace Délégué</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary-foreground/20">
            <LogOut className="h-4 w-4" /> Quitter
          </button>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-gold">
              <MapPin className="h-7 w-7 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">{salle?.nom_salle}</h2>
              <p className="text-sm text-muted-foreground">
                Pôle ESGIS {salle?.pole} · {salle?.capacite} places · Délégué : {delegue?.prenom} {delegue?.nom}
              </p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-heading text-sm font-semibold text-foreground transition hover:bg-muted print:hidden"
          >
            <Printer className="h-4 w-4" /> Imprimer
          </button>
        </div>

        <div className="print:hidden">
          <WeekNavigation currentWeek={currentWeek} onWeekChange={setCurrentWeek} />
        </div>

        <div className="hidden print:block mb-4">
          <h1 className="font-heading text-xl font-black text-center">ESGIS — {salle?.nom_salle} · Pôle {salle?.pole}</h1>
          <p className="text-center text-sm">Semaine {currentWeek}</p>
        </div>

        <ScheduleGrid seances={salleSeances} showPole />
      </main>
    </div>
  );
};

export default DelegateDashboard;
