import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientService } from '@/services/clientService';
import { Card, CardContent } from '@/components/ui/card';
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

const ClientAuditList: React.FC = () => {
  const navigate = useNavigate();
  const { data: auditsData, isLoading } = useQuery({
    queryKey: ['client-audits-full'],
    queryFn: () => clientService.getAudits({ limit: 50 }),
  });

  if (isLoading) return <div className="p-8">Loading audits...</div>;

  const audits = auditsData?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Inventory</h1>
        <p className="text-muted-foreground text-sm">Full history of audit projects for your organization.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Audit Project</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.map((audit: any) => (
                <TableRow key={audit.id} data-testid="client-audit-row">
                  <TableCell className="font-semibold">{audit.name}</TableCell>
                  <TableCell>{audit.manager?.fullName}</TableCell>
                  <TableCell>{format(new Date(audit.startDate), 'PPP')}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{audit.status.replace(/_/g, ' ')}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/client/audits/${audit.id}`)}>
                      Explore
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAuditList;
