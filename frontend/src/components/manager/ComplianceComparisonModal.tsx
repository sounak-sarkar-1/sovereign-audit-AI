import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus, Info, Calendar } from 'lucide-react';
import { auditService } from '@/services/auditService';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ComplianceComparisonModalProps {
  auditId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ComplianceComparisonModal: React.FC<ComplianceComparisonModalProps> = ({
  auditId,
  open,
  onOpenChange,
}) => {
  const { data: comparison, isLoading } = useQuery({
    queryKey: ['compliance-comparison', auditId],
    queryFn: () => auditService.getComplianceComparison(auditId),
    enabled: open,
  });

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary/20 border-t-primary"></div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!comparison || !comparison.hasPrevious) return null;

  const delta = comparison.delta;
  const isPositive = delta && delta > 0;
  const isNegative = delta && delta < 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Info size={20} />
             </div>
             Compliance Performance Comparison
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 bg-muted/20 rounded-2xl border border-muted/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <Calendar size={40} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Previous Engagement</p>
              <p className="text-sm font-bold text-dark truncate leading-tight">{comparison.previous.auditName}</p>
              <div className="flex items-center gap-2 mt-2">
                 <span className="text-3xl font-black text-dark/40 italic">{comparison.previous.compliancePercentage?.toFixed(1) || '0.0'}%</span>
                 <Badge variant="outline" className="text-[9px] font-bold h-5 rounded-full border-muted/30">
                    {comparison.previous.reportDate ? format(new Date(comparison.previous.reportDate), 'MMM yyyy') : 'N/A'}
                 </Badge>
              </div>
            </div>

            <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <Calendar size={40} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Current Engagement</p>
              <p className="text-sm font-bold text-dark truncate leading-tight">{comparison.current.auditName}</p>
              <div className="flex items-center gap-2 mt-2">
                 <span className="text-3xl font-black text-primary">{comparison.current.compliancePercentage?.toFixed(1) || '0.0'}%</span>
                 <Badge className="bg-primary/20 text-primary border-none text-[9px] font-bold h-5 rounded-full">
                    LATEST
                 </Badge>
              </div>
            </div>

            <div className={cn(
              "p-5 rounded-2xl border flex flex-col justify-center relative overflow-hidden group shadow-sm",
              isPositive ? "bg-emerald-50/50 border-emerald-200" : 
              isNegative ? "bg-red-50/50 border-red-200" : 
              "bg-muted/10 border-muted/20"
            )}>
              {isPositive && <div className="absolute top-[-10px] right-[-10px] opacity-10 rotate-12"><ArrowUp size={80} /></div>}
              {isNegative && <div className="absolute top-[-10px] right-[-10px] opacity-10 rotate-12"><ArrowDown size={80} /></div>}
              
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Performance Delta</p>
              <div className="flex items-center gap-3 relative z-10">
                <span className={cn(
                  "text-4xl font-black tracking-tighter",
                  isPositive ? "text-emerald-600" : 
                  isNegative ? "text-red-600" : 
                  "text-dark/40"
                )}>
                  {delta ? (delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)) : '0.0'}%
                </span>
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    isPositive ? "bg-emerald-500 text-white" : 
                    isNegative ? "bg-red-500 text-white" : 
                    "bg-muted text-muted-foreground"
                )}>
                    {isPositive ? <ArrowUp size={18} /> : isNegative ? <ArrowDown size={18} /> : <Minus size={18} />}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="rounded-2xl border border-muted/10 overflow-hidden shadow-sm bg-white">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-muted/10">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 pl-6 text-muted-foreground">Scope Control Item</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-center py-4 text-muted-foreground">Prev. Score</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-center py-4 text-muted-foreground">Curr. Score</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right py-4 pr-6 text-muted-foreground">Compliance Shift</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparison.lineItemComparison.map((item: any, i: number) => (
                  <TableRow key={i} className="border-muted/10 hover:bg-muted/5 transition-colors">
                    <TableCell className="font-bold text-[13px] text-dark py-5 pl-6">
                      {item.itemName}
                      <p className="text-[9px] font-medium text-muted-foreground/60 mt-0.5 uppercase tracking-tighter">Weightage: {item.currentWeightage}%</p>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className="w-8 h-8 rounded-lg bg-muted/20 flex items-center justify-center mx-auto text-xs font-bold text-muted-foreground/50 border border-muted/10 italic">
                          {item.previousScore || '--'}
                       </span>
                    </TableCell>
                    <TableCell className="text-center">
                       <span className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center mx-auto text-xs font-black border shadow-sm",
                          item.currentScore ? "bg-white text-dark border-muted/20" : "bg-muted/10 text-muted-foreground/30 border-transparent"
                       )}>
                          {item.currentScore || '--'}
                       </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                       <div className="flex items-center justify-end gap-2">
                          {item.scoreDelta !== null ? (
                            <>
                               <span className={cn(
                                 "text-[13px] font-black",
                                 item.scoreDelta > 0 ? "text-emerald-600" : 
                                 item.scoreDelta < 0 ? "text-red-600" : 
                                 "text-dark/30"
                               )}>
                                  {item.scoreDelta > 0 ? `+${item.scoreDelta}` : item.scoreDelta === 0 ? '0' : item.scoreDelta}
                               </span>
                               <div className={cn(
                                   "w-5 h-5 rounded-full flex items-center justify-center shadow-sm",
                                   item.scoreDelta > 0 ? "bg-emerald-100 text-emerald-700" : 
                                   item.scoreDelta < 0 ? "bg-red-100 text-red-700" : 
                                   "bg-muted/30 text-dark/20"
                               )}>
                                  {item.scoreDelta > 0 ? <ArrowUp size={12} /> : 
                                   item.scoreDelta < 0 ? <ArrowDown size={12} /> : 
                                   <Minus size={12} />}
                               </div>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest opacity-40 px-2 h-5 rounded-full border-muted/30 bg-muted/5">
                               {item.previousScore === null ? 'NEW CONTROL' : 'N/A'}
                            </Badge>
                          )}
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComplianceComparisonModal;
