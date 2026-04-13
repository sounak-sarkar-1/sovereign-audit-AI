import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  Download, 
  MessageSquare, 
  FileSearch,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { clientService } from '@/services/clientService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';


// Removed ReportFeedbackDialog import

const ReportReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['client-report', id],
    queryFn: () => clientService.getReportDetail(id!),
    enabled: !!id,
  });

  // Removed finalizeMutation

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
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-dark">Report Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            The report you are looking for might have been moved, deleted, or you don't have permission to access it.
          </p>
        </div>
        <Button onClick={() => navigate('/client/reports')} variant="outline" className="rounded-full px-8">
          Back to Reports List
        </Button>
      </div>
    );
  }

  const currentStatus = report.status;
  const auditName = report.audit?.name || "Audit Engagement";
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 hover:bg-transparent text-muted-foreground hover:text-dark mb-1"
            onClick={() => navigate('/client/reports')}
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Reports
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-dark">{auditName} — Audit Report</h1>
            <Badge className={cn(
               currentStatus === 'final' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100',
               "rounded-full border-none px-3 capitalize"
            )}>
              {currentStatus === 'final' ? 'Final Report' : 'Draft for Review'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 rounded-full font-bold"
                onClick={() => clientService.downloadReport(id!, `${auditName}_Report.docx`)}
            >
              <Download size={16} /> Download Report (DOCX)
            </Button>
            {currentStatus === 'sent_for_client_review' && (
              <Button size="sm" className="gap-2 rounded-full bg-primary" onClick={() => navigate(`/client/reports/${id}/feedback`)}>
                <MessageSquare size={16} /> Submit Feedback
              </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card className="shadow-card border-none bg-white p-6 min-h-[800px] flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground">
                <FileSearch size={40} />
             </div>
             <div className="space-y-1">
                <h3 className="text-xl font-bold text-dark">Document Viewer</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                   The secure PDF viewer is loading. In production, this would render a paginated preview of the report content.
                </p>
             </div>
              <Button 
                 variant="outline" 
                 className="rounded-full shadow-sm"
                  onClick={() => clientService.downloadReport(id!, `${auditName}_Report.docx`)}
              >
                 Download to View In Browser
              </Button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-card border-none bg-white overflow-hidden">
            <CardHeader className="bg-muted/30 border-b p-5">
              <CardTitle className="text-lg">Report Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Version</p>
                <p className="text-sm font-bold text-dark">v{report.version}.0</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Generated On</p>
                <p className="text-sm font-bold text-dark">{format(new Date(report.createdAt), 'MMMM dd, yyyy')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Status</p>
                <div className="pt-1">
                  <Badge className={cn(
                    currentStatus === 'final' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
                    currentStatus === 'feedback_submitted' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' :
                    'bg-blue-100 text-blue-700 hover:bg-blue-100',
                    "rounded-full border-none px-3 capitalize"
                  )}>
                    {currentStatus.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
              
              {currentStatus === 'sent_for_client_review' && (
                <div className="pt-4 border-t border-dashed">
                  <Button 
                    className="w-full rounded-full bg-primary hover:bg-primary/90 gap-2 h-11 font-bold shadow-sm"
                    onClick={() => navigate(`/client/reports/${id}/feedback`)}
                  >
                    <MessageSquare size={16} /> Submit Feedback
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deleted ReportFeedbackDialog */}
    </div>
  );
};

export default ReportReview;
