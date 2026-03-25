import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { clientService } from '@/services/clientService';
import { toast } from 'sonner';

interface ReportFeedbackDialogProps {
  report: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReportFeedbackDialog: React.FC<ReportFeedbackDialogProps> = ({ 
  report, 
  open, 
  onOpenChange 
}) => {
  const [feedback, setFeedback] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    
    setIsPending(true);
    try {
      // The API expects an array of feedback items in some variations, 
      // but here we send a simple object wrapped in an array for compatibility
      await clientService.submitReportFeedback(report.id, [{ 
        type: 'general',
        comment: feedback,
        createdAt: new Date().toISOString()
      }]);
      
      toast.success('Feedback submitted successfully');
      setFeedback('');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-none shadow-elevated rounded-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquare size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-dark">Submit Report Feedback</DialogTitle>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-tight">Requirement ID: {report.audit?.id?.substring(0, 8)}</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 flex gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-blue-500" />
            <p className="font-medium leading-relaxed">
              Your feedback will be shared with the audit manager and assigned auditors. 
              Use this to clarify findings or provide additional evidence before the report is finalized.
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="feedback" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
              Feedback Narrative
            </Label>
            <Textarea 
              id="feedback" 
              value={feedback} 
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide specific feedback on findings, observations, or general report structure..."
              className="min-h-[180px] rounded-2xl border-muted/30 focus:border-primary transition-all shadow-sm"
              required
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:px-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isPending}
            className="flex-1 rounded-full border-muted-foreground/30 font-bold uppercase tracking-widest text-[10px] h-10"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isPending || !feedback.trim()}
            className="flex-1 rounded-full bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px] h-10 shadow-elevated"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportFeedbackDialog;
