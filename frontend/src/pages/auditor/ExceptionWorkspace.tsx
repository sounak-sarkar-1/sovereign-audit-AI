import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShieldAlert, 
  MessageSquare, 
  Clock, 
  Send,
  User as UserIcon
} from 'lucide-react';
import { auditorService } from '@/services/auditorService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ExceptionWorkspaceProps {
  auditId?: string;
}

const ExceptionWorkspace: React.FC<ExceptionWorkspaceProps> = ({ auditId }) => {
  const { id: paramsId } = useParams<{ id: string }>(); 
  const currentAuditId = auditId || paramsId;
  const queryClient = useQueryClient();
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');

  const { data: exceptions, isLoading: isExceptionsLoading } = useQuery({
    queryKey: ['auditor-exceptions', currentAuditId],
    queryFn: () => currentAuditId 
      ? auditorService.getExceptions(currentAuditId) 
      : auditorService.getGlobalExceptions(),
  });

  const { data: comments, isLoading: isCommentsLoading } = useQuery({
    queryKey: ['exception-comments', selectedExceptionId],
    queryFn: () => auditorService.getExceptionComments(selectedExceptionId!),
    enabled: !!selectedExceptionId,
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => auditorService.addExceptionComment(selectedExceptionId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exception-comments', selectedExceptionId] });
      setCommentContent('');
      toast.success('Comment added');
    },
  });

  if (isExceptionsLoading) return <div className="p-8 text-center text-muted-foreground">Loading discussions...</div>;

  const selectedException = exceptions?.find((e: any) => e.id === selectedExceptionId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
      {/* Exceptions List */}
      <Card className="lg:col-span-1 shadow-card border-none overflow-hidden flex flex-col">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldAlert className="text-primary" size={18} />
            Findings & Exceptions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="divide-y divide-border">
              {exceptions?.map((ex: any) => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExceptionId(ex.id)}
                  className={`w-full text-left p-4 transition-colors hover:bg-muted/50 ${
                    selectedExceptionId === ex.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <Badge variant={ex.status === 'pending' ? 'secondary' : ex.status === 'approved' ? 'default' : 'destructive'} className="text-[10px]">
                      {ex.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(ex.createdAt), 'MMM dd')}</span>
                  </div>
                  <h4 className="font-bold text-sm text-dark truncate">{ex.auditScopeLineItem?.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{ex.justification}</p>
                </button>
              ))}
              {exceptions?.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No exceptions raised yet.
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Collaboration Area */}
      <Card className="lg:col-span-2 shadow-card border-none overflow-hidden flex flex-col">
        {selectedException ? (
          <>
            <CardHeader className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-xl text-dark">
                    {selectedException.auditScopeLineItem?.name}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={14} /> Created {format(new Date(selectedException.createdAt), 'MMM dd, h:mm a')}</span>
                    <span className="flex items-center gap-1"><UserIcon size={14} /> Manager: {selectedException.manager?.fullName || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <div className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {/* Original Request */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-dashed">
                    <h5 className="text-xs font-bold text-muted-foreground uppercase mb-2 tracking-wider">Initial Justification</h5>
                    <p className="text-sm text-dark leading-relaxed">{selectedException.justification}</p>
                  </div>

                  {/* Comments Thread */}
                  <div className="space-y-4">
                    {comments?.map((comment: any) => (
                      <div key={comment.id} className={`flex gap-3 ${comment.authorId === selectedException.auditorId ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-1 max-w-[80%] space-y-1 ${comment.authorId === selectedException.auditorId ? 'items-end' : ''}`}>
                          <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${comment.authorId === selectedException.auditorId ? 'flex-row-reverse' : ''}`}>
                            <span className="text-primary">{comment.author?.fullName}</span>
                            <span className="text-muted-foreground font-normal">{format(new Date(comment.createdAt), 'h:mm a')}</span>
                          </div>
                          <div className={`p-3 rounded-2xl text-sm ${
                            comment.authorId === selectedException.auditorId 
                              ? 'bg-primary text-white rounded-tr-none' 
                              : 'bg-muted text-dark rounded-tl-none'
                          }`}>
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isCommentsLoading && <div className="text-center py-4 text-xs text-muted-foreground">Loading discussion...</div>}
                  </div>
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t bg-muted/10">
                <div className="flex gap-2">
                  <Textarea 
                    placeholder="Type a message..." 
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="min-h-[80px] rounded-xl resize-none shadow-sm focus:ring-primary/20"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button 
                    size="sm" 
                    className="rounded-full gap-2 px-6"
                    onClick={() => commentMutation.mutate(commentContent)}
                    disabled={!commentContent.trim() || commentMutation.isPending}
                  >
                    {commentMutation.isPending ? 'Sending...' : 'Send Message'}
                    <Send size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <MessageSquare size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-dark">Discussion Workspace</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Select a finding or exception from the left to start a collaborative discussion with your Audit Manager.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExceptionWorkspace;
