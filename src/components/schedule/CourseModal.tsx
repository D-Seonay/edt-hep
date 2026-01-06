import { useEffect, useRef } from "react";
import { Clock, User, X, Calendar } from "lucide-react"; // MapPin retiré, remplacé par la logique emoji
import { CourseModalProps } from "@/types/schedule";
import { cn } from "@/lib/utils";
import getRoomInfo from "@/utils/scheduleUtils";


function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function getCourseColors(subject: string) {
  const hue = hashString(subject) % 360;
  const saturation = 70; 
  const lightness = 50;
  
  // La couleur de fond 'bg' n'est plus utilisée pour le fond de la modale,
  // mais peut servir pour d'autres accents si besoin.
  const bg = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.1)`;
  // Bordure plus visible pour un meilleur accent visuel.
  const border = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.5)`; 
  
  return { bg, border, hue };
}

const CourseModal = ({ course, isOpen, onClose }: CourseModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !course) return null;

  const { border } = getCourseColors(course.subject);
  const roomInfo = getRoomInfo(course.room);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-background dark:bg-card"
        style={{ 
            // Le fond est maintenant géré par `bg-background dark:bg-card` pour une lisibilité maximale.
            // On garde seulement la bordure et l'ombre colorées.
            border: `1px solid ${border}`,
            boxShadow: `0 0 40px -10px ${border}`
        }}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Titre */}
          <h2 className="text-xl font-bold mb-6 text-foreground pr-8 leading-tight">
            {course.subject}
          </h2>

          <div className="space-y-4">
            {/* Horaire */}
            <div className="flex items-center gap-3 text-foreground/80">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Horaire</p>
                <p className="font-semibold text-sm">
                    {course.start} - {course.end}
                </p>
              </div>
            </div>

            {/* Salle (Avec logique d'erreur) */}
            <div className="flex items-center gap-3 text-foreground/80">
              <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow-sm",
                  roomInfo.isError ? "bg-red-100 dark:bg-red-900/30" : "bg-background dark:bg-white/5"
              )}>
                {roomInfo.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Lieu</p>
                <p className={cn(
                    "font-semibold text-sm",
                    roomInfo.isError ? "text-red-600 dark:text-red-400" : ""
                )}>
                  {roomInfo.text}
                </p>
              </div>
            </div>

            {/* Professeur */}
            {course.teacher && (
              <div className="flex items-center gap-3 text-foreground/80">
                 <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <User className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Enseignant</p>
                    <p className="font-semibold text-sm">{course.teacher}</p>
                </div>
              </div>
            )}

            {/* Source */}
            {course.source && (
              <div className="flex items-center gap-3 text-foreground/80">
                <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Calendrier</p>
                  <p className="font-semibold text-sm">{course.source}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer décoratif ou info supplémentaire */}
        <div className="px-6 py-3 bg-muted/30 border-t border-border/10 text-xs text-muted-foreground flex justify-between">
            {roomInfo.isError && (
                <span className="flex items-center gap-1 text-red-500">
                    ⚠️ Donnée incomplète
                </span>
            )}
        </div>
      </div>
    </div>
  );
};

export default CourseModal;