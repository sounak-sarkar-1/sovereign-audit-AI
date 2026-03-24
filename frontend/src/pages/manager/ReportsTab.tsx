import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Play, 
  CheckCircle2, 
  Download, 
  Upload, 
  Send, 
  History,
  AlertCircle,
  Loader2,
  RefreshCw,
  Archive,
  ArrowRight,
  MessageSquare,
  BadgeCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { reportService, type AuditReport } from '@/services/reportService';
import { aiJobsService } from '../../services/aiJobsService';
import { format } from 'date-fns';

interface ReportsTabProps {
  auditId: string;
  auditStatus: string;
  auditName: string;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ auditId, auditStatus: _auditStatus, auditName }) => {
  const queryClient = useQueryClient();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState(0);

  const { data: reports, isLoading: isReportsLoading } = useQuery<AuditReport[]>({
    queryKey: ['reports', auditId],
    queryFn: () => reportService.getReports(auditId),
  });

  const generateMutation = useMutation({
    mutationFn: () => reportService.generateReport(auditId),
    onSuccess: (data) => {
      setActiveJobId(data.jobId);
      setJobProgress(10);
      queryClient.invalidateQueries({ queryKey: ['audit', auditId] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: (reportId: string) => reportService.sendToClient(auditId, reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', auditId] });
      queryClient.invalidateQueries({ queryKey: ['audit', auditId] });
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: (reportId: string) => reportService.finalize(auditId, reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', auditId] });
      queryClient.invalidateQueries({ queryKey: ['audit', auditId] });
    },
  });

  // Polling for AI Job
  useEffect(() => {
    let interval: any;
    if (activeJobId) {
      interval = setInterval(async () => {
        try {
          const job = await aiJobsService.getJob(activeJobId);
          if (job.status === 'completed') {
            setJobProgress(100);
            setActiveJobId(null);
            queryClient.invalidateQueries({ queryKey: ['reports', auditId] });
          } else if (job.status === 'failed') {
            setActiveJobId(null);
            // Handle error
          } else {
            setJobProgress(prev => Math.min(prev + 15, 90));
          }
        } catch (err) {
          setActiveJobId(null);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeJobId, auditId, queryClient]);

  const latestReport = reports?.[0];
  const isGenerating = !!activeJobId;

  if (isReportsLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

  return (
    <div className="space-y-6">
      {/* Phase 1 & 2: Generate & Review */}
      {(!latestReport || activeJobId) && (
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-accent" />
              AI Report Generation
            </CardTitle>
            <CardDescription>
              Generate a comprehensive audit report based on submitted evidence and findings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isGenerating ? (
              <div className="space-y-4 py-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2 font-medium">
                    <RefreshCw size={14} className="animate-spin" />
                    AI is writing your report...
                  </span>
                  <span>{jobProgress}%</span>
                </div>
                <Progress value={jobProgress} className="h-1" />
                <p className="text-xs text-muted-foreground italic">
                  Compiling findings, justifications, and BU metadata into a professional DOCX format.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="bg-white p-4 rounded-lg border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-full text-green-600">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Readiness Checklist</div>
                      <div className="text-xs text-muted-foreground">All mandatory line items are completed.</div>
                    </div>
                  </div>
                  <Button 
                    variant="default" 
                    className="bg-accent hover:bg-accent/90"
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                  >
                    {generateMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Play size={14} className="mr-2" />}
                    Generate Report v1
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Phase 2: Review (Manager View) */}
      {latestReport && !activeJobId && latestReport.status === 'draft' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-2 shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="mb-2 bg-amber-500">Draft v{latestReport.version}</Badge>
                  <CardTitle>Report Review</CardTitle>
                  <CardDescription>Latest generated version ready for your review.</CardDescription>
                </div>
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" onClick={() => reportService.download(auditId, latestReport.id)}>
                     <Download size={14} className="mr-2" /> Download DOCX
                   </Button>
                   <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-accent/5" onClick={() => generateMutation.mutate()}>
                     <RefreshCw size={14} className="mr-2" /> Regenerate
                   </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl bg-muted/5">
                <FileText size={48} className="text-muted-foreground/30 mb-4" />
                <h3 className="font-semibold text-lg">Report File Ready</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center">
                  Review the generated DOCX file. You can edit it locally and re-upload if needed.
                </p>
                <div className="flex gap-4">
                   <Button variant="secondary">
                     <Upload size={14} className="mr-2" /> Upload Edited Version
                   </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3">
                <AlertCircle className="text-blue-500 shrink-0" size={20} />
                <div className="text-sm text-blue-800">
                   <strong>Next Step:</strong> Once you are satisfied with the draft, send it to the client for their formal review and feedback.
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
             <Card className="shadow-sm">
               <CardHeader className="pb-3">
                 <CardTitle className="text-sm flex items-center gap-2">
                   <Send size={14} /> Send to Client
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <p className="text-xs text-muted-foreground">
                   Initiate the client feedback loop. They will be notified to review the report.
                 </p>
                 <Button className="w-full bg-accent" onClick={() => sendMutation.mutate(latestReport.id)} disabled={sendMutation.isPending}>
                   {sendMutation.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : <ArrowRight size={14} className="mr-2" />}
                   Send v{latestReport.version} to Client
                 </Button>
               </CardContent>
             </Card>

             <Card className="shadow-sm">
               <CardHeader className="pb-3">
                 <CardTitle className="text-sm flex items-center gap-2">
                   <History size={14} /> Version History
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <ScrollArea className="h-[200px] pr-4">
                   <div className="space-y-3">
                     {reports?.map((r) => (
                       <div key={r.id} className="text-xs flex items-center justify-between p-2 border rounded hover:bg-muted/50 transition-colors">
                         <div className="flex flex-col">
                           <span className="font-bold">Version {r.version}</span>
                           <span className="text-muted-foreground">{format(new Date(r.createdAt), 'MMM d, h:mm a')}</span>
                         </div>
                         <Badge variant="outline" className="text-[10px] capitalize">{r.status}</Badge>
                       </div>
                     ))}
                   </div>
                 </ScrollArea>
               </CardContent>
             </Card>
          </div>
        </div>
      )}

      {/* Phase 3: Client Review Feedback */}
      {latestReport && latestReport.status === 'sent_for_client_review' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge className="bg-blue-500 mb-2">Awaiting Client Review</Badge>
                <CardTitle>Client Feedback Loop</CardTitle>
                <CardDescription>The report has been sent to {auditName}'s client contacts.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => reportService.download(auditId, latestReport.id)}>
                <Download size={14} className="mr-2" /> Download Sent DOCX
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="p-8 text-center bg-muted/20 rounded-xl border-2 border-dashed italic text-muted-foreground">
                <MessageSquare size={32} className="mx-auto mb-4 opacity-50" />
                Awaiting client feedback per section...
             </div>

             <div className="flex items-center justify-between pt-6 border-t font-semibold">
                <span>Final Review Readiness</span>
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle size={16} />
                  Requires Revision
                </div>
             </div>

             <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => generateMutation.mutate()}>Regenerate (v{latestReport.version + 1})</Button>
                <Button className="bg-accent" onClick={() => finalizeMutation.mutate(latestReport.id)} disabled={finalizeMutation.isPending}>
                  {finalizeMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <BadgeCheck className="mr-2" />}
                  Finalize Audit
                </Button>
             </div>
          </CardContent>
        </Card>
      )}

      {/* Phase 4: Finalized State */}
      {latestReport && latestReport.status === 'final' && (
        <div className="space-y-6">
          <div className="bg-green-600 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Archive size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Audit Finalized & Closed</h3>
                <p className="text-white/80 text-sm">This audit was closed on {format(new Date(latestReport.createdAt), 'MMMM d, yyyy')}</p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => reportService.download(auditId, latestReport.id)}>
              <Download size={14} className="mr-2" /> Download Final Report
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm">Final Document Version</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 p-4 border rounded-xl hover:bg-muted/5 transition-colors cursor-pointer">
                <div className="p-3 bg-accent/10 rounded-lg text-accent">
                   <FileText size={24} />
                </div>
                <div className="flex-1">
                  <div className="font-bold">{latestReport.file?.originalFilename || `Final_Report_${auditName}.docx`}</div>
                  <div className="text-xs text-muted-foreground">Version {latestReport.version} • {format(new Date(latestReport.createdAt), 'MMM d, yyyy')}</div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Final</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
