import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientService } from '@/services/clientService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FileText, Download, CheckCircle, ChevronRight } from 'lucide-react';

const ClientReportsList: React.FC = () => {
  const navigate = useNavigate();
  const { data: reports, isLoading } = useQuery({
    queryKey: ['client-reports'],
    queryFn: () => clientService.getReports(),
  });

  if (isLoading) return <div className="p-8">Loading reports...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report Hub</h1>
        <p className="text-muted-foreground text-sm">Review, feedback, and final sign-off for audit reports.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Audit Project</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Date Received</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(reports as any[])?.map((report: any) => (
                <TableRow key={report.id}>
                  <TableCell className="font-semibold">{report.audit?.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">v{report.version}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(report.createdAt), 'PPP')}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={
                        report.status === 'sent_for_client_review' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-slate-100 text-slate-700'
                      }
                    >
                      {report.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Button variant="ghost" size="icon">
                         <Download className="h-4 w-4" />
                       </Button>
                       <Button 
                         variant={report.status === 'sent_for_client_review' ? 'default' : 'ghost'}
                         size="sm" 
                         className={report.status === 'sent_for_client_review' ? 'bg-[#4f2d7f]' : ''}
                         onClick={() => navigate(`/client/reports/${report.id}/review`)}
                       >
                         {report.status === 'sent_for_client_review' ? 'Start Review' : 'View Feedback'}
                         <ChevronRight className="ml-1 h-4 w-4" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!reports || (reports as any[]).length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-400 italic">
                    No reports shared for review at this time.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientReportsList;
