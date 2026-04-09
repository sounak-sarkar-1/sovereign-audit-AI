import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ClipboardList, 
  Activity,
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar as CalendarIcon,
  MessageSquare,
  Sparkles,
  BarChart3,
  ListChecks
} from 'lucide-react';
import { auditorService } from '@/services/auditorService';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuditorCalendar from './AuditorCalendar';
import ExceptionWorkspace from './ExceptionWorkspace';
import SituationalResearch from './SituationalResearch';
import AuditorChat from './AuditorChat';
import AuditorPerformance from './AuditorPerformance';
import AuditorSelfAssessment from './AuditorSelfAssessment';

const AuditorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: audits, isLoading } = useQuery({
    queryKey: ['auditor-audits'],
    queryFn: () => auditorService.getAudits(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">Auditor Command Center</h1>
          <p className="text-muted-foreground">Manage your assignments and track upcoming deadlines.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white dark:bg-[#1a0d35] p-6 rounded-xl border border-bg-mid dark:border-[#3d2a5a] shadow-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Assigned</p>
              <h3 className="text-3xl font-bold text-dark dark:text-white">{audits?.length || 0}</h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <ClipboardList size={20} />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 font-medium">Audit engagements currently on your desk</p>
        </div>

        <div className="bg-white dark:bg-[#1a0d35] p-6 rounded-xl border border-bg-mid dark:border-[#3d2a5a] shadow-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">In Progress</p>
              <h3 className="text-3xl font-bold text-dark dark:text-white">
                {audits?.filter((a: any) => a.status === 'in_progress').length || 0}
              </h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Activity size={20} />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 font-medium">Engagements requiring active fieldwork</p>
        </div>

        <div className="bg-white dark:bg-[#1a0d35] p-6 rounded-xl border border-bg-mid dark:border-[#3d2a5a] shadow-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Avg. Completion</p>
              <h3 className="text-3xl font-bold text-dark dark:text-white">
                {audits?.length > 0 
                  ? Math.round(audits.reduce((acc: number, a: any) => acc + (a.stats?.completionPercent || 0), 0) / audits.length) 
                  : 0}%
              </h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <Progress 
            value={audits?.length > 0 ? (audits.reduce((acc: number, a: any) => acc + (a.stats?.completionPercent || 0), 0) / audits.length) : 0} 
            className="h-1 mt-4" 
          />
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6 flex flex-wrap h-auto p-1 bg-muted/20">
          <TabsTrigger value="list" className="gap-2 rounded-full py-2">
            <ClipboardList size={14} /> My Audits
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-[20px] justify-center bg-bg-mid text-bg-muted border-none">
              {audits?.length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2 rounded-full py-2">
            <CalendarIcon size={14} /> Weekly Schedule
          </TabsTrigger>
          <TabsTrigger value="discussions" className="gap-2 rounded-full py-2">
            <AlertCircle size={14} /> Finding Discussions
          </TabsTrigger>
          <TabsTrigger value="research" className="gap-2 rounded-full py-2">
            <Sparkles size={14} /> AI Research
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2 rounded-full py-2">
            <MessageSquare size={14} /> Engagement Chat
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2 rounded-full py-2">
            <BarChart3 size={14} /> My Performance
          </TabsTrigger>
          <TabsTrigger value="assessment" className="gap-2 rounded-full py-2">
            <ListChecks size={14} /> Self-Assessment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(audits) && audits.map((audit: any) => (
              <div 
                key={audit.id} 
                className="bg-white dark:bg-[#1a0d35] rounded-xl border border-bg-mid dark:border-[#3d2a5a] shadow-card overflow-hidden hover:shadow-elevated hover:-translate-y-1 transition-all duration-150 flex flex-col"
              >
                <div className="p-5 border-b bg-muted/30">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={cn(
                      audit.status === 'in_progress' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : 
                      audit.status === 'submitted' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' :
                      'bg-green-100 text-green-700 hover:bg-green-100'
                    )}>
                      {audit.status?.replace('_', ' ') || 'UNKNOWN'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Ends {audit.endDate ? format(new Date(audit.endDate), 'MMM dd, yyyy') : 'N/A'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-dark dark:text-white line-clamp-1">{audit.name}</h3>
                </div>
                
                <div className="p-5 flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">My Progress</span>
                      <span className="font-bold text-primary dark:text-accent">{Math.round(audit.stats?.completionPercent || 0)}%</span>
                    </div>
                    <Progress value={audit.stats?.completionPercent || 0} className="h-1" />
                    <div className="text-xs text-muted-foreground">
                      {audit.stats?.submittedItems || 0} of {audit.stats?.totalItems || 0} items completed
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle2 size={16} />
                      <span>{audit.stats?.submittedItems || 0} Done</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <Clock size={16} />
                      <span>{audit.stats?.draftItems || 0} Drafts</span>
                    </div>
                    {(audit.stats?.pendingExceptions || 0) > 0 && (
                      <div className="flex items-center gap-1.5 text-orange-600">
                        <AlertCircle size={16} />
                        <span>{audit.stats.pendingExceptions} Exceptions</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted/10 border-t mt-auto">
                  <Button 
                    onClick={() => navigate(`/auditor/workspace/${audit.id}`)}
                    className="w-full text-white bg-primary hover:bg-primary/90 gap-2 rounded-full"
                  >
                    Open Workspace
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {(!audits || audits.length === 0) && (
            <EmptyState 
              icon={ClipboardList}
              title="No audits assigned yet"
              description="Your audit engagements will appear here once they are assigned by a manager."
              className="mt-8"
            />
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <AuditorCalendar audits={audits || []} />
        </TabsContent>

        <TabsContent value="discussions" className="mt-0">
          <ExceptionWorkspace />
        </TabsContent>

        <TabsContent value="research" className="mt-0">
          <SituationalResearch />
        </TabsContent>

        <TabsContent value="chat" className="mt-0">
          <AuditorChat />
        </TabsContent>

        <TabsContent value="performance" className="mt-0">
          <AuditorPerformance />
        </TabsContent>

        <TabsContent value="assessment" className="mt-0">
          <AuditorSelfAssessment />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditorDashboard;
