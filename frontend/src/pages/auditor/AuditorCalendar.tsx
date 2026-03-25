import React from 'react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  isToday,
  startOfDay,
  endOfDay,
  isWithinInterval
} from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuditorCalendarProps {
  audits: any[];
}

const AuditorCalendar: React.FC<AuditorCalendarProps> = ({ audits }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));

  const getDayEvents = (day: Date) => {
    return audits?.filter(audit => {
      const start = startOfDay(new Date(audit.startDate));
      const end = endOfDay(new Date(audit.endDate));
      return isWithinInterval(day, { start, end });
    }) || [];
  };

  const getDeadlines = (day: Date) => {
    return audits?.filter(audit => isSameDay(day, new Date(audit.endDate))) || [];
  };

  return (
    <Card className="border-none shadow-card rounded-xl overflow-hidden bg-white dark:bg-[#1a0d35]">
      <CardContent className="p-0">
        <div className="p-4 border-b flex items-center justify-between bg-bg-warm/30 dark:bg-[#261840]">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-primary size-5" />
            <h3 className="font-bold text-dark dark:text-white">
              {format(startDate, 'MMMM d')} - {format(weekDays[6], 'MMMM d, yyyy')}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
              <ChevronLeft size={18} />
            </Button>
            <Button variant="secondary" size="sm" className="h-8 px-3 text-xs font-bold" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 divide-x divide-bg-mid dark:divide-[#3d2a5a] border-b">
          {weekDays.map((day, i) => (
            <div 
              key={i} 
              className={cn(
                "p-3 text-center transition-colors",
                isToday(day) && "bg-primary/5 dark:bg-accent/5"
              )}
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-bg-muted mb-1">
                {format(day, 'EEE')}
              </p>
              <p className={cn(
                "text-lg font-black w-8 h-8 flex items-center justify-center mx-auto rounded-full transition-all",
                isToday(day) ? "bg-primary text-white shadow-card" : "text-dark dark:text-bg-mid"
              )}>
                {format(day, 'd')}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 divide-x divide-bg-mid dark:divide-[#3d2a5a] min-h-[400px]">
          {weekDays.map((day, i) => {
            const events = getDayEvents(day);
            const deadlines = getDeadlines(day);
            
            return (
              <div 
                key={i} 
                className={cn(
                  "p-2 space-y-2 transition-colors",
                  isToday(day) && "bg-primary/[0.02] dark:bg-accent/[0.02]"
                )}
              >
                {deadlines.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[8px] font-black text-red-500 uppercase tracking-tighter mb-1 flex items-center gap-1">
                      <Clock size={8} /> Deadlines
                    </p>
                    {deadlines.map(d => (
                      <div key={d.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-1.5 mb-1 cursor-pointer hover:shadow-sm">
                        <p className="text-[9px] font-bold text-red-700 dark:text-red-400 leading-tight line-clamp-2">{d.name}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  {events.length > 0 && <p className="text-[8px] font-black text-bg-muted uppercase tracking-tighter mb-1">Engagements</p>}
                  {events.filter(e => !deadlines.some(d => d.id === e.id)).map(e => (
                    <div 
                      key={e.id} 
                      className="bg-bg-warm/50 dark:bg-[#261840] border border-bg-mid dark:border-[#3d2a5a] rounded-lg p-2 mb-1.5 cursor-pointer hover:bg-white dark:hover:bg-[#2d1f45] hover:shadow-card transition-all"
                    >
                      <p className="text-[10px] font-bold text-dark dark:text-bg-mid leading-tight line-clamp-2">{e.name}</p>
                      <div className="flex items-center gap-1 mt-1.5 overflow-hidden">
                        <div className="flex-1 h-0.5 bg-bg-mid dark:bg-[#3d2a5a] rounded-full">
                          <div 
                            className="h-full bg-accent rounded-full" 
                            style={{ width: `${e.stats.completionPercent}%` }} 
                          />
                        </div>
                        <span className="text-[8px] font-black text-bg-muted">{e.stats.completionPercent}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {events.length === 0 && deadlines.length === 0 && (
                  <div className="h-full flex items-center justify-center opacity-20 pointer-events-none">
                     <div className="w-1 h-1 rounded-full bg-bg-muted" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditorCalendar;
