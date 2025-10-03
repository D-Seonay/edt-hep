import { useId, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, ChevronDown, Laptop } from "lucide-react";

interface SubjectFilterProps {
  subjects: string[];
  selectedSubjects: Set<string>;
  onToggle: (subject: string) => void;
  filterDistanciel: boolean;
  onToggleDistanciel: () => void;
  defaultOpen?: boolean;
}

const SubjectFilter = ({
  subjects,
  selectedSubjects,
  onToggle,
  filterDistanciel,
  onToggleDistanciel,
  defaultOpen = false,
}: SubjectFilterProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const contentId = useId();
  const allSelected = selectedSubjects.size === subjects.length;

  const handleSelectAll = () => {
    subjects.forEach((subject) => {
      if (!allSelected && !selectedSubjects.has(subject)) {
        onToggle(subject);
      } else if (allSelected && selectedSubjects.has(subject)) {
        onToggle(subject);
      }
    });
  };

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="pb-3">
        <label className="flex items-center justify-between cursor-pointer">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filtres
          </CardTitle>

          <button
            name="toggle-button"
            aria-expanded={isOpen ? "true" : "false"}
            aria-controls={isOpen ? contentId : undefined}
            onClick={() => setIsOpen((s) => !s)}
            className="p-1 rounded hover:bg-muted transition-transform"
            title={isOpen ? "Fermer les filtres" : "Ouvrir les filtres"}
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </label>
      </CardHeader>

      {/* Collapsible content */}
      {isOpen && (
        <CardContent id={contentId} className="space-y-3">
          {/* Sélecteur distanciel */}
          <div className="flex items-center space-x-2 pb-2 border-b border-border">
            <Checkbox
              id="distanciel"
              checked={filterDistanciel}
              onCheckedChange={onToggleDistanciel}
            />
            <label
              htmlFor="distanciel"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-1"
            >
              <Laptop className="w-4 h-4 text-primary" />
              Cours en distanciel
            </label>
          </div>

          {/* Sélecteur matières */}
          {/* <div className="flex items-center space-x-2 pb-2 border-b border-border">
            <Checkbox
              id="select-all"
              checked={allSelected}
              onCheckedChange={handleSelectAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Tout sélectionner
            </label>
          </div> */}

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {subjects.map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={subject}
                  checked={selectedSubjects.has(subject)}
                  onCheckedChange={() => onToggle(subject)}
                />
                <label
                  htmlFor={subject}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {subject}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SubjectFilter;
