import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Download, 
  Search, 
  Filter, 
  Eye,
  Building2,
  User,
  X
} from 'lucide-react';
import { adminAuditService } from '@/services/adminAuditService';
import type { AuditFilterParams } from '@/services/adminAuditService';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

export default function AuditOversight() {
  const [filters, setFilters] = useState<AuditFilterParams>({
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });

  const { data: audits, isLoading } = useQuery({
    queryKey: ['admin-audits', filters],
    queryFn: () => adminAuditService.getAudits(filters),
  });

  const handleExport = () => {
    adminAuditService.exportAudits(filters);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'draft';
      case 'in_progress': return 'inProgress';
      case 'under_manager_review': return 'underReview';
      case 'pending_client_review': return 'pendingClient';
      case 'closed': return 'closed';
      case 'reopened': return 'default';
      case 'deleted': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center text-[10px] uppercase tracking-widest font-bold text-bg-muted gap-2">
            <Eye size={12} className="opacity-50" />
            <span>System Administration</span>
          </div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">Audit Oversight</h1>
          <p className="text-sm text-bg-muted font-medium">System-wide monitoring and compliance reporting.</p>
        </div>
        <Button 
          onClick={handleExport}
          className="rounded-full shadow-elevated h-11 px-6 font-bold"
        >
          <Download className="mr-2 h-4 w-4" />
          EXPORT CSV
        </Button>
      </div>

      <Card className="overflow-hidden border-bg-mid dark:border-[#3d2a5a] bg-white dark:bg-[#1a0d35] shadow-card">
        {/* Filters Bar */}
        <div className="p-4 border-b border-bg-mid dark:border-[#3d2a5a] bg-bg-warm/30 dark:bg-[#2d1f45]/30 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-bg-muted" size={18} />
            <Input
              placeholder="Search by audit name or ID..."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 h-10 border-bg-mid dark:border-[#3d2a5a] bg-white dark:bg-[#1a0d35]"
            />
          </div>

          <Select 
            value={filters.status || 'all'} 
            onValueChange={(val) => setFilters(prev => ({ ...prev, status: val === 'all' ? undefined : val }))}
          >
            <SelectTrigger className="w-48 h-10 border-bg-mid dark:border-[#3d2a5a] bg-white dark:bg-[#1a0d35]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="under_manager_review">Manager Review</SelectItem>
              <SelectItem value="pending_client_review">Client Review</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="reopened">Reopened</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="h-10 rounded-full border-bg-mid px-4 font-medium">
            <Filter className="mr-2 h-4 w-4" />
            ADVANCED
          </Button>
          
          {(filters.search || filters.status) && (
            <Button 
              variant="ghost" 
              className="h-10 text-bg-muted hover:text-dark dark:hover:text-white"
              onClick={() => setFilters({ sortBy: 'createdAt', sortOrder: 'DESC' })}
            >
              <X className="mr-2 h-4 w-4" />
              RESET
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-bg-mid dark:border-[#3d2a5a] text-[10px] uppercase tracking-wider text-bg-muted font-bold bg-bg-warm/50 dark:bg-[#2d1f45]/50">
                <th className="px-6 py-4">Audit Details</th>
                <th className="px-6 py-4">Stakeholders</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Timeline</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-mid/50 dark:divide-[#3d2a5a]/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
                  </td>
                </tr>
              ) : audits?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center text-bg-muted font-medium italic">
                    No audits found matching your current filters.
                  </td>
                </tr>
              ) : (
                audits?.map((audit: any) => (
                  <tr key={audit.id} className={cn(
                    "hover:bg-bg-warm/30 dark:hover:bg-accent/5 transition-colors group",
                    audit.deletedAt && "opacity-60"
                  )}>
                    <td className="px-6 py-5">
                      <div className="font-bold text-dark dark:text-white group-hover:text-primary transition-colors">
                        {audit.name}
                      </div>
                      <div className="text-[10px] text-bg-muted font-mono uppercase mt-0.5">{audit.id}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-dark/80 dark:text-bg-mid">
                          <Building2 size={12} className="text-bg-muted" />
                          {audit.client?.fullName || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-bg-muted">
                          <User size={12} className="opacity-60" />
                          {audit.manager?.fullName || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <Badge variant={getStatusVariant(audit.status)} className="capitalize font-bold py-0 h-6">
                        {audit.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                       <div className="space-y-1">
                          <div className="text-xs font-bold text-dark/70 dark:text-bg-mid">
                            {audit.startDate ? format(new Date(audit.startDate), 'MMM d, yyyy') : 'NOT STARTED'}
                          </div>
                          <div className="text-[10px] text-bg-muted">
                            Created {format(new Date(audit.createdAt), 'MMM d, yyyy')}
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Button variant="outline" size="sm" className="rounded-full border-bg-mid font-bold text-[10px] h-8 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        VIEW DETAILS
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-bg-mid dark:border-[#3d2a5a] bg-bg-warm/20 dark:bg-[#1a0d35] flex items-center justify-between text-[11px] font-bold text-bg-muted uppercase tracking-wider">
          <div>System Registry: {audits?.length || 0} active engagements</div>
          <div className="flex items-center gap-2">
            <span className="opacity-50">Filter Mode:</span>
            <span className="text-primary">{filters.status ? filters.status.toUpperCase() : 'ALL RECORD TYPES'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
