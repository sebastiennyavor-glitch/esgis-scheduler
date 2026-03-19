import { Seance } from '@/types';
import { useData } from '@/contexts/DataContext';
import { MapPin, Clock, User, BookOpen, FileText, CheckCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionCardProps {
  seance: Seance;
  showPole?: boolean;
  showRole?: boolean;
  profId?: number;
  onDelete?: () => void;
}

const SessionCard = ({ seance, showPole = false, showRole = false, profId, onDelete }: SessionCardProps) => {
  const { cours, salles, professeurs, seances } = useData();
  const coursInfo = cours.find(c => c.id_cours === seance.id_cours);
  const salleInfo = salles.find(s => s.id_salle === seance.id_salle);
  const isCours = seance.type_seance === 'cours';
  const profRole = profId ? seance.professeurs.find(p => p.id_prof === profId)?.role : undefined;

  const sessionProfs = seance.professeurs.map(sp => {
    const prof = professeurs.find(p => p.id_prof === sp.id_prof);
    return { ...sp, prof };
  });

  // Calculate hours done for this cours
  const heuresTotal = coursInfo?.heures_total || 0;
  const allSeancesForCours = seances.filter(s => s.id_cours === seance.id_cours);
  const heuresEffectuees = allSeancesForCours.reduce((sum, s) => {
    const [hd, md] = s.heure_debut.split(':').map(Number);
    const [hf, mf] = s.heure_fin.split(':').map(Number);
    return sum + (hf + mf / 60) - (hd + md / 60);
  }, 0);
  const heuresEffRounded = Math.round(heuresEffectuees * 10) / 10;
  const isTermine = heuresTotal > 0 && heuresEffRounded >= heuresTotal;
  const progressPct = heuresTotal > 0 ? Math.min(100, (heuresEffRounded / heuresTotal) * 100) : 0;

  return (
    <div className={cn(
      'rounded-lg p-4 transition-all duration-200 hover:shadow-md animate-fade-in',
      isCours ? 'session-cours' : 'session-examen'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {isCours ? (
              <BookOpen className="h-4 w-4 text-esgis-cours" />
            ) : (
              <FileText className="h-4 w-4 text-esgis-examen" />
            )}
            <span className={cn(
              'rounded-full px-2 py-0.5 font-heading text-xs font-bold uppercase',
              isCours ? 'bg-esgis-cours text-primary-foreground' : 'bg-esgis-examen text-primary-foreground'
            )}>
              {isCours ? 'Cours' : 'Examen'}
            </span>
            {showRole && profRole && (
              <span className={cn(
                'rounded-full px-2 py-0.5 text-xs font-semibold',
                profRole === 'enseignant' ? 'bg-esgis-cours text-primary-foreground' : 'bg-esgis-examen text-primary-foreground'
              )}>
                {profRole === 'enseignant' ? 'Enseignant' : 'Surveillant'}
              </span>
            )}
            {isTermine && (
              <span className="flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-primary-foreground">
                <CheckCircle className="h-3 w-3" /> Terminé
              </span>
            )}
          </div>

          <h4 className="font-heading text-sm font-bold text-foreground">
            {coursInfo?.nom_cours}
            <span className="ml-2 text-xs font-normal text-muted-foreground">({coursInfo?.code_cours})</span>
          </h4>

          {heuresTotal > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{heuresEffRounded}h / {heuresTotal}h</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    isTermine ? 'bg-green-500' : 'bg-primary'
                  )}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {seance.heure_debut} - {seance.heure_fin}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {salleInfo?.nom_salle}
            </span>
          </div>

          {showPole && salleInfo && (
            <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-esgis-gold-light px-2 py-1">
              <MapPin className="h-3 w-3 text-esgis-gold" />
              <span className="font-heading text-xs font-bold text-secondary-foreground">
                Pôle ESGIS {salleInfo.pole}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {sessionProfs.map(sp => (
              <span key={sp.id_prof} className="flex items-center gap-1 rounded-md bg-card px-2 py-0.5 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                {sp.prof?.prenom} {sp.prof?.nom}
                {sp.role === 'surveillant' && ' (Surv.)'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
