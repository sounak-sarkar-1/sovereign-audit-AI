import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { exceptionService, ExceptionStatus } from '@/services/exceptionService';
import { clarificationService } from '@/services/clarificationService';
import { format } from 'date-fns';

interface ExceptionsTabProps {
  audit: any;
  isDraft: boolean;
}

const ExceptionsTab = ({ audit, isDraft: _isDraft }: ExceptionsTabProps) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'clarify' | null>(null);
  const [comment, setComment] = useState('');

  const { data: exceptions, isLoading } = useQuery({
    queryKey: ['exceptions', audit.id, activeTab],
    queryFn: () => exceptionService.getExceptions(audit.id, activeTab === 'all' ? undefined : activeTab),
  });

  const approveMutation = useMutation({
    mutationFn: ({ exId, comment }: { exId: string, comment?: string }) => 
      exceptionService.approveException(audit.id, exId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exceptions'] });
      setExpandedId(null);
      setActionType(null);
      setComment('');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ exId, comment }: { exId: string, comment: string }) => 
      exceptionService.rejectException(audit.id, exId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exceptions'] });
      setExpandedId(null);
      setActionType(null);
      setComment('');
    },
  });

  const clarifyMutation = useMutation({
    mutationFn: (dto: any) => clarificationService.createClarification(audit.id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exceptions'] });
      setExpandedId(null);
      setActionType(null);
      setComment('');
    },
  });

  const handleAction = (ex: any) => {
    if (actionType === 'approve') {
      approveMutation.mutate({ exId: ex.id, comment });
    } else if (actionType === 'reject') {
      rejectMutation.mutate({ exId: ex.id, comment });
    } else if (actionType === 'clarify') {
      clarifyMutation.mutate({
        auditId: audit.id,
        clientId: audit.clientId,
        message: comment,
        relatedExceptionId: ex.id,
      });
    }
  };

  const getStatusBadge = (status: ExceptionStatus) => {
    switch (status) {
      case ExceptionStatus.PENDING:
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
      case ExceptionStatus.APPROVED:
        return <Badge variant="outline" className="text-green-500 border-green-500">Approved</Badge>;
      case ExceptionStatus.REJECTED:
        return <Badge variant="outline" className="text-red-500 border-red-500">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <span className="ml-2">Loading exceptions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Exception Requests</h3>
          <p className="text-sm text-muted-foreground">Review and act on exceptions raised by the auditor team.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="pending">
            Pending
            <Badge className="ml-2 bg-amber-500 hover:bg-amber-600">
              {exceptions?.filter(e => e.status === ExceptionStatus.PENDING).length || 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="pt-4 space-y-4">
          {exceptions?.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed rounded-lg bg-muted/20">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No {activeTab} exceptions</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === 'pending' 
                  ? "Great! All exception requests have been addressed." 
                  : `There are currently no ${activeTab} exception requests.`}
              </p>
            </div>
          ) : (
            exceptions?.map((ex: any) => (
              <Card key={ex.id} className={`overflow-hidden transition-all ${expandedId === ex.id ? 'ring-1 ring-accent' : ''}`}>
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30"
                  onClick={() => {
                    setExpandedId(expandedId === ex.id ? null : ex.id);
                    setActionType(null);
                    setComment('');
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-accent/10 rounded-full text-accent hidden sm:block">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{ex.auditScopeLineItem?.name}</div>
                      <div className="text-xs text-muted-foreground">Raised by {ex.auditor?.fullName} • {format(new Date(ex.createdAt), 'MMM d, yyyy')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(ex.status)}
                    {expandedId === ex.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {expandedId === ex.id && (
                  <CardContent className="pt-0 pb-4 px-4 bg-muted/10 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Justification</label>
                          <p className="text-sm mt-1 leading-relaxed bg-white/50 p-3 rounded border italic">
                            "{ex.justification}"
                          </p>
                        </div>

                        {ex.managerComment && (
                          <div>
                            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Manager Comment</label>
                            <p className="text-sm mt-1 leading-relaxed bg-accent/5 p-3 rounded border border-accent/20">
                              {ex.managerComment}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                           {/* Evidence Chips placeholder */}
                           <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer">
                             <Download size={12} className="mr-1" /> evidence_01.pdf
                           </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {ex.status === ExceptionStatus.PENDING && !actionType && (
                          <div className="flex flex-col gap-2 pt-2">
                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setActionType('approve')}>
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <Button variant="destructive" className="w-full" onClick={() => setActionType('reject')}>
                              <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                            <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/5" onClick={() => setActionType('clarify')}>
                              <MessageSquare className="mr-2 h-4 w-4" /> Seek Clarification
                            </Button>
                          </div>
                        )}

                        {actionType && (
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold uppercase text-muted-foreground">
                                {actionType === 'approve' ? 'Optional Comment' : actionType === 'reject' ? 'Rejection Reason' : 'Message to Client'}
                              </label>
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => setActionType(null)}>Cancel</Button>
                            </div>
                            <Textarea 
                              placeholder={actionType === 'reject' ? "Please explain why this exception is rejected (min 10 chars)..." : "Add a comment..."}
                              className="text-xs min-h-[80px]"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                            />
                            <Button 
                              className={`w-full ${actionType === 'reject' ? 'bg-red-600' : actionType === 'approve' ? 'bg-green-600' : 'bg-accent'}`}
                              size="sm"
                              disabled={(actionType === 'reject' && comment.length < 10) || (actionType === 'clarify' && !comment)}
                              onClick={() => handleAction(ex)}
                            >
                              {approveMutation.isPending || rejectMutation.isPending || clarifyMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Confirm " + actionType.charAt(0).toUpperCase() + actionType.slice(1)
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExceptionsTab;
