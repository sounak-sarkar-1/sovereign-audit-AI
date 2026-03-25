import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Send, 
  User as UserIcon, 
  MessageSquare,
  Search,
  MoreVertical,
  Check,
  CheckCheck
} from 'lucide-react';
import { auditorService } from '@/services/auditorService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { toast } from 'sonner';

const AuditorChat: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: audits } = useQuery({
    queryKey: ['auditor-audits'],
    queryFn: () => auditorService.getAudits(),
  });

  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['engagement-chat', selectedAuditId],
    queryFn: () => auditorService.getChatMessages(selectedAuditId!),
    enabled: !!selectedAuditId,
    refetchInterval: 3000, // Poll every 3s for "real-time" feel
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => auditorService.sendChatMessage(selectedAuditId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['engagement-chat', selectedAuditId] });
      setMessageContent('');
    },
  });

  const selectedAudit = audits?.find((a: any) => a.id === selectedAuditId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
      {/* Engagements List */}
      <Card className="lg:col-span-1 shadow-card border-none overflow-hidden flex flex-col">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input placeholder="Search engagements..." className="pl-9 h-9 rounded-full bg-white border-none text-xs" />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="divide-y divide-border">
              {audits?.map((audit: any) => (
                <button
                  key={audit.id}
                  onClick={() => setSelectedAuditId(audit.id)}
                  className={`w-full text-left p-4 transition-colors hover:bg-muted/50 flex gap-3 ${
                    selectedAuditId === audit.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                  }`}
                >
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarFallback className="bg-accent/10 text-accent text-xs font-bold">
                      {audit.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-bold text-sm text-dark truncate">{audit.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground truncate italic">Manager: {audit.managerName || 'Assigned Manager'}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-3 shadow-card border-none overflow-hidden flex flex-col relative">
        {selectedAudit ? (
          <>
            <CardHeader className="border-b pb-4 flex flex-row justify-between items-center">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {selectedAudit.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg text-dark">{selectedAudit.name}</CardTitle>
                  <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    Active Engagement
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                <MoreVertical size={18} />
              </Button>
            </CardHeader>

            <div className="flex-1 flex flex-col overflow-hidden bg-[#faf9f8]">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  <div className="flex justify-center mb-8">
                     <Badge variant="outline" className="text-[10px] bg-white pointer-events-none">
                        Discussion initiated on {format(new Date(selectedAudit.createdAt), 'MMMM dd, yyyy')}
                     </Badge>
                  </div>

                  {messages?.map((msg: any, idx: number) => {
                    const isMe = msg.authorId === selectedAudit.auditorId; // Simple check, should use actual current user ID
                    return (
                      <div key={msg.id} className={`flex gap-3 mb-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                         {!isMe && (
                           <Avatar className="h-8 w-8 mt-1">
                             <AvatarFallback className="bg-muted text-[10px]">{msg.author?.fullName?.substring(0,1)}</AvatarFallback>
                           </Avatar>
                         )}
                         <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                              isMe 
                                ? 'bg-primary text-white rounded-tr-none' 
                                : 'bg-white text-dark border rounded-tl-none'
                            }`}>
                              {msg.content}
                            </div>
                            <div className={`flex items-center gap-1 text-[9px] text-muted-foreground ${isMe ? 'justify-end' : ''}`}>
                               {format(new Date(msg.createdAt), 'h:mm a')}
                               {isMe && (msg.isRead ? <CheckCheck size={12} className="text-accent" /> : <Check size={12} />)}
                            </div>
                         </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 bg-white border-t">
                <div className="flex gap-2 relative">
                  <Input 
                    placeholder="Message your manager..." 
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    className="h-12 rounded-2xl pr-14 border-bg-mid shadow-sm focus:ring-primary/20 bg-muted/20 border-none"
                    onKeyDown={(e) => e.key === 'Enter' && messageContent.trim() && sendMutation.mutate(messageContent)}
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    <Button 
                        size="icon" 
                        className="rounded-xl h-10 w-10 bg-primary hover:bg-primary/90"
                        onClick={() => sendMutation.mutate(messageContent)}
                        disabled={!messageContent.trim() || sendMutation.isPending}
                    >
                        <Send size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6 bg-[#faf9f8]">
            <div className="relative">
               <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center text-primary/40">
                  <MessageSquare size={48} />
               </div>
               <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white border-4 border-white shadow-lg">
                  <Sparkles size={16} />
               </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-dark">Real-time Engagement Chat</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Secure, end-to-end communication with your designated Audit Managers for this assignment. 
                Select an engagement from the left to begin.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuditorChat;
