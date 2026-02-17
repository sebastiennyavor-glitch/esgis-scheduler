import { Seance, TypeSeance } from '@/types';
import { cours, salles, professeurs } from '@/data/mockData';
import { MapPin, Clock, User, BookOpen, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionCardProps {
  seance: Seance;
  showPole?: boolean;
  showRole?: boolean;
  profId?: number;
}

const SessionCard = ({ seance, showPole = false, showRole = false, profId }: SessionCardProps) => {
  const coursInfo = cours.find(c => c.id_cours === seance.id_cours);
  const salleInfo = salles.find(s => s.id_salle === seance.id_salle);
  const isCours = seance.type_seance === 'cours';
  const profRole = profId ? seance.professeurs.find(p => p.id_prof === profId)?.role : undefined;

  const sessionProfs = seance.professeurs.map(sp => {
    const prof = professeurs.find(p => p.id_prof === sp.id_prof);
    return { ...sp, prof };
  });

  return (
    <div className={cn(
      'rounded-lg p-4 transition-all duration-200 hover:shadow-md animate-fade-in',
      isCours ? 'session-cours' : 'session-examen'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
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
          </div>

          <h4 className="font-heading text-sm font-bold text-foreground">
            {coursInfo?.nom_cours}
            <span className="ml-2 text-xs font-normal text-muted-foreground">({coursInfo?.code_cours})</span>
          </h4>

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
