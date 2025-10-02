import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter } from 'lucide-react';

interface SubjectFilterProps {
  subjects: string[];
  selectedSubjects: Set<string>;
  onToggle: (subject: string) => void;
}

const SubjectFilter = ({ subjects, selectedSubjects, onToggle }: SubjectFilterProps) => {
  const allSelected = selectedSubjects.size === subjects.length;

  const handleSelectAll = () => {
    subjects.forEach(subject => {
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
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          Filtrer par matière
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b border-border">
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
        </div>
        
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
    </Card>
  );
};

export default SubjectFilter;
