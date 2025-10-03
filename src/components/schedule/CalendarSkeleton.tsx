import React from "react";

const CalendarSkeleton: React.FC = () => {
    const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
    const hours = Array.from({ length: 12 }, (_, i) => 8 + i); // 8h → 20h

    return (
        <>
            {/* Desktop: grid calendar */}
            <div className="hidden sm:grid grid-cols-[80px_repeat(5,1fr)] border rounded-xl overflow-hidden">
                {/* Header */}
                <div className="bg-muted p-2"></div>
                {days.map((day, i) => (
                    <div
                        key={i}
                        className="bg-muted text-center text-sm font-medium p-2 border-l"
                    >
                        <div className="h-5 w-24 mx-auto bg-muted-foreground/20 rounded animate-pulse"></div>
                    </div>
                ))}

                {/* Body */}
                {hours.map((hour, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        {/* Hour column */}
                        <div className="border-t p-2 text-xs text-muted-foreground">
                            {hour}:00
                        </div>
                        {days.map((day, colIndex) => (
                            <div
                                key={colIndex}
                                className="border-t border-l relative p-2 h-20 flex items-center justify-center"
                            >
                                {/* Placeholder cours */}
                                {Math.random() > 0.7 && (
                                    <div className="w-full h-14 rounded-xl bg-muted-foreground/20 animate-pulse"></div>
                                )}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>

            {/* Mobile: list per day */}
            <div className="block sm:hidden space-y-4">
                {days.map((day, dayIndex) => (
                    <div
                        key={dayIndex}
                        className="border rounded-lg overflow-hidden bg-background"
                    >
                        <div className="bg-muted p-3 text-sm font-medium">{day}</div>
                        <div className="divide-y">
                            {hours.map((hour, hourIndex) => (
                                <div
                                    key={hourIndex}
                                    className="flex items-center justify-between p-3 text-xs text-muted-foreground"
                                >
                                    <div className="w-14">{hour}:00</div>
                                    <div className="flex-1 pl-4">
                                        <div className="h-8 rounded-md bg-muted-foreground/20 animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default CalendarSkeleton;
