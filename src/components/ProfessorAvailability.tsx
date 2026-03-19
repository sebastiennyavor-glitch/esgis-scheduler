import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Disponibilite } from '@/types';
import { Check, X, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const CRENEAUX = [
  { label: '08h - 10h', debut: '08:00', fin: '10:00' },
  { label: '10h - 12h', debut: '10:00', fin: '12:00' },
  { label: '14h - 16h', debut: '14:00', fin: '16:00' },
  { label: '16h - 18h', debut: '16:00', fin: '18:00' },
  { label: '19h - 21h30', debut: '19:00', fin: '21:30' },
];

interface Props {
  profId: number;
}

const ProfessorAvailability = ({ profId }: Props) => {
  const { disponibilites, saveDisponibilites } = useData();
  const [grid, setGrid] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const key = (jour: string, debut: string) => `${jour}__${debut}`;

  useEffect(() => {
    const profDispos = disponibilites.filter(d => d.id_prof === profId);
    const newGrid: Record<string, boolean> = {};
    for (const d of profDispos) {
      newGrid[key(d.jour, d.heure_debut)] = d.disponible;
    }
    setGrid(newGrid);
  }, [disponibilites, profId]);

  const toggle = (jour: string, debut: string) => {
    const k = key(jour, debut);
    setGrid(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dispos: Omit<Disponibilite, 'id'>[] = [];
      for (const jour of JOURS) {
        for (const cr of CRENEAUX) {
          const k = key(jour, cr.debut);
          dispos.push({
            id_prof: profId,
            jour,
            heure_debut: cr.debut,
            heure_fin: cr.fin,
            disponible: !!grid[k],
          });
        }
      }
      await saveDisponibilites(profId, dispos);
      toast.success('Disponibilités sauvegardées !');
    } catch (err: any) {
      toast.error(`Erreur: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-foreground">Mes disponibilités</h3>
          <p className="text-xs text-muted-foreground">Cochez les créneaux où vous êtes disponible</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg gradient-esgis px-4 py-2 font-heading text-sm font-bold text-primary-foreground shadow-esgis disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Sauvegarder</>}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Créneau</th>
              {JOURS.map(j => (
                <th key={j} className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground">{j}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {CRENEAUX.map(cr => (
              <tr key={cr.debut}>
                <td className="px-3 py-3 font-mono text-xs font-semibold text-foreground whitespace-nowrap">{cr.label}</td>
                {JOURS.map(jour => {
                  const k = key(jour, cr.debut);
                  const isAvailable = !!grid[k];
                  return (
                    <td key={jour} className="px-3 py-3 text-center">
                      <button
                        onClick={() => toggle(jour, cr.debut)}
                        className={cn(
                          'flex mx-auto h-10 w-10 items-center justify-center rounded-lg transition-all',
                          isAvailable
                            ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30 border border-green-500/30'
                            : 'bg-destructive/10 text-destructive/60 hover:bg-destructive/20 border border-destructive/20'
                        )}
                      >
                        {isAvailable ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-green-500/20 border border-green-500/30" /> Disponible</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-destructive/10 border border-destructive/20" /> Non disponible</span>
      </div>
    </div>
  );
};

export default ProfessorAvailability;
