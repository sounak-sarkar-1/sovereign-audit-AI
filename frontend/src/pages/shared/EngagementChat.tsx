import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  ArrowLeft, 
  Download, 
  MoreVertical,
  ShieldCheck,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth';
import api from '@/lib/api';

const EngagementChat: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const role = user?.role === 'client' ? 'client' : user?.role === 'manager' ? 'manager' : 'auditor';
  const apiPath = user?.role === 'manager' ? `/manager/chats/${id}` : user?.role === 'client' ? `/client/chats/${id}` : `/auditor/chats/${id}`;

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['engagement-chat', id],
    queryFn: () => api.get(apiPath).then(res => res.data),
    refetchInterval: 3000,
  });

  const { data: audit } = useQuery({
    queryKey: ['audit-detail-chat', id],
    queryFn: () => api.get(`/${role}/audits/${id}`).then(res => res.data),
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => api.post(apiPath, { content }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['engagement-chat', id] });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(message);
  };

  if (messagesLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  const auditData = audit?.data || audit;
  const messageList = Array.isArray(messages) ? messages : (messages?.data || []);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-dark">{auditData?.name || 'Engagement Chat'}</h1>
            <div className="flex items-center gap-2">
               <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 rounded-full px-2 text-[10px] uppercase font-bold tracking-tight">Project Collaboration</Badge>
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reference: {id?.substring(0, 8)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <Card className="flex-1 shadow-card border-none flex flex-col bg-white overflow-hidden">
          <CardHeader className="bg-muted/30 border-b p-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                   <ShieldCheck size={20} />
                </div>
                <div>
                   <CardTitle className="text-sm font-bold">Secure Audit Line</CardTitle>
                   <CardDescription className="text-[10px] font-bold uppercase tracking-tight">End-to-End Encrypted</CardDescription>
                </div>
             </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {messageList.map((msg: any) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                      <div className={cn(
                        "max-w-[80%] rounded-2xl p-4 shadow-sm",
                        isMe 
                          ? "bg-primary text-white rounded-br-none" 
                          : "bg-muted/40 text-dark rounded-bl-none"
                      )}>
                        {!isMe && (
                          <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                            {msg.sender?.fullName || 'System'}
                          </div>
                        )}
                        <p className="text-sm font-medium">{msg.content}</p>
                      </div>
                      <div className="mt-1 flex items-center gap-1 px-1">
                         <span className="text-[10px] text-muted-foreground font-bold">
                            {format(new Date(msg.createdAt), 'HH:mm')}
                         </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
            <div className="p-4 bg-muted/20 border-t">
              <div className="flex gap-2 bg-white rounded-full p-1 pl-4 border shadow-sm">
                <input 
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium" 
                  placeholder="Type a secure message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button 
                    size="icon" 
                    className="rounded-full h-8 w-8 bg-primary hover:bg-primary/90 flex-shrink-0"
                    onClick={handleSend}
                    disabled={sendMutation.isPending || !message.trim()}
                >
                  <Send size={14} className="text-white" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EngagementChat;
