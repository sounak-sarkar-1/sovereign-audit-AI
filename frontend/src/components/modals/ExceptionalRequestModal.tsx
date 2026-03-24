import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AlertTriangle, 
  RotateCcw, 
  Trash2, 
  Loader2,
  Info 
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { exceptionalRequestService, ExceptionalActionType } from '@/services/exceptionalRequestService';
import { toast } from 'sonner';

interface ExceptionalRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditId: string;
  auditName: string;
  actionType: ExceptionalActionType;
}

const ExceptionalRequestModal: React.FC<ExceptionalRequestModalProps> = ({ 
  isOpen, 
  onClose, 
  auditId, 
  auditName, 
  actionType 
}) => {
  const queryClient = useQueryClient();
  const [justification, setJustification] = useState('');

  const mutation = useMutation({
    mutationFn: () => exceptionalRequestService.createRequest(auditId, actionType, justification),
    onSuccess: () => {
      toast.success(`Request submitted: Your request to ${actionType} audit "${auditName}" has been sent for admin review.`);
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.invalidateQueries({ queryKey: ['audit', auditId] });
      onClose();
      setJustification('');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit request';
      toast.error(message);
    }
  });

  const isDelete = actionType === ExceptionalActionType.DELETE;
  const isValid = justification.length >= 20 && justification.length <= 2000;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-full ${isDelete ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              {isDelete ? <Trash2 size={20} /> : <RotateCcw size={20} />}
            </div>
            <DialogTitle>Request Audit {isDelete ? 'Deletion' : 'Reopening'}</DialogTitle>
          </div>
          <DialogDescription>
            Audit: <span className="font-semibold text-foreground">{auditName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 text-sm">
          {isDelete ? (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900">
              <AlertTriangle className="h-4 w-4" color="#991b1b" />
              <AlertTitle>Critical Information</AlertTitle>
              <AlertDescription className="text-xs">
                Deleting an audit is permanent. All findings, evidence, and trail logs will be archived or removed. This action requires high-level administrative approval.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-blue-50 border-blue-200 text-blue-900">
              <Info className="h-4 w-4" color="#1e40af" />
              <AlertTitle>Reopening Audit</AlertTitle>
              <AlertDescription className="text-xs">
                Reopening a closed audit allows further evidence collection and report revisions. This will reset the audit status and notify all stakeholders.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              Business Justification <span className="text-red-500">*</span>
            </label>
            <Textarea 
              placeholder="Provide a detailed reason for this exceptional request (min 20 characters)..." 
              className="resize-none h-32"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              minLength={20}
              maxLength={2000}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Min 20 characters</span>
              <span className={justification.length > 2000 ? 'text-red-500' : ''}>
                {justification.length} / 2000
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button 
            variant={isDelete ? "destructive" : "default"} 
            className={!isDelete ? "bg-accent hover:bg-accent/90" : ""}
            onClick={() => mutation.mutate()}
            disabled={!isValid || mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExceptionalRequestModal;
