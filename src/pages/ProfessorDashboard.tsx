import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import WeekNavigation from '@/components/WeekNavigation';
import ScheduleGrid from '@/components/ScheduleGrid';
import ProfessorAvailability from '@/components/ProfessorAvailability';
import { LogOut, CalendarDays, User, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfessorDashboardProps {
  profId: number;
  onLogout: () => void;
}

type ProfTab = 'planning' | 'disponibilites';

const ProfessorDashboard = ({ profId, onLogout }: ProfessorDashboardProps) => {
  const { seances, professeurs, loading } = useData();
  const [currentWeek, setCurrentWeek] = useState<1 | 2 | 3 | 4>(1);
  const [activeTab, setActiveTab] = useState<ProfTab>('planning');
  const prof = professeurs.find(p => p.id_prof === profId);

  const profSeances = seances.filter(
    s => s.semaine === currentWeek && s.professeurs.some(sp => sp.id_prof === profId)
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tabs: { key: ProfTab; label: string; icon: any }[] = [
    { key: 'planning', label: 'Mon planning', icon: CalendarDays },
    { key: 'disponibilites', label: 'Mes disponibilités', icon: Clock },
  ];

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
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-esgis">
            <User className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">{prof?.prenom} {prof?.nom}</h2>
            <p className="text-sm text-muted-foreground">{prof?.specialite} · {prof?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition',
                  activeTab === tab.key
                    ? 'gradient-esgis text-primary-foreground shadow'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'planning' && (
          <>
            <div className="flex items-center gap-2 rounded-lg bg-esgis-gold-light p-3 text-sm">
              <span className="font-heading text-xs font-bold text-secondary-foreground">
                💡 Les badges <span className="text-esgis-cours">bleu</span> = cours · <span className="text-esgis-examen">orange</span> = examen/surveillance
              </span>
            </div>
            <WeekNavigation currentWeek={currentWeek} onWeekChange={setCurrentWeek} />
            <ScheduleGrid seances={profSeances} showPole showRole profId={profId} />
          </>
        )}

        {activeTab === 'disponibilites' && (
          <ProfessorAvailability profId={profId} />
        )}
      </main>
    </div>
  );
};

export default ProfessorDashboard;
