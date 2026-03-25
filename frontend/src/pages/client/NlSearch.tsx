import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { clientService } from '@/services/clientService';
import { 
  Search, 
  Send, 
  Sparkles, 
  History, 
  Loader2, 
  Bot, 
  User,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { aiJobsService } from '@/services/aiJobsService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: 'pending' | 'complete' | 'error';
  citations?: Array<{ id: string; title: string }>;
}

const NlSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your Sovereignty AI assistant. You can ask me anything about your past audit reports, compliance trends, or specific findings. What would you like to know today?',
    }
  ]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const searchMutation = useMutation({
    mutationFn: (q: string) => clientService.search(q),
    onSuccess: (data) => {
      setActiveJobId(data.jobId);
    },
    onError: () => {
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: 'Sorry, I encountered an error processing your request.', status: 'error' }
      ]);
    }
  });

  // Poll for job status
  useEffect(() => {
    let interval: any;
    if (activeJobId) {
      interval = setInterval(async () => {
        try {
          const job = await aiJobsService.getJobStatus(activeJobId);
          if (job.status === 'completed') {
            setMessages(prev => prev.map(m => 
              m.status === 'pending' 
                ? { ...m, content: job.outputPayload?.answer || 'Search completed.', status: 'complete', citations: job.outputPayload?.citations } 
                : m
            ));
            setActiveJobId(null);
            clearInterval(interval);
          } else if (job.status === 'failed') {
            setMessages(prev => prev.map(m => 
              m.status === 'pending' 
                ? { ...m, content: 'Failed to retrieve answer. Please try again.', status: 'error' } 
                : m
            ));
            setActiveJobId(null);
            clearInterval(interval);
          }
        } catch (e) {
          console.error(e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [activeJobId]);

  const handleSend = () => {
    if (!query.trim() || searchMutation.isPending || activeJobId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
    };

    const assistantPlaceholder: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Analyzing your reports...',
      status: 'pending',
    };

    setMessages(prev => [...prev, userMessage, assistantPlaceholder]);
    searchMutation.mutate(query);
    setQuery('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="flex flex-row items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Insights Search</h1>
          <p className="text-muted-foreground flex items-center">
            <Sparkles className="mr-1 h-3 w-3 text-[#4f2d7f]" />
            Natural language interface to your audit intelligence.
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <History className="mr-2 h-4 w-4" />
          History
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-lg bg-slate-50/50">
        <ScrollArea className="flex-1 p-6" viewportRef={scrollRef}>
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-[#4f2d7f] text-white' : 'bg-white border text-slate-600'}`}>
                    {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`space-y-2`}>
                    <div className={`p-4 rounded-2xl shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-[#4f2d7f] text-white' 
                        : 'bg-white border border-slate-200 text-slate-800'
                    }`}>
                      {m.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm italic">{m.content}</span>
                        </div>
                      ) : (
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {m.content}
                        </div>
                      )}
                    </div>
                    {m.citations && m.citations.length > 0 && (
                      <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
                        {m.citations.map((c, i) => (
                          <Badge key={i} variant="outline" className="bg-white/50 cursor-pointer hover:bg-white text-[10px] py-0">
                            [{i + 1}] {c.title} <ExternalLink className="ml-1 h-2 w-2" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 bg-white border-t">
          <div className="max-w-4xl mx-auto flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about recurring findings, compliance scores, or specific controls..."
                className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-[#4f2d7f]"
                disabled={activeJobId !== null}
              />
            </div>
            <Button 
              onClick={handleSend} 
              disabled={!query.trim() || activeJobId !== null}
              className="h-12 w-12 rounded-xl bg-[#4f2d7f] hover:bg-[#3d2263]"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <div className="max-w-4xl mx-auto mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              "What are the top 3 recurring findings across all BUs?",
              "Show me the compliance trend for access reviews",
              "Which audit had the highest number of exceptions?"
            ].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setQuery(suggestion)}
                className="whitespace-nowrap flex items-center text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
              >
                {suggestion}
                <ChevronRight className="ml-1 h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NlSearch;
