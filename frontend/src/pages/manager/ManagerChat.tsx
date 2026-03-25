import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { managerService } from '@/services/managerService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  ArrowLeft, 
  Search, 
  Download, 
  MoreVertical,
  ShieldCheck,
  User,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth';

const ManagerChat: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['manager-chat', id],
    queryFn: () => managerService.getMessages(id!),
    refetchInterval: 3000, // Poll every 3s
  });

  const { data: audit } = useQuery({
    queryKey: ['manager-audit-detail', id],
    queryFn: () => managerService.getAuditDetail(id!),
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => managerService.sendMessage(id!, content),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['manager-chat', id] });
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
               <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 rounded-full px-2 text-[10px] uppercase font-bold tracking-tight">Active Collaboration</Badge>
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Case Ref: {id?.substring(0, 8)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full shadow-sm">
                <Download size={14} className="mr-2" /> Export Transcript
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
                <MoreVertical size={16} />
            </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Chat Area */}
        <Card className="flex-1 shadow-card border-none flex flex-col bg-white overflow-hidden">
          <CardHeader className="bg-muted/30 border-b p-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                   <ShieldCheck size={20} />
                </div>
                <div>
                   <CardTitle className="text-sm font-bold">Secure Audit Line</CardTitle>
                   <CardDescription className="text-[10px] font-bold uppercase tracking-tight">End-to-End Encrypted Communication</CardDescription>
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
                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                      </div>
                      <div className="mt-1 flex items-center gap-1 px-1">
                         <span className="text-[10px] text-muted-foreground font-bold">
                            {format(new Date(msg.createdAt), 'HH:mm')}
                         </span>
                         {isMe && msg.isRead && <CheckCircle2 size={10} className="text-primary" />}
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 bg-muted/20 border-t">
              <div className="flex gap-2 bg-white rounded-full p-1 pl-4 border shadow-sm focus-within:border-primary transition-colors">
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

        {/* Sidebar */}
        <div className="w-80 space-y-6 hidden xl:block">
           <Card className="shadow-card border-none bg-white">
              <CardHeader className="p-4 border-b">
                 <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Participants</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                 {[
                   { name: auditData?.manager?.fullName, role: 'Lead Manager', status: 'Online', color: 'bg-primary' },
                   { name: auditData?.client?.fullName, role: 'Client Executive', status: 'Offline', color: 'bg-accent' }
                 ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase", p.color)}>
                             {p.name?.[0]}
                          </div>
                          <div>
                             <p className="text-xs font-bold text-dark">{p.name}</p>
                             <p className="text-[10px] text-muted-foreground font-medium">{p.role}</p>
                          </div>
                       </div>
                       <div className={cn("w-2 h-2 rounded-full", p.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-300')} />
                    </div>
                 ))}
              </CardContent>
           </Card>

           <Card className="shadow-card border-none bg-accent/5 border border-accent/10">
              <CardContent className="p-4 space-y-3">
                 <div className="flex items-center gap-2 text-accent font-bold text-[10px] uppercase tracking-widest">
                    <Clock size={12} /> Compliance Reminder
                 </div>
                 <p className="text-[11px] font-medium leading-relaxed text-dark/70">
                    All findings shared in this chat are confidential. Messages are retained for 7 years according to Sovereign AI's data policy.
                 </p>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagerChat;
