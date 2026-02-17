import { useState } from 'react';
import { seances, professeurs } from '@/data/mockData';
import WeekNavigation from '@/components/WeekNavigation';
import ScheduleGrid from '@/components/ScheduleGrid';
import { LogOut, CalendarDays, User } from 'lucide-react';

interface ProfessorDashboardProps {
  profId: number;
  onLogout: () => void;
}

const ProfessorDashboard = ({ profId, onLogout }: ProfessorDashboardProps) => {
  const [currentWeek, setCurrentWeek] = useState<1 | 2 | 3 | 4>(1);
  const prof = professeurs.find(p => p.id_prof === profId);

  const profSeances = seances.filter(
    s => s.semaine === currentWeek && s.professeurs.some(sp => sp.id_prof === profId)
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-esgis shadow-esgis">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-7 w-7 text-primary-foreground" />
            <div>
              <h1 className="font-heading text-lg font-black text-primary-foreground">ESGIS Planning</h1>
              <p className="text-xs text-primary-foreground/80">Espace Professeur</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary-foreground/20">
            <LogOut className="h-4 w-4" /> Quitter
          </button>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-6">
        {/* Prof info */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-esgis">
            <User className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">{prof?.prenom} {prof?.nom}</h2>
            <p className="text-sm text-muted-foreground">{prof?.specialite} · {prof?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-esgis-gold-light p-3 text-sm">
          <span className="font-heading text-xs font-bold text-secondary-foreground">
            💡 Les badges <span className="text-esgis-cours">bleu</span> = cours · <span className="text-esgis-examen">orange</span> = examen/surveillance
          </span>
        </div>

        <WeekNavigation currentWeek={currentWeek} onWeekChange={setCurrentWeek} />
        <ScheduleGrid seances={profSeances} showPole showRole profId={profId} />
      </main>
    </div>
  );
};

export default ProfessorDashboard;
