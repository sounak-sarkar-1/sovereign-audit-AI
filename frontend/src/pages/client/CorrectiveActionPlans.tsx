import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ClipboardCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Filter, 
  ChevronRight,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { clientService } from '@/services/clientService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

const CorrectiveActionPlans: React.FC = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: actions, isLoading } = useQuery({
    queryKey: ['corrective-actions'],
    queryFn: () => clientService.getCorrectiveActions(),
  });

  const totalActions = actions?.length || 0;
  const completedActions = actions?.filter((a: any) => a.status === 'completed').length || 0;
  const completionRate = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
      case 'in_progress': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Progress</Badge>;
      case 'completed': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
      case 'verified': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Verified</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return <Badge className="bg-red-100 text-red-700 border-red-200">Critical</Badge>;
      case 'high': return <Badge className="bg-orange-100 text-orange-700 border-orange-200">High</Badge>;
      case 'medium': return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Medium</Badge>;
      default: return <Badge variant="outline">Low</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-24"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Remediation Tracker</h1>
          <p className="text-muted-foreground">Track and manage corrective action plans for your audit findings.</p>
        </div>
        <Button className="rounded-full bg-primary hover:bg-primary/90 gap-2">
          <Plus size={16} /> New Action Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card border-none bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Findings</p>
              <h3 className="text-2xl font-bold text-dark">{totalActions}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-none bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Resolved</p>
              <h3 className="text-2xl font-bold text-dark">{completedActions}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-none bg-white">
          <CardHeader className="p-6 pb-2">
             <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex justify-between">
                Remediation Progress
                <span>{Math.round(completionRate)}%</span>
             </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
             <Progress value={completionRate} className="h-1.5" />
             <div className="mt-2 text-xs flex items-center gap-1 text-green-600 font-bold">
                <TrendingUp size={12} /> +12.5% from last month
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-none bg-white overflow-hidden">
        <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between p-6">
          <CardTitle className="text-lg">Action Plans</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full h-9 gap-2">
              <Filter size={14} /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {actions?.map((action: any) => (
              <div key={action.id} className="p-5 hover:bg-muted/10 transition-colors flex items-center justify-between group">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    action.priority === 'critical' ? "bg-red-50 text-red-600" : "bg-muted/20 text-muted-foreground"
                  )}>
                    <AlertCircle size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-dark">{action.title}</h4>
                      {getPriorityBadge(action.priority)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><ShieldCheck size={12} /> {action.audit?.name}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> Due {format(new Date(action.dueDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {getStatusBadge(action.status)}
                  <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </div>
            ))}
            
            {(!actions || actions.length === 0) && (
              <div className="p-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground mx-auto">
                    <ClipboardCheck size={32} />
                </div>
                <div className="space-y-1">
                    <p className="font-bold text-dark">All clean!</p>
                    <p className="text-sm text-muted-foreground">No corrective action plans currently active.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CorrectiveActionPlans;
