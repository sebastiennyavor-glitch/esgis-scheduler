import { Seance } from '@/types';
import SessionCard from './SessionCard';

interface ScheduleGridProps {
  seances: Seance[];
  showPole?: boolean;
  showRole?: boolean;
  profId?: number;
  onDeleteSeance?: (id: number) => void;
}

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const JOUR_MAP: Record<number, string> = { 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi' };

const ScheduleGrid = ({ seances, showPole = false, showRole = false, profId, onDeleteSeance }: ScheduleGridProps) => {
  const getJour = (date: string) => {
    const d = new Date(date);
    const day = d.getDay();
    return JOUR_MAP[day] || '';
  };

  const seancesByJour = JOURS.map(jour => ({
    jour,
    seances: seances
      .filter(s => getJour(s.date) === jour)
      .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut)),
  }));

  const hasAny = seancesByJour.some(j => j.seances.length > 0);

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
        <p className="font-heading text-lg font-semibold text-muted-foreground">Aucune séance cette semaine</p>
        <p className="text-sm text-muted-foreground">Sélectionnez une autre semaine</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {seancesByJour.map(({ jour, seances: jourSeances }) => (
        <div key={jour} className="space-y-3">
          <div className="sticky top-0 z-10 rounded-lg bg-primary px-3 py-2 text-center">
            <span className="font-heading text-sm font-bold text-primary-foreground">{jour}</span>
          </div>
          {jourSeances.length > 0 ? (
            <div className="space-y-2">
              {jourSeances.map(seance => (
                <SessionCard
                  key={seance.id_seance}
                  seance={seance}
                  showPole={showPole}
                  showRole={showRole}
                  profId={profId}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              —
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ScheduleGrid;
