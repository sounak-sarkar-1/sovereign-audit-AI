import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  Calendar, 
  Building2, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  MoreVertical,
  MessageSquare,
  FileText
} from 'lucide-react';


import { auditorService } from '@/services/auditorService';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

import ResponseDialog from './ResponseDialog';
import ExceptionDialog from './ExceptionDialog';
import type { ScopeLineItemExtended } from '@/types/scope';



const AuditorWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeBuId, setActiveBuId] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<ScopeLineItemExtended | null>(null);
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [isExceptionOpen, setIsExceptionOpen] = useState(false);

  // Queries
  const { data: audit, isLoading: isAuditLoading } = useQuery({
    queryKey: ['auditor-audit', id],
    queryFn: () => auditorService.getAuditDetail(id!),
    enabled: !!id,
  });

  const { data: scopeByBu, isLoading: isScopeLoading } = useQuery({
    queryKey: ['auditor-scope', id],
    queryFn: () => auditorService.getScope(id!),
    enabled: !!id,
  });

  React.useEffect(() => {
    if (scopeByBu && scopeByBu.length > 0 && !activeBuId) {
      setActiveBuId(scopeByBu[0].id);
    }
  }, [scopeByBu, activeBuId]);


  // Mutations
  const responseMutation = useMutation({
    mutationFn: (data: any) => auditorService.updateResponse(id!, selectedItem!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditor-scope', id] });
      queryClient.invalidateQueries({ queryKey: ['auditor-audit', id] });
      queryClient.invalidateQueries({ queryKey: ['auditor-audits'] });
      toast.success('Response saved successfully');
      setIsResponseOpen(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save response');
    }
  });

  const exceptionMutation = useMutation({
    mutationFn: (data: any) => auditorService.createException(id!, { ...data, lineItemId: selectedItem!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditor-scope', id] });
      queryClient.invalidateQueries({ queryKey: ['auditor-audit', id] });
      toast.success('Exception request raised successfully');
      setIsExceptionOpen(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to raise exception');
    }
  });

  if (isAuditLoading || isScopeLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!audit) return <div className="p-12 text-center">Audit profile not found.</div>;


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not_started': return <Badge variant="outline" className="text-muted-foreground">Not Started</Badge>;
      case 'draft_saved': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Draft</Badge>;
      case 'submitted': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Submitted</Badge>;
      case 'exception_pending': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Exc. Pending</Badge>;
      case 'exception_approved': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Exc. Approved</Badge>;
      case 'returned': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Returned</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 hover:bg-transparent text-muted-foreground hover:text-dark mb-1"
            onClick={() => navigate('/auditor/audits')}
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Audits
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-dark">{audit.name}</h1>
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 capitalize">
              {audit.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="gap-2">
             <MessageSquare size={16} /> Interactions
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Workspace (Left) */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={activeBuId} onValueChange={setActiveBuId} className="w-full">
            <div className="border-b">
              <TabsList className="bg-transparent h-12 w-full justify-start rounded-none p-0">
                {scopeByBu?.map((bu: any) => (
                  <TabsTrigger 
                    key={bu.id} 
                    value={bu.id}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 font-medium"
                  >
                    {bu.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {scopeByBu?.map((bu: any) => (
              <TabsContent key={bu.id} value={bu.id} className="pt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {bu.items.map((item: ScopeLineItemExtended) => (
                    <Card key={item.id} className={cn(
                      "transition-all border-l-4",
                      item.status === 'submitted' ? "border-l-green-500 opacity-80" : 
                      item.status === 'draft_saved' ? "border-l-blue-500 shadow-sm" : 
                      item.status === 'exception_pending' ? "border-l-amber-500" :
                      "border-l-transparent"
                    )}>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(item.status)}
                              <h4 className="font-bold text-dark">{item.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                            
                            {item.ownResponse && (
                              <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-dashed text-xs italic text-muted-foreground">
                                {item.inputMethod === 'free_text' 
                                  ? `Last finding: ${item.ownResponse.responseText?.substring(0, 100)}...` 
                                  : `Last finding: ${item.options?.find(o => o.id === item.ownResponse?.selectedOptionId)?.optionText || 'None'}`
                                }
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant={item.status === 'not_started' ? 'default' : 'outline'}
                              disabled={item.status === 'submitted' || item.status === 'exception_pending'}
                              onClick={() => { setSelectedItem(item); setIsResponseOpen(true); }}
                              className="gap-2"
                            >
                              <FileText size={16} /> 
                              {item.status === 'not_started' ? 'Respond' : 'Edit'}
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                  <MoreVertical size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  className="text-amber-600"
                                  disabled={item.status === 'submitted' || item.status === 'exception_pending'}
                                  onClick={() => { setSelectedItem(item); setIsExceptionOpen(true); }}
                                >
                                  <ShieldAlert size={14} className="mr-2" /> Raise Exception
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {bu.items.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                      No scope items assigned to you in this Business Unit.
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Right Sidebar (Summary) */}
        <div className="space-y-6">
          <Card className="shadow-sm border-primary/10">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 size={18} className="text-primary" />
                Audit Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Completion</span>
                  <span className="font-bold text-primary">{audit.stats.completionPercent}%</span>
                </div>
                <Progress value={audit.stats.completionPercent} className="h-2.5" />
                <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest font-semibold pt-1">
                  <span>{audit.stats.submittedItems} / {audit.stats.totalItems} Items</span>
                  <span>{audit.stats.pendingExceptions} Exceptions</span>
                </div>
              </div>

              <div className="pt-2 border-t space-y-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider h-6 flex items-center">Co-Auditor Progress</p>
                <div className="space-y-4 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin">
                  {audit.stats.buStats.map((bu: any) => (
                    <div key={bu.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="truncate max-w-[150px]">{bu.name}</span>
                        <span className="text-primary">{bu.coAuditorCompletion}%</span>
                      </div>
                      <Progress value={bu.coAuditorCompletion} className="h-1.5 bg-muted" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10 overflow-hidden">
            <CardContent className="p-5 space-y-4 relative">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Clock size={80} />
              </div>
              <div className="space-y-4 relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Audit Deadline</p>
                    <p className="text-sm font-bold text-dark">{format(new Date(audit.endDate), 'MMMM dd, yyyy')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Client</p>
                    <p className="text-sm font-bold text-dark">{audit.clientName}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <ResponseDialog 
        item={selectedItem}
        open={isResponseOpen}
        onOpenChange={setIsResponseOpen}
        onSubmit={responseMutation.mutate}
        isPending={responseMutation.isPending}
      />

      <ExceptionDialog 
        item={selectedItem}
        open={isExceptionOpen}
        onOpenChange={setIsExceptionOpen}
        onSubmit={exceptionMutation.mutate}
        isPending={exceptionMutation.isPending}
      />
    </div>
  );
};

export default AuditorWorkspace;
