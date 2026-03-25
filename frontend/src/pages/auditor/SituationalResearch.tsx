import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Loader2, 
  BookOpen, 
  Scale, 
  FileCheck,
  History,
  Info
} from 'lucide-react';
import { auditorService } from '@/services/auditorService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const SituationalResearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setResults(null);
    try {
      const { jobId } = await auditorService.search(query);
      setCurrentJobId(jobId);
    } catch (error) {
      toast.error('Search failed to initiate');
      setIsSearching(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (currentJobId && isSearching) {
      interval = setInterval(async () => {
        try {
          const job = await auditorService.getSearchJobStatus(currentJobId);
          if (job.status === 'completed') {
            setResults(job.outputPayload);
            setIsSearching(false);
            setCurrentJobId(null);
            clearInterval(interval);
          } else if (job.status === 'failed') {
            toast.error('AI Research job failed');
            setIsSearching(false);
            setCurrentJobId(null);
            clearInterval(interval);
          }
        } catch (error) {
          console.error('Polling error', error);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [currentJobId, isSearching]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Search Header */}
      <Card className="border-none shadow-card bg-gradient-to-br from-primary/5 via-white to-accent/5 overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
              <Sparkles size={32} />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-dark">Situational AI Research</h2>
              <p className="text-muted-foreground max-w-lg">
                Enter any legal requirement, policy standard, or regulatory context to receive AI-powered auditing guidance.
              </p>
            </div>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search size={20} />
            </div>
            <Input 
              placeholder="e.g., What are the GDPR requirements for data encryption in transit?" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-14 rounded-full border-primary/20 bg-white shadow-lg focus:ring-primary/20 text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !query.trim()}
                className="rounded-full px-6 bg-primary hover:bg-primary/90 h-10 gap-2"
              >
                {isSearching ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {isSearching ? 'Researching...' : 'Ask AI'}
              </Button>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center gap-3">
             <Badge variant="outline" className="bg-white/50 cursor-pointer hover:bg-primary/5 border-primary/10" onClick={() => setQuery('HiTrust requirements for Access Control')}>
               HiTrust v11.3
             </Badge>
             <Badge variant="outline" className="bg-white/50 cursor-pointer hover:bg-primary/5 border-primary/10" onClick={() => setQuery('SOC2 Type 2 Availability criteria')}>
               SOC2 Guidelines
             </Badge>
             <Badge variant="outline" className="bg-white/50 cursor-pointer hover:bg-primary/5 border-primary/10" onClick={() => setQuery('ISO 27001 Identity Management')}>
               ISO 27001
             </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Results or Empty State */}
      <div className="min-h-[400px]">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-300">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-primary">
                <Search size={32} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-dark">AI is scanning legal contexts...</h3>
            <p className="text-sm text-muted-foreground">Synthesizing regulatory frameworks and internal policies.</p>
          </div>
        ) : results ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Main Insights (Left) */}
            <Card className="md:col-span-3 border-none shadow-card">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="text-primary" size={20} />
                  AI Synthesis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-[500px] pr-4 text-dark leading-relaxed whitespace-pre-wrap">
                  {results.synthesis || "Result parsing temporary placeholder..."}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Citations & Metadata (Right) */}
            <div className="space-y-6">
              <Card className="border-none shadow-card bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Scale size={16} /> Legal Citations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {results.citations?.map((c: string, i: number) => (
                    <div key={i} className="bg-white p-3 rounded-lg border border-primary/10 shadow-sm text-xs">
                       <span className="font-bold text-primary block mb-1">§ {c.split(':')[0]}</span>
                       <span className="text-muted-foreground">{c.split(':')[1]}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-none shadow-card bg-accent/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileCheck size={16} /> Auditor Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {results.tips?.map((t: string, i: number) => (
                    <div key={i} className="flex gap-2 text-xs">
                       <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1 shrink-0"></div>
                       <p className="text-muted-foreground">{t}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 text-muted-foreground border-2 border-dashed rounded-3xl opacity-60">
             <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Info size={32} />
             </div>
             <div>
                <h4 className="font-bold text-dark opacity-100">No active research</h4>
                <p className="max-w-xs mx-auto">Start by typing a question above to explore regulatory context.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SituationalResearch;
