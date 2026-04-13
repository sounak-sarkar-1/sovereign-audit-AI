import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  Download, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Loader2,
  AlertCircle,
  Send
} from 'lucide-react';
import { clientService } from '@/services/clientService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

type FeedbackStatus = 'accepted' | 'requires_revision' | 'no_comment';

interface SectionFeedback {
  sectionName: string;
  status: FeedbackStatus;
  comment: string;
}

const FIXED_SECTIONS = [
  'Executive Summary',
  'Scope & Methodology',
  'Findings by Business Unit',
  'Exception Summary',
  'Recommendations'
];

const ReportFeedbackForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [feedback, setFeedback] = useState<Record<string, SectionFeedback>>(
    FIXED_SECTIONS.reduce((acc, section) => ({
      ...acc,
      [section]: { sectionName: section, status: 'no_comment', comment: '' }
    }), {})
  );

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['client-report', id],
    queryFn: () => clientService.getReportDetail(id!),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: (feedbackArray: SectionFeedback[]) => clientService.submitReportFeedback(id!, feedbackArray),
    onSuccess: () => {
      toast.success('Feedback submitted. The manager has been notified.');
      queryClient.invalidateQueries({ queryKey: ['client-report', id] });
      navigate('/client/reports');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading report details...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-6 text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-dark">Report Not Found</h2>
        <Button onClick={() => navigate('/client/reports')} variant="outline" className="rounded-full px-8">
          Back to Reports List
        </Button>
      </div>
    );
  }

  const isReadOnly = report.status === 'feedback_submitted' || report.status === 'final';
  const auditName = report.audit?.name || "Audit Engagement";

  const handleStatusChange = (section: string, status: FeedbackStatus) => {
    if (isReadOnly) return;
    setFeedback(prev => ({
      ...prev,
      [section]: { ...prev[section], status }
    }));
  };

  const handleCommentChange = (section: string, comment: string) => {
    if (isReadOnly) return;
    setFeedback(prev => ({
      ...prev,
      [section]: { ...prev[section], comment }
    }));
  };

  const handleSubmit = () => {
    const feedbackArray = Object.values(feedback);
    
    // Validate: "Requires Revision" must have a comment
    const missingComments = feedbackArray.filter(f => f.status === 'requires_revision' && !f.comment.trim());
    if (missingComments.length > 0) {
      toast.error(`Please provide a comment for sections needing revision: ${missingComments.map(m => m.sectionName).join(', ')}`);
      return;
    }

    submitMutation.mutate(feedbackArray);
  };

  const stats = Object.values(feedback).reduce((acc, f) => {
    acc[f.status]++;
    return acc;
  }, { accepted: 0, requires_revision: 0, no_comment: 0 });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 hover:bg-transparent text-muted-foreground hover:text-dark"
          onClick={() => navigate(`/client/reports/${id}`)}
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to Report Review
        </Button>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-dark">Report Feedback</h1>
            <p className="text-muted-foreground">Submit structured feedback for individual sections of the draft report.</p>
          </div>
          <Badge className={cn(
            isReadOnly ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700",
            "rounded-full px-3 py-1 text-xs font-bold uppercase"
          )}>
            {report.status.replace(/_/g, ' ')}
          </Badge>
        </div>
      </div>

      {isReadOnly && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-4 text-orange-800">
          <AlertCircle className="shrink-0" size={24} />
          <p className="text-sm font-medium">
            Feedback was submitted on {format(new Date(report.updatedAt || report.createdAt), 'PPp')}. The manager is reviewing your input.
          </p>
        </div>
      )}

      {/* Download Reminder */}
      <Card className="shadow-sm border-primary/20 bg-primary/5">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-primary">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Download size={24} />
            </div>
            <div>
              <h3 className="font-bold">Download Draft Report</h3>
              <p className="text-sm opacity-90">Review the full DOCX version before providing feedback.</p>
            </div>
          </div>
          <Button 
            variant="default" 
            className="rounded-full px-6 bg-primary"
            onClick={() => clientService.downloadReport(id!, `${auditName}_Report_Draft.docx`)}
          >
            <Download size={18} className="mr-2" /> Download DOCX
          </Button>
        </CardContent>
      </Card>

      {/* Accordion List */}
      <Accordion type="single" collapsible className="space-y-4 border-none">
        {FIXED_SECTIONS.map((section) => {
          const s = feedback[section];
          return (
            <AccordionItem key={section} value={section} className="border rounded-xl bg-white shadow-sm overflow-hidden px-0">
              <AccordionTrigger className="hover:no-underline p-4 px-6 group data-[state=open]:bg-muted/30">
                <div className="flex items-center justify-between w-full pr-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      s.status === 'accepted' ? "bg-green-100 text-green-600" : 
                      s.status === 'requires_revision' ? "bg-red-100 text-red-600" : 
                      "bg-muted text-muted-foreground"
                    )}>
                      {s.status === 'accepted' ? <CheckCircle2 size={18} /> : 
                       s.status === 'requires_revision' ? <XCircle size={18} /> : 
                       <HelpCircle size={18} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-dark">{section}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{s.status.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(
                    "ml-auto font-medium py-0 h-6",
                    s.status === 'accepted' ? "border-green-200 text-green-700 bg-green-50" : 
                    s.status === 'requires_revision' ? "border-red-200 text-red-700 bg-red-50" : 
                    "border-muted text-muted-foreground bg-muted/20"
                  )}>
                    {s.status === 'accepted' ? 'Accepted ✓' : 
                     s.status === 'requires_revision' ? 'Revision Need ✗' : 
                     'No Comment'}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-2 space-y-6">
                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Decision</h5>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { id: 'accepted', label: 'Accepted ✓', color: 'peer-checked:bg-green-50 peer-checked:border-green-500' },
                      { id: 'requires_revision', label: 'Requires Revision ✗', color: 'peer-checked:bg-red-50 peer-checked:border-red-500' },
                      { id: 'no_comment', label: 'No Comment', color: 'peer-checked:bg-muted/50 peer-checked:border-muted-foreground' }
                    ].map((opt) => (
                      <label 
                        key={opt.id} 
                        className={cn(
                          "relative cursor-pointer transition-all",
                          isReadOnly && "pointer-events-none opacity-50"
                        )}
                      >
                        <input 
                          type="radio" 
                          name={`status-${section}`} 
                          className="peer sr-only" 
                          checked={s.status === opt.id}
                          onChange={() => handleStatusChange(section, opt.id as FeedbackStatus)}
                        />
                        <div className={cn(
                          "px-6 py-2 rounded-full border border-muted font-bold text-sm text-center",
                          opt.color,
                          s.status === opt.id ? "bg-white" : "hover:bg-muted/20"
                        )}>
                          {opt.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      Comments {s.status === 'requires_revision' && <span className="text-red-500">*</span>}
                    </h5>
                  </div>
                  <Textarea 
                    placeholder={s.status === 'requires_revision' ? "Specify what revisions are required for this section..." : "Optional comments..."}
                    className="min-h-[120px] rounded-xl resize-none focus-visible:ring-primary/20"
                    value={s.comment}
                    disabled={isReadOnly}
                    onChange={(e) => handleCommentChange(section, e.target.value)}
                  />
                  {s.status === 'requires_revision' && !s.comment.trim() && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Required for revisions</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Sticky Footer */}
      {!isReadOnly && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t p-6 flex justify-center z-10">
          <div className="max-w-4xl w-full flex items-center justify-between">
            <div className="hidden md:flex gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-100 rounded-full text-[10px] font-bold text-green-700">
                <CheckCircle2 size={12} /> {stats.accepted} Accepted
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-100 rounded-full text-[10px] font-bold text-red-700">
                <XCircle size={12} /> {stats.requires_revision} Revisions
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  className="rounded-full bg-primary hover:bg-primary/90 px-10 h-12 font-bold shadow-lg gap-2 ml-auto"
                >
                  <Send size={18} /> Submit All Feedback
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl font-bold">Submit Report Feedback?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-4 pt-4">
                    <p>Current Summary:</p>
                    <div className="grid grid-cols-1 gap-2">
                       <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                          <span className="font-bold text-green-700">{stats.accepted} Sections Accepted</span>
                          <CheckCircle2 className="text-green-600" size={18} />
                       </div>
                       <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                          <span className="font-bold text-red-700">{stats.requires_revision} Require Revision</span>
                          <XCircle className="text-red-600" size={18} />
                       </div>
                       <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                          <span className="font-bold text-muted-foreground">{stats.no_comment} with No Comment</span>
                          <HelpCircle className="text-muted-foreground" size={18} />
                       </div>
                    </div>
                    <p className="pt-2">Are you sure you want to submit this feedback to the lead manager? This will lock the form for further changes.</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="pt-6">
                  <AlertDialogCancel className="rounded-full border-muted text-muted-foreground font-bold hover:bg-muted/10">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="rounded-full bg-primary hover:bg-primary/90 font-bold px-8"
                    onClick={handleSubmit}
                  >
                    Confirm & Submit
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFeedbackForm;
