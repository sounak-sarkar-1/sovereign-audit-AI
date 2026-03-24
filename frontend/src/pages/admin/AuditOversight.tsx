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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      draft: "bg-white/10 text-white/60 border-white/5",
      in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      under_manager_review: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      pending_client_review: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      closed: "bg-green-500/10 text-green-500 border-green-500/20",
      reopened: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      deleted: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return (
      <Badge variant="outline" className={cn("capitalize px-2 py-0 border", variants[status] || variants.draft)}>
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Eye className="text-accent" />
            Audit Oversight
          </h1>
          <p className="text-white/60">Comprehensive system-wide audit monitoring and reporting.</p>
        </div>
        <Button 
          onClick={handleExport}
          className="bg-accent hover:bg-accent/80 text-white font-bold shadow-lg shadow-accent/20"
        >
          <Download className="mr-2" size={18} />
          Export All as CSV
        </Button>
      </div>

      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col">
        {/* Filters Bar */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <Input
              placeholder="Search by audit name..."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 bg-dark border-white/10 text-white"
            />
          </div>

          <Select 
            value={filters.status || 'all'} 
            onValueChange={(val) => setFilters(prev => ({ ...prev, status: val === 'all' ? undefined : val }))}
          >
            <SelectTrigger className="w-44 bg-dark border-white/10 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-dark border-white/10 text-white">
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

          <Button variant="outline" className="text-white border-white/10 hover:bg-white/5">
            <Filter className="mr-2" size={16} />
            Advanced
          </Button>
          
          {(filters.search || filters.status) && (
            <Button 
              variant="ghost" 
              className="text-white/40 hover:text-white"
              onClick={() => setFilters({ sortBy: 'createdAt', sortOrder: 'DESC' })}
            >
              <X className="mr-2" size={16} />
              Reset
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/50 font-bold bg-white/5">
                <th className="px-6 py-4">Audit Name</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Manager</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                  </td>
                </tr>
              ) : audits?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-white/30">
                    No audits found matching your filters.
                  </td>
                </tr>
              ) : (
                audits?.map((audit: any) => (
                  <tr key={audit.id} className={cn(
                    "hover:bg-white/5 transition-colors group",
                    audit.deletedAt && "opacity-60 grayscale-[0.5]"
                  )}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white group-hover:text-accent transition-colors">
                        {audit.name}
                      </div>
                      <div className="text-[10px] text-white/30 truncate max-w-[200px]">{audit.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white/80">
                        <Building2 size={14} className="text-white/30" />
                        {audit.client?.fullName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white/80">
                        <User size={14} className="text-white/30" />
                        {audit.manager?.fullName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/60">
                      {audit.startDate ? format(new Date(audit.startDate), 'MMM d, yyyy') : 'Not Set'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(audit.status)}
                    </td>
                    <td className="px-6 py-4 text-white/40">
                      {format(new Date(audit.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-white/40 hover:text-white">
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer/Pagination Placeholder */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between text-xs text-white/40">
          <div>Showing {audits?.length || 0} audits across all systems</div>
          <div className="flex items-center gap-2">
            <span className="opacity-50">Sort by:</span>
            <span className="text-white/80 font-medium">Recently Created</span>
          </div>
        </div>
      </div>
    </div>
  );
}
