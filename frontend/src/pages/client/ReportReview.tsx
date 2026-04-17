import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  Download,
  MessageSquare,
  FileSearch,
  Loader2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { clientService } from '@/services/clientService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ComplianceComparisonModal from '@/components/client/ComplianceComparisonModal';


// Removed ReportFeedbackDialog import

const ReportReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = React.useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = React.useState(false);

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['client-report', id],
    queryFn: () => clientService.getReportDetail(id!),
    enabled: !!id,
  });

  // Removed finalizeMutation

  const handleDownload = () => {
    clientService.downloadReport(id!, `${auditName}_Report.docx`);
  };

  const handleExport = async () => {
    if (!report?.auditId) return;
    setIsExporting(true);
    try {
      await clientService.exportLineItems(report.auditId, auditName);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

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
  const auditData = report.audit;

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
              onClick={handleDownload}
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

              {auditData?.compliancePercentage !== null && auditData?.compliancePercentage !== undefined && (
                <div className="pt-4 border-t border-dashed space-y-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Compliance Score</p>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-3xl font-black",
                      auditData.compliancePercentage >= 90 ? "text-emerald-600" :
                        auditData.compliancePercentage >= 60 ? "text-amber-500" :
                          "text-red-600"
                    )}>
                      {auditData.compliancePercentage.toFixed(1)}%
                    </span>
                    <Badge variant="outline" className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      auditData.compliancePercentage >= 90 ? "border-emerald-200 text-emerald-700 bg-emerald-50" :
                        auditData.compliancePercentage >= 60 ? "border-amber-200 text-amber-700 bg-amber-50" :
                          "border-red-200 text-red-700 bg-red-50"
                    )}>
                      {auditData.compliancePercentage >= 90 ? 'Compliant' :
                        auditData.compliancePercentage >= 60 ? 'Needs Imp.' :
                          'Critical'}
                    </Badge>
                  </div>
                  {auditData.hasPrevious && auditData.previousCompliancePercentage !== null && (
                    <div
                      className="flex items-center justify-between text-[10px] bg-muted/20 p-2 rounded-lg cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() => setIsComparisonOpen(true)}
                    >
                      <span className="font-bold text-muted-foreground uppercase">Shift vs Prev.</span>
                      <div className="flex items-center gap-1">
                        <span className="font-black">
                          {Math.abs(auditData.compliancePercentage - auditData.previousCompliancePercentage).toFixed(1)}%
                        </span>
                        {auditData.compliancePercentage > auditData.previousCompliancePercentage ? (
                          <ArrowUp size={10} className="text-emerald-600" />
                        ) : auditData.compliancePercentage < auditData.previousCompliancePercentage ? (
                          <ArrowDown size={10} className="text-red-600" />
                        ) : (
                          <Minus size={10} className="text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStatus === 'sent_for_client_review' && (
                <div className="pt-4 border-t border-dashed space-y-2">
                  <Button
                    className="w-full rounded-full bg-primary hover:bg-primary/90 gap-2 h-11 font-bold shadow-sm"
                    onClick={() => navigate(`/client/reports/${id}/feedback`)}
                  >
                    <MessageSquare size={16} /> Submit Feedback
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      className="flex-1 rounded-full text-[10px] font-black uppercase tracking-widest gap-2"
                    >
                      <Download size={14} /> Download (DOCX)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExport}
                      disabled={isExporting}
                      className="flex-1 rounded-full text-[10px] font-black uppercase tracking-widest gap-2 bg-white/50"
                    >
                      {isExporting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Download size={14} />
                      )}
                      Export (XLSX)
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comparison Modal */}
      {report.auditId && (
        <ComplianceComparisonModal
          auditId={report.auditId}
          open={isComparisonOpen}
          onOpenChange={setIsComparisonOpen}
        />
      )}
    </div>
  );
};

export default ReportReview;
