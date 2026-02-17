import { cn } from '@/lib/utils';

interface WeekNavigationProps {
  currentWeek: 1 | 2 | 3 | 4;
  onWeekChange: (week: 1 | 2 | 3 | 4) => void;
}

const WeekNavigation = ({ currentWeek, onWeekChange }: WeekNavigationProps) => {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted p-1">
      {([1, 2, 3, 4] as const).map((week) => (
        <button
          key={week}
          onClick={() => onWeekChange(week)}
          className={cn(
            'rounded-md px-4 py-2 font-heading text-sm font-semibold transition-all duration-200',
            currentWeek === week
              ? 'gradient-esgis text-primary-foreground shadow-esgis'
              : 'text-muted-foreground hover:bg-card hover:text-foreground'
          )}
        >
          Semaine {week}
        </button>
      ))}
    </div>
  );
};

export default WeekNavigation;
