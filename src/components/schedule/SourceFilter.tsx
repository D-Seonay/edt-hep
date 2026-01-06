import { useId, useState } from "react";
import { Checkbox, Card, CardContent, CardHeader, CardTitle } from "@/lib";
import { Calendar } from "lucide-react";
import type { SourceFilterProps } from "@/types/schedule";

const SourceFilter = ({
  sources,
  selectedSources,
  onToggle,
}: SourceFilterProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const contentId = useId();

  return (
    <Card className="shadow-card border-border/50">
      <CardHeader className="pb-3">
        <label className="flex items-center justify-between cursor-pointer">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Calendriers
          </CardTitle>
        </label>
      </CardHeader>

      {isOpen && (
        <CardContent id={contentId} className="space-y-3">
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {sources.map((source) => (
              <div key={source} className="flex items-center space-x-2">
                <Checkbox
                  id={source}
                  checked={selectedSources.has(source)}
                  onCheckedChange={() => onToggle(source)}
                />
                <label
                  htmlFor={source}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {source}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SourceFilter;
