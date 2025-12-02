// components/schedule/CourseBlock.tsx
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CourseBlockProps } from "@/types/schedule";
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
  const bg = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.18)`;
  const border = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.35)`;
  return { bg, border };
}

const CourseBlock = ({
  course,
  viewMode = "week",
  style,
  onClick,
}: CourseBlockProps & { onClick?: () => void }) => {
  const { bg, border } = getCourseColors(course.subject);
  const roomInfo = getRoomInfo(course.room);

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "relative rounded-xl cursor-pointer transition-all backdrop-blur-md shadow-sm overflow-hidden h-full box-border",
        viewMode === "month"
          ? "p-2 text-xs h-auto"
          : "p-2.5 text-sm min-h-[36px]"
      )}
      style={{
        ...style,
        background: bg,
        border: `1px solid ${border}`,
      }}
    >
      <h4 className="font-semibold text-foreground">{course.subject}</h4>

      {viewMode !== "month" && (
        <div className="mt-1 space-y-1 text-xs text-muted-foreground">
          <div className="text-[11px] text-muted-foreground leading-tight">
            <span>
              {course.start} – {course.end}
            </span>
            
            {course.room && (
              <>
                {" • "}
                <span className={cn(roomInfo.isError && "text-red-600 dark:text-red-400 font-medium")}>
                  {roomInfo.icon} {roomInfo.text === "Distanciel" ? "" : roomInfo.text}
                </span>
              </>
            )}
          </div>

          {course.teacher && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" /> {course.teacher}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default CourseBlock;