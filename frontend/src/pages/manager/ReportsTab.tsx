import React, { useState, useEffect, useRef } from 'react';
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
  MessageSquare,
  BadgeCheck,
  XCircle,
  HelpCircle,
  ArrowRight,
  Archive,
  ShieldCheck,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { reportService, type AuditReport } from '@/services/reportService';
import { aiJobsService } from '../../services/aiJobsService';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ComplianceComparisonModal from '@/components/manager/ComplianceComparisonModal';

interface ReportsTabProps {
  auditId: string;
  auditStatus: string;
  auditName: string;
  completionPercentage?: number;
  incompleteMandatoryCount?: number;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ 
  auditId, 
  auditStatus: _auditStatus, 
  auditName, 
  completionPercentage: _completionPercentage = 0, 
  incompleteMandatoryCount = 0 
}) => {
  const queryClient = useQueryClient();
  const [isExporting, setIsExporting] = React.useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState(0);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: reports, isLoading: isReportsLoading } = useQuery<AuditReport[]>({
    queryKey: ['reports', auditId],
    queryFn: () => reportService.getReports(auditId),
  });

  const generateMutation = useMutation({
    mutationFn: () => reportService.generateReport(auditId),
    onSuccess: (data) => {
      setActiveJobId(data.jobId);
      setJobProgress(100); // Start showing progress
      queryClient.invalidateQueries({ queryKey: ['audit', auditId] });
      toast.success('Report generation started');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to start report generation';
      toast.error(msg);
      console.error('Report gen error:', err);
    }
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => reportService.uploadVersion(auditId, latestReport?.id || '', file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', auditId] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: (reportId: string) => reportService.sendToClient(auditId, reportId),
    onSuccess: () => {
      toast.success('Report sent to client for review.');
      queryClient.invalidateQueries({ queryKey: ['reports', auditId] });
      queryClient.invalidateQueries({ queryKey: ['audit', auditId] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to send report to client.';
      toast.error(msg);
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: (reportId: string) => reportService.finalize(auditId, reportId),
    onSuccess: () => {
      toast.success('Audit finalized and closed successfully.');
      queryClient.invalidateQueries({ queryKey: ['reports', auditId] });
      queryClient.invalidateQueries({ queryKey: ['audit', auditId] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to finalize report.';
      toast.error(msg);
    },
  });

  const handleExport = async () => {
    if (!auditId) return;
    setIsExporting(true);
    try {
      await reportService.exportLineItems(auditId, auditName || 'Audit');
      toast.success('Excel file downloaded successfully.');
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to export line items.',
      );
    } finally {
      setIsExporting(false);
    }
  };

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
      {/* Compliance Score Card */}
      {latestReport && !activeJobId && (
        <Card className="shadow-elevated border-none overflow-hidden bg-white">
          <div className="flex flex-col md:flex-row items-stretch">
             <div className={cn(
               "w-full md:w-[260px] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden",
               (latestReport.compliancePercentage || 0) >= 90 ? "bg-emerald-600 text-white" : 
               (latestReport.compliancePercentage || 0) >= 60 ? "bg-amber-500 text-white" : 
               "bg-red-600 text-white"
             )}>
                <div className="absolute top-[-20px] left-[-20px] opacity-10 rotate-12">
                   {(latestReport.compliancePercentage || 0) >= 90 ? <ShieldCheck size={140} /> : <ShieldAlert size={140} />}
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Compliance Score</p>
                <h2 className="text-6xl font-black tracking-tighter mb-2 relative z-10">
                   {latestReport.compliancePercentage?.toFixed(1) || '0.0'}%
                </h2>
                <Badge className="bg-white/20 text-white border-none font-black text-[10px] rounded-full px-4 py-1 uppercase tracking-widest relative z-10 shadow-sm backdrop-blur-md">
                   {(latestReport.compliancePercentage || 0) >= 90 ? 'COMPLIANT' : 
                    (latestReport.compliancePercentage || 0) >= 60 ? 'NEEDS IMPROVEMENT' : 
                    'CRITICAL'}
                </Badge>
             </div>
             
             <div className="flex-1 p-8 flex flex-col justify-between bg-muted/5">
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Assurance Insights</h4>
                      {latestReport.hasPrevious && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 rounded-full px-4 text-[10px] font-black uppercase tracking-widest gap-2 bg-white shadow-sm border border-muted/20 hover:bg-muted/10 transition-all hover:scale-105 active:scale-95"
                          onClick={() => setIsComparisonOpen(true)}
                        >
                           <History size={12} className="text-primary" />
                           View Delta vs Prev. Audit
                        </Button>
                      )}
                   </div>
                   
                   <p className="text-sm font-medium text-dark/70 leading-relaxed max-w-xl">
                      The compliance score is derived from weightage-adjusted responses across all business units. 
                      A score of <strong>{latestReport.compliancePercentage?.toFixed(1)}%</strong> indicates 
                      {(latestReport.compliancePercentage || 0) >= 90 ? " strong adherence to control requirements." : 
                       (latestReport.compliancePercentage || 0) >= 60 ? " partial control gaps that require management attention." : 
                       " significant control deficiencies across high-weightage line items."}
                   </p>
                </div>

                {latestReport.hasPrevious && latestReport.previousCompliancePercentage !== undefined && (
                   <div className="mt-8 pt-6 border-t border-muted/10 flex items-center gap-6">
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-1">Previous Score</span>
                         <span className="text-xl font-bold text-dark/40 italic">{latestReport.previousCompliancePercentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-8 w-px bg-muted/20" />
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-1">Shift</span>
                         <div className="flex items-center gap-2">
                            <span className={cn(
                               "text-xl font-black",
                               (latestReport.compliancePercentage || 0) > latestReport.previousCompliancePercentage ? "text-emerald-600" : 
                               (latestReport.compliancePercentage || 0) < latestReport.previousCompliancePercentage ? "text-red-600" : 
                               "text-dark/40"
                            )}>
                               {Math.abs((latestReport.compliancePercentage || 0) - latestReport.previousCompliancePercentage).toFixed(1)}%
                            </span>
                            {(latestReport.compliancePercentage || 0) > latestReport.previousCompliancePercentage 
                               ? <ArrowUp size={16} className="text-emerald-500" /> 
                               : (latestReport.compliancePercentage || 0) < latestReport.previousCompliancePercentage 
                               ? <ArrowDown size={16} className="text-red-500" />
                               : <Minus size={16} className="text-dark/20" />}
                         </div>
                      </div>
                   </div>
                )}
             </div>
          </div>
        </Card>
      )}

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
                    <div className={`p-2 rounded-full ${incompleteMandatoryCount === 0 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                      {incompleteMandatoryCount === 0 ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <div>
                      <div className="text-sm font-bold">Readiness Checklist</div>
                      <div className="text-xs text-muted-foreground">
                        {incompleteMandatoryCount === 0 
                          ? "All mandatory line items are completed." 
                          : `${incompleteMandatoryCount} mandatory items are still pending.`}
                      </div>
                    </div>
                  </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    disabled={isExporting}
                    className="rounded-full gap-2 border-primary/20 hover:bg-primary/5 text-primary text-xs font-bold"
                  >
                    {isExporting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    Export Line Items
                  </Button>
                  <Button 
                     variant="default" 
                     className="bg-accent hover:bg-accent/90"
                     onClick={() => generateMutation.mutate()}
                     disabled={generateMutation.isPending || incompleteMandatoryCount > 0}
                     data-testid="generate-report-btn"
                   >
                     {generateMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Play size={14} className="mr-2" />}
                     Generate Report v1
                   </Button>
                </div>
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
                   <Button variant="outline" size="sm" onClick={() => reportService.downloadReport(auditId, latestReport.id, `Report_${auditName}_v${latestReport.version}.docx`)} data-testid="download-report-btn">
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
                   <input
                     type="file"
                     ref={fileInputRef}
                     className="hidden"
                     accept=".docx"
                     onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) uploadMutation.mutate(file);
                     }}
                   />
                   <Button 
                    variant="secondary" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                   >
                     {uploadMutation.isPending ? <Loader2 size={14} className="animate-spin mr-2" /> : <Upload size={14} className="mr-2" />}
                     Upload Edited Version
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
      {latestReport && (latestReport.status === 'sent_for_client_review' || latestReport.status === 'feedback_submitted') && (
        <Card className="shadow-sm border-primary/20 bg-white overflow-hidden">
          <CardHeader className="bg-primary/5 border-b">
            <div className="flex justify-between items-start">
              <div>
                <Badge className={cn(
                  "mb-2",
                  latestReport.status === 'feedback_submitted' ? "bg-orange-500" : "bg-blue-500"
                )}>
                  {latestReport.status === 'feedback_submitted' ? 'Feedback Received' : 'Awaiting Client Review'}
                </Badge>
                <CardTitle>Client Feedback Loop</CardTitle>
                <CardDescription>
                  {latestReport.status === 'feedback_submitted' 
                    ? `Client has submitted section-by-section feedback for version ${latestReport.version}.`
                    : `The report has been sent to ${auditName}'s client contacts.`}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => reportService.downloadReport(auditId, latestReport.id, `Report_${auditName}_sent.docx`)} className="rounded-full gap-2">
                <Download size={14} /> Download Sent DOCX
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {latestReport.status === 'sent_for_client_review' ? (
              <div className="p-12 text-center italic text-muted-foreground bg-muted/5">
                <MessageSquare size={32} className="mx-auto mb-4 opacity-50 text-blue-400" />
                <p className="font-medium">Direct review process is underway.</p>
                <p className="text-xs mt-1">Awaiting client feedback per section...</p>
              </div>
            ) : (
              <div className="divide-y border-b">
                {latestReport.feedbacks?.map((f, i) => (
                  <div key={i} className="p-4 flex items-start gap-4 hover:bg-muted/5 transition-colors">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      f.status === 'accepted' ? "bg-green-100 text-green-600" : 
                      f.status === 'requires_revision' ? "bg-red-100 text-red-600" : 
                      "bg-muted text-muted-foreground"
                    )}>
                      {f.status === 'accepted' ? <CheckCircle2 size={16} /> : 
                       f.status === 'requires_revision' ? <XCircle size={16} /> : 
                       <HelpCircle size={16} />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-dark">{f.sectionName}</p>
                        <Badge variant="outline" className={cn(
                          "text-[10px] font-bold uppercase",
                          f.status === 'accepted' ? "border-green-200 text-green-700 bg-green-50" : 
                          f.status === 'requires_revision' ? "border-red-200 text-red-700 bg-red-50" : 
                          "border-muted text-muted-foreground"
                        )}>
                          {f.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      {f.comment && (
                        <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded-md italic">
                          "{f.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between font-bold text-sm">
                 <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Action Recommended</span>
                 <div className="flex items-center gap-2">
                   {latestReport.status === 'feedback_submitted' ? (
                     <div className={cn(
                       "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                       latestReport.feedbacks?.some(f => f.status === 'requires_revision') 
                         ? "bg-red-50 text-red-700 border border-red-100" 
                         : "bg-green-50 text-green-700 border border-green-100"
                     )}>
                       {latestReport.feedbacks?.some(f => f.status === 'requires_revision') 
                         ? <AlertCircle size={14} /> 
                         : <CheckCircle2 size={14} />}
                       {latestReport.feedbacks?.some(f => f.status === 'requires_revision') 
                         ? "Revision Required" 
                         : "Ready for Finalization"}
                     </div>
                   ) : (
                     <span className="text-muted-foreground">Awaiting Input</span>
                   )}
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                 <Button 
                    variant="outline" 
                    className="rounded-full px-6"
                    onClick={() => generateMutation.mutate()}
                 >
                    <RefreshCw size={14} className="mr-2" />
                    Regenerate (v{latestReport.version + 1})
                 </Button>
                 <Button 
                    className="bg-accent hover:bg-accent/90 rounded-full px-8 shadow-md" 
                    onClick={() => {
                        finalizeMutation.mutate(latestReport.id);
                        toast.success('Audit finalized and closed successfully.');
                    }}
                    disabled={finalizeMutation.isPending} 
                    data-testid="finalize-audit-btn"
                 >
                   {finalizeMutation.isPending 
                    ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> 
                    : <BadgeCheck className="mr-2 h-4 w-4" />}
                   Finalize & Close Audit
                 </Button>
              </div>
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
            <Button variant="secondary" onClick={() => reportService.downloadReport(auditId, latestReport.id, `Final_Report_${auditName}.docx`)}>
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

      {/* Comparison Modal */}
      <ComplianceComparisonModal 
        auditId={auditId}
        open={isComparisonOpen}
        onOpenChange={setIsComparisonOpen}
      />
    </div>
  );
};

export default ReportsTab;
