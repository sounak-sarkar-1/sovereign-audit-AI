import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { clientService } from '@/services/clientService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  MessageSquare,
  ShieldCheck,
  Calendar,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ClientAuditDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: audit, isLoading } = useQuery({
    queryKey: ['client-audit-detail', id],
    queryFn: () => clientService.getAuditDetail(id!),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  const data = audit?.data || audit;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
               <h1 className="text-3xl font-bold tracking-tight text-dark">{data.name}</h1>
               <Badge className="bg-primary/10 text-primary hover:bg-primary/10 rounded-full px-3 capitalize">
                 {data.status.replace(/_/g, ' ')}
               </Badge>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Case Ref: {data.id.substring(0, 8)}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-full gap-2 shadow-sm" onClick={() => navigate('/client/clarifications')}>
              <MessageSquare className="h-4 w-4" /> Ask a Question
           </Button>
           <Button className="rounded-full bg-primary hover:bg-primary/90 gap-2 shadow-sm" onClick={() => navigate(`/client/chat/${id}`)}>
              <ShieldCheck className="h-4 w-4" /> Join Engagement Chat
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card border-none bg-white">
            <CardHeader className="p-6">
              <CardTitle className="text-lg">Executive Summary</CardTitle>
              <CardDescription>Strategic overview of the audit engagement objectives.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="text-sm text-dark/70 leading-relaxed font-medium">
                {data.description || "The engagement scope is strictly defined by the regulatory requirements provided in the initial intake. This audit will assess internal controls, data integrity, and compliance with Sovereign AI standards."}
              </p>
            </CardContent>
          </Card>

          <Tabs defaultValue="scope" className="w-full">
            <TabsList className="bg-muted/30 p-1 rounded-full w-fit">
              <TabsTrigger value="scope" className="rounded-full px-8">Audit Scope</TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-full px-8">Timeline</TabsTrigger>
            </TabsList>
            <TabsContent value="scope" className="mt-6">
               <Card className="shadow-card border-none bg-white">
                 <CardHeader className="border-b p-6">
                    <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                       <ClipboardList size={16} /> Defined Controls
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground mx-auto">
                        <Clock size={32} />
                    </div>
                    <div className="space-y-1">
                       <p className="font-bold text-dark text-lg">Work in Progress</p>
                       <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                         The audit checklist and control matrix are being finalized by the Lead Auditor. You will be notified once the scope is ready for collaborative review.
                       </p>
                    </div>
                 </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
           <Card className="shadow-card border-none bg-white overflow-hidden">
              <CardHeader className="bg-muted/30 border-b p-5">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                   <Calendar size={14} /> Engagement Meta
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lead Manager</span>
                  <div className="flex items-center gap-2">
                     <span className="text-sm font-bold text-dark">{data.manager?.fullName}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Commenced</span>
                  <span className="text-sm font-bold text-dark">{format(new Date(data.startDate), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Date</span>
                  <span className="text-sm font-bold text-dark">{format(new Date(data.expectedCompletionDate), 'MMM dd, yyyy')}</span>
                </div>
              </CardContent>
           </Card>

           <Card className="shadow-card border-none bg-accent/5 border border-accent/10">
              <CardContent className="p-6 space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                       <MessageSquare size={20} />
                    </div>
                    <div>
                       <h4 className="text-sm font-bold text-dark italic">Collaborate</h4>
                       <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Direct Engagement</p>
                    </div>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                    Have specific questions about findings or evidence requirements? Start a real-time conversation with the audit team.
                 </p>
                 <Button className="w-full rounded-full bg-accent hover:bg-accent/90 gap-2 shadow-sm font-bold text-xs" onClick={() => navigate(`/client/chat/${id}`)}>
                    Open Chat <ChevronRight size={14} />
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientAuditDetail;
