import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  Download, 
  MessageSquare, 
  FileSearch,
  CheckCircle
} from 'lucide-react';
import { clientService } from '@/services/clientService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

import ReportFeedbackDialog from './ReportFeedbackDialog';

const ReportReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  const { data: report, isLoading } = useQuery({
    queryKey: ['client-report', id],
    queryFn: () => clientService.getReportDetail(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  if (!report) return <div className="p-12 text-center text-muted-foreground">Report not found.</div>;

  const currentStatus = report.status;
  
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
            <h1 className="text-3xl font-bold tracking-tight text-dark">{report.audit.name} — Audit Report</h1>
            <Badge className={cn(
               currentStatus === 'final' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            )}>
              {currentStatus === 'final' ? 'Final Report' : 'Draft for Review'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 rounded-full"
                onClick={() => clientService.downloadReport(id!, `${report.audit.name}_Report.pdf`)}
            >
              <Download size={16} /> Download PDF
            </Button>
            {currentStatus !== 'final' && (
              <Button size="sm" className="gap-2 rounded-full bg-primary" onClick={() => setIsFeedbackDialogOpen(true)} data-testid="submit-feedback-btn">
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
                onClick={() => clientService.downloadReport(id!, `${report.audit.name}_Report.pdf`)}
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
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Audit Period</p>
                <p className="text-sm font-bold text-dark">Q1 2024</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-none bg-accent/5 border border-accent/10">
            <CardContent className="p-5 space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-dark">Executive Sign-off</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-tight">Pending Approval</p>
                  </div>
               </div>
               <p className="text-xs text-muted-foreground leading-relaxed">
                  Once findings have been reviewed, the Executive Sponsor can sign off on the final report version.
               </p>
               <Button variant="outline" className="w-full rounded-full border-accent/20 text-accent hover:bg-accent/10" disabled>
                  Sign Final Report
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReportFeedbackDialog 
        report={report}
        open={isFeedbackDialogOpen}
        onOpenChange={setIsFeedbackDialogOpen}
      />
    </div>
  );
};

export default ReportReview;

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
