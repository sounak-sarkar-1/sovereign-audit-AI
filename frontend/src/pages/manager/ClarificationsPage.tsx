import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Search, 
  CheckCircle2, 
  XSquare,
  Send,
  User,
  ExternalLink,
  Loader2,
  Inbox
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { clarificationService } from '@/services/clarificationService';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';

const ClarificationsPage = () => {
  const queryClient = useQueryClient();
  const { user: _currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: threads, isLoading: isListLoading } = useQuery({
    queryKey: ['clarifications', activeTab],
    queryFn: () => clarificationService.getClarifications(activeTab === 'all' ? undefined : activeTab),
  });

  const { data: activeThread, isLoading: isThreadLoading } = useQuery({
    queryKey: ['clarification-thread', selectedId],
    queryFn: () => clarificationService.getClarificationThread(selectedId!),
    enabled: !!selectedId,
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, message }: { id: string, message: string }) => clarificationService.respond(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clarification-thread', selectedId] });
      setReply('');
    },
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => clarificationService.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clarifications'] });
      queryClient.invalidateQueries({ queryKey: ['clarification-thread', selectedId] });
    },
  });

  const filteredThreads = threads?.filter((t: any) => 
    t.audit?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.client?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
      case 'responded': return <Badge className="bg-blue-500">Responded</Badge>;
      case 'closed': return <Badge variant="secondary">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clarifications Hub</h1>
          <p className="text-muted-foreground">Manage and track client communication across all audits.</p>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Panel: Thread List */}
        <div className="w-80 flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-4 space-y-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search audits, clients..." 
                className="pl-9 bg-muted/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 h-9">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">Pend</TabsTrigger>
                <TabsTrigger value="responded" className="text-xs">Resp</TabsTrigger>
                <TabsTrigger value="closed" className="text-xs">Done</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1">
            {isListLoading ? (
              <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
            ) : filteredThreads?.length === 0 ? (
              <div className="p-12 text-center">
                <Inbox className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground italic">No threads found</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredThreads?.map((thread: any) => (
                  <div 
                    key={thread.id}
                    onClick={() => setSelectedId(thread.id)}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-accent/5 transition-colors group relative",
                      selectedId === thread.id && "bg-accent/10 border-r-2 border-r-accent"
                    )}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider truncate max-w-[120px]">
                        {thread.audit?.name}
                      </span>
                      {getStatusBadge(thread.status)}
                    </div>
                    <div className="font-semibold text-sm mb-1">{thread.client?.fullName}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 italic">
                      {thread.responses?.length > 0 
                        ? thread.responses[thread.responses.length - 1].message 
                        : thread.message}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{format(new Date(thread.createdAt), 'MMM d')}</span>
                      {thread.status === 'pending' && <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Panel: Conversation */}
        <Card className="flex-1 flex flex-col overflow-hidden bg-muted/10 border shadow-sm">
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12">
              <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={40} className="text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-medium">Select a Conversation</h3>
              <p className="max-w-xs text-center mt-2">Choose a clarification thread from the list to view the full history and respond.</p>
            </div>
          ) : isThreadLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <>
              <div className="p-4 border-b bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-full text-accent">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-2">
                       {activeThread.client?.fullName}
                       {activeThread.relatedExceptionId && (
                         <TooltipProvider>
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Badge variant="secondary" className="h-5 px-1 bg-amber-50 text-amber-700 border-amber-200">
                                 <ExternalLink size={10} className="mr-1" /> Exception
                               </Badge>
                             </TooltipTrigger>
                             <TooltipContent>Related to an exception request</TooltipContent>
                           </Tooltip>
                         </TooltipProvider>
                       )}
                    </div>
                    <div className="text-xs text-muted-foreground">Audit: {activeThread.audit?.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeThread.status !== 'closed' && (
                    <Button variant="outline" size="sm" className="h-8 text-xs border-green-200 text-green-700 hover:bg-green-50" onClick={() => closeMutation.mutate(selectedId)}>
                      <CheckCircle2 size={14} className="mr-1" /> Mark Closed
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedId(null)}>
                    <XSquare size={18} />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6 max-w-3xl mx-auto">
                  {/* Initial Message */}
                  <div className="flex flex-col items-end">
                    <div className="bg-accent text-white rounded-2xl p-4 shadow-sm max-w-[85%] text-sm rounded-tr-none">
                      <p className="whitespace-pre-wrap">{activeThread.message}</p>
                      <div className="text-[10px] text-white/70 mt-2 text-right">
                        {format(new Date(activeThread.createdAt), 'MMM d, h:mm a')}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground mt-1 mr-2 uppercase tracking-wide">Manager</span>
                  </div>

                  {/* Message History */}
                  {activeThread.responses?.map((res: any) => {
                    const isManager = res.user?.role === 'manager';
                    return (
                      <div key={res.id} className={cn("flex flex-col", isManager ? "items-end" : "items-start")}>
                        <div className={cn(
                          "rounded-2xl p-4 shadow-sm max-w-[85%] text-sm",
                          isManager ? "bg-accent text-white rounded-tr-none" : "bg-white border text-foreground rounded-tl-none"
                        )}>
                          <p className="whitespace-pre-wrap">{res.message}</p>
                          <div className={cn("text-[10px] mt-2 text-right", isManager ? "text-white/70" : "text-muted-foreground")}>
                            {format(new Date(res.createdAt), 'MMM d, h:mm a')}
                          </div>
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wide",
                          isManager ? "mr-2" : "ml-2"
                        )}>
                          {isManager ? 'Manager' : 'Client'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {activeThread.status !== 'closed' && (
                <div className="p-4 bg-white border-t">
                  <div className="flex gap-2 max-w-3xl mx-auto items-end">
                    <Textarea 
                      placeholder="Type your message here..."
                      className="min-h-[80px] text-sm resize-none bg-muted/20"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                    <Button 
                      className="bg-accent h-[80px] w-[80px] flex-col gap-1"
                      disabled={!reply.trim() || respondMutation.isPending}
                      onClick={() => respondMutation.mutate({ id: selectedId, message: reply })}
                    >
                      {respondMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : <Send size={20} />}
                      <span className="text-[10px] font-bold uppercase">Send</span>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ClarificationsPage;
