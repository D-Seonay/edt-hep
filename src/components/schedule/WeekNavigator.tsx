import { Button } from '@/lib';
import { ChevronLeft, ChevronRight, Ban } from 'lucide-react';

interface WeekNavigatorProps {
  currentWeek: number; // Semaine affichée actuellement (0 = cette semaine)
  onPrevious: () => void; // Callback pour passer à la semaine précédente
  onNext: () => void; // Callback pour passer à la semaine suivante
  onToday: () => void; // Callback pour revenir à la semaine actuelle
}

const WeekNavigator = ({ currentWeek, onPrevious, onNext, onToday }: WeekNavigatorProps) => {
  // Génère le libellé à afficher selon la semaine
  const getWeekLabel = () => {
    if (currentWeek === 0) return "Cette semaine";
    if (currentWeek === 1) return "Semaine prochaine";
    if (currentWeek === -1) return "Semaine dernière";
    return currentWeek > 0 ? `Dans ${currentWeek} semaines` : `Il y a ${Math.abs(currentWeek)} semaines`;
  };

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Navigation précédente / suivante */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            onPrevious();
          }}
          className="h-10 w-10 rounded-xl shadow-soft hover:shadow-card transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        {/* Label indiquant la semaine actuelle */}
        <div className="px-4 py-2 bg-card rounded-xl shadow-soft border border-border/50 min-w-[180px] text-center">
          <span className="text-sm font-medium text-foreground">
            {getWeekLabel()}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            onNext();
          }}
          className="h-10 w-10 rounded-xl shadow-soft hover:shadow-card transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Bouton "Aujourd'hui" si on n'est pas sur la semaine actuelle */}
      {currentWeek !== 0 && (
        <Button
          variant="outline"
          onClick={() => {
            onToday();
          }}
          className="h-10 px-4 rounded-xl shadow-soft hover:shadow-card transition-all"
        >
          <Ban className="h-4 w-4" />
          <span className=" md:inline-block hidden ml-2">Aujourd'hui</span>
        </Button>
      )}
    </div>
  );
};

export default WeekNavigator;
