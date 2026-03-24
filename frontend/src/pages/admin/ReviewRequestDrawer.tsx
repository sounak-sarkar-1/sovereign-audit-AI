import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  X, 
  AlertTriangle, 
  FileText, 
  Upload, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  Building2,
  Calendar
} from 'lucide-react';
import { exceptionalRequestService } from '@/services/exceptionalRequestService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReviewRequestDrawerProps {
  requestId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewRequestDrawer({ requestId, onClose, onSuccess }: ReviewRequestDrawerProps) {
  const [adminComment, setAdminComment] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const { data: request, isLoading } = useQuery({
    queryKey: ['exceptional-request-detail', requestId],
    queryFn: () => exceptionalRequestService.getRequestDetail(requestId),
  });

  const approveMutation = useMutation({
    mutationFn: (formData: FormData) => exceptionalRequestService.approveRequest(requestId, formData),
    onSuccess: () => {
      toast.success('Request approved successfully');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve request');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (comment: string) => exceptionalRequestService.rejectRequest(requestId, comment),
    onSuccess: () => {
      toast.success('Request rejected successfully');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    },
  });

  const handleApprove = () => {
    if (!evidenceFile) {
      toast.error('Evidence file is required for approval');
      return;
    }
    const formData = new FormData();
    formData.append('evidence', evidenceFile);
    if (adminComment) {
      formData.append('adminComment', adminComment);
    }
    approveMutation.mutate(formData);
  };

  const handleReject = () => {
    if (!adminComment || adminComment.length < 10) {
      toast.error('A rejection comment (min 10 chars) is required');
      return;
    }
    rejectMutation.mutate(adminComment);
  };

  if (isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-dark shadow-2xl border-l border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white">Review Request</h2>
              {request?.status === 'pending' && <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">Pending</Badge>}
            </div>
            <p className="text-sm text-white/50">ID: {requestId}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/40 hover:text-white">
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Action Type Banner */}
          <div className={cn(
            "p-4 rounded-xl border flex items-start gap-4",
            request?.actionType === 'delete' 
              ? "bg-red-500/10 border-red-500/20 text-red-500" 
              : "bg-blue-500/10 border-blue-500/20 text-blue-500"
          )}>
            <div className="mt-0.5">
              {request?.actionType === 'delete' ? <AlertTriangle size={20} /> : <Clock size={20} />}
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-wide text-xs mb-1">
                Requested Action: {request?.actionType === 'delete' ? 'Permanently Delete Audit' : 'Reopen Closed Audit'}
              </h3>
              <p className="text-sm opacity-80 leading-relaxed">
                {request?.actionType === 'delete' 
                  ? "This action will soft-delete the audit and all its data. It will no longer be visible to managers or auditors." 
                  : "This will restore a previously closed or deleted audit to the 'reopened' status for further work."}
              </p>
            </div>
          </div>

          {/* Audit & Request Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-white/40 mb-2">
                <FileText size={14} />
                <span className="text-xs uppercase tracking-wider font-semibold">Audit</span>
              </div>
              <p className="text-white font-medium">{request?.audit?.name}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-white/40 mb-2">
                <User size={14} />
                <span className="text-xs uppercase tracking-wider font-semibold">Requested By</span>
              </div>
              <p className="text-white font-medium">{request?.requester?.fullName}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-white/40 mb-2">
                <Building2 size={14} />
                <span className="text-xs uppercase tracking-wider font-semibold">Client</span>
              </div>
              <p className="text-white font-medium">{request?.audit?.client?.fullName || 'N/A'}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-white/40 mb-2">
                <Calendar size={14} />
                <span className="text-xs uppercase tracking-wider font-semibold">Date</span>
              </div>
              <p className="text-white font-medium">{format(new Date(request?.createdAt), 'MMM d, yyyy HH:mm')}</p>
            </div>
          </div>

          {/* Justification */}
          <div>
            <h4 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Manager's Justification</h4>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-white leading-relaxed italic">
              "{request?.justification}"
            </div>
          </div>

          {request?.status === 'pending' ? (
            <div className="space-y-6 pt-4 border-t border-white/10">
              {/* Evidence Upload */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Upload size={16} className="text-accent" />
                  Mandatory Evidence File
                </h4>
                <div className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                  evidenceFile ? "border-accent/50 bg-accent/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
                )}>
                  <input
                    type="file"
                    id="evidence"
                    className="hidden"
                    onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="evidence" className="cursor-pointer block">
                    {evidenceFile ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle className="text-accent mb-2" size={32} />
                        <span className="text-white font-medium">{evidenceFile.name}</span>
                        <span className="text-white/40 text-xs mt-1">Click to change file</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="text-white/20 mb-2" size={32} />
                        <span className="text-white/60 font-medium">Click to upload evidence</span>
                        <span className="text-white/30 text-xs mt-1">Required for approval</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Admin Comment */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Admin Comments</h4>
                <Textarea
                  placeholder="Enter notes or rejection reason..."
                  className="bg-white/5 border-white/10 text-white h-32"
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                />
              </div>
            </div>
          ) : (
             <div className="space-y-6 pt-4 border-t border-white/10">
                <div>
                   <h4 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-2">Decision Result</h4>
                   <div className={cn(
                     "p-4 rounded-xl border flex items-center gap-3",
                     request?.status === 'approved' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                   )}>
                      {request?.status === 'approved' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                      <span className="font-bold capitalize">{request?.status}</span>
                   </div>
                </div>
                {request?.adminComment && (
                  <div>
                    <h4 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-2">Admin Feedback</h4>
                    <p className="text-white opacity-80">{request.adminComment}</p>
                  </div>
                )}
             </div>
          )}
        </div>

        {/* Footer Actions */}
        {request?.status === 'pending' && (
          <div className="p-6 border-t border-white/10 bg-white/5 flex gap-3">
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={handleReject}
              disabled={rejectMutation.isPending || approveMutation.isPending}
            >
              {rejectMutation.isPending ? 'Processing...' : 'Reject Request'}
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
              onClick={handleApprove}
              disabled={rejectMutation.isPending || approveMutation.isPending}
            >
              {approveMutation.isPending ? 'Processing...' : 'Approve & Execute'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
