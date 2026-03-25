import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Send, 
  MessageSquare,
  ShieldCheck,
  User as UserIcon,
  Search,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { clientService } from '@/services/clientService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { toast } from 'sonner';

const EngagementChat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: audit } = useQuery({
    queryKey: ['client-audit', id],
    queryFn: () => clientService.getAuditDetail(id!),
    enabled: !!id,
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['client-chat-messages', id],
    queryFn: () => clientService.getChatMessages(id!),
    enabled: !!id,
    refetchInterval: 3000,
  });

  const mutation = useMutation({
    mutationFn: (text: string) => clientService.sendChatMessage(id!, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-chat-messages', id] });
      setContent('');
    },
    onError: (error: any) => {
      toast.error('Failed to send message');
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!content.trim() || mutation.isPending) return;
    mutation.mutate(content);
  };

  if (!id) return null;

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      <Card className="flex-1 shadow-card border-none bg-white flex flex-col overflow-hidden">
        <CardHeader className="p-6 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <MessageSquare size={20} />
              </div>
              <div>
                <CardTitle className="text-lg">Engagement Chat</CardTitle>
                <CardDescription className="flex items-center gap-1.5">
                  <ShieldCheck size={12} /> {audit?.name || 'Loading audit...'}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-hidden bg-[#faf9f8]">
          <ScrollArea className="h-full p-6">
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center p-12">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : messages?.length === 0 ? (
                <div className="text-center p-12 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground mx-auto">
                    <MessageSquare size={24} />
                  </div>
                  <p className="text-sm text-muted-foreground">No messages yet. Send a message to start the conversation.</p>
                </div>
              ) : (
                messages?.map((msg: any) => (
                  <div key={msg.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 border shadow-sm">
                      <AvatarFallback className="bg-muted text-[10px]">
                        {msg.author?.fullName?.substring(0, 1) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-bold text-dark">{msg.author?.fullName || 'User'}</span>
                        <span className="text-[10px] text-muted-foreground">{format(new Date(msg.createdAt), 'MMM dd, h:mm a')}</span>
                      </div>
                      <div className="bg-white p-3 rounded-2xl rounded-tl-none border shadow-sm text-sm text-dark max-w-[80%]">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 bg-white border-t">
          <div className="flex gap-2 relative">
            <Input 
              placeholder="Type your message..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-12 rounded-full pr-12 border-bg-mid bg-muted/10 text-sm focus:ring-primary/20"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button 
                size="icon" 
                onClick={handleSend}
                disabled={!content.trim() || mutation.isPending}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </Card>

      <div className="w-80 space-y-6 hidden lg:block">
        <Card className="shadow-card border-none bg-white">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Participants</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-primary/20 ring-offset-2">
                <AvatarFallback className="bg-primary/10 text-primary">AM</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold text-dark">Audit Manager</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Online</span>
                </div>
              </div>
            </div>
            {audit?.auditors?.map((auditor: any) => (
               <div key={auditor.id} className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-muted text-muted-foreground">{auditor.fullName?.substring(0, 1)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-muted-foreground">{auditor.fullName}</p>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Offline</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card border-none bg-primary text-white overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <Clock size={100} />
          </div>
          <CardHeader className="p-5">
            <CardTitle className="text-sm font-bold text-white/70 uppercase tracking-widest">Engagement Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-5 relative space-y-4">
             <div className="space-y-1">
                <p className="text-[10px] text-white/60 uppercase font-bold">Audit Status</p>
                <p className="text-sm font-bold capitalize">{audit?.status.replace('_', ' ')}</p>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-white/60 uppercase font-bold">
                   <span>Completion</span>
                   <span>{Math.round(audit?.stats?.completionPercent || 0)}%</span>
                </div>
                <Progress value={audit?.stats?.completionPercent || 0} className="h-1 bg-white/20" />
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EngagementChat;
