import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  MoreVertical, 
  Calendar, 
  Users, 
  RotateCcw,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card 
} from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { auditService } from '@/services/auditService';
import { AuditStatus, type Audit } from '@/types/audit';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import ExceptionalRequestModal from '@/components/modals/ExceptionalRequestModal';
import { ExceptionalActionType } from '@/services/exceptionalRequestService';

const columns: { title: string; status: AuditStatus }[] = [
  { title: 'Draft', status: AuditStatus.DRAFT },
  { title: 'In Progress', status: AuditStatus.IN_PROGRESS },
  { title: 'Manager Review', status: AuditStatus.UNDER_MANAGER_REVIEW },
  { title: 'Client Review', status: AuditStatus.PENDING_CLIENT_REVIEW },
  { title: 'Completed', status: AuditStatus.CLOSED },
  { title: 'Reopened', status: AuditStatus.REOPENED },
];

const getStatusColor = (status: AuditStatus) => {
  switch (status) {
    case AuditStatus.DRAFT: return '#ccc4bd';
    case AuditStatus.IN_PROGRESS: return '#a06dff';
    case AuditStatus.UNDER_MANAGER_REVIEW: return '#4f2d7f';
    case AuditStatus.PENDING_CLIENT_REVIEW: return '#f57f17';
    case AuditStatus.CLOSED: return '#2e7d32';
    case AuditStatus.REOPENED: return '#a06dff';
    default: return '#ccc4bd';
  }
};

const AuditCard = ({ audit, onRequestAction }: { audit: Audit, onRequestAction: (type: ExceptionalActionType) => void }) => {
  const navigate = useNavigate();
  const isOverdue = audit.expectedCompletionDate && new Date(audit.expectedCompletionDate) < new Date() && audit.status !== AuditStatus.CLOSED;
  const hasPendingRequest = (audit as any).hasPendingExceptionalRequest;
  const auditId = audit.id.slice(-6).toUpperCase();

  return (
    <div 
      className={cn(
        "bg-white dark:bg-[#2d1f45] rounded-xl shadow-card p-4 cursor-pointer hover:shadow-elevated hover:-translate-y-1 transition-all duration-150 relative group",
        hasPendingRequest && "opacity-80"
      )}
      onClick={() => navigate(`/manager/audits/${audit.id}`)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col gap-1.5">
          <div className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-bg-warm dark:bg-[#1a1025] text-bg-muted border border-bg-mid dark:border-[#3d2a5a] inline-flex w-fit">
            AUD-{auditId}
          </div>
          {audit.openExceptionsCount && audit.openExceptionsCount > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#c62828] border-2 border-white dark:border-[#2d1f45] z-10" title={`${audit.openExceptionsCount} open exceptions`} />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl shadow-dropdown">
            <DropdownMenuItem onClick={() => navigate(`/manager/audits/${audit.id}`)}>View Detail</DropdownMenuItem>
            {audit.status === AuditStatus.DRAFT && (
              <DropdownMenuItem onClick={() => navigate(`/manager/audits/${audit.id}/edit`)}>Edit</DropdownMenuItem>
            )}
            
            {!hasPendingRequest && (
              <>
                <DropdownMenuSeparator />
                {[AuditStatus.DRAFT, AuditStatus.IN_PROGRESS].includes(audit.status) && (
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600"
                    onClick={(e) => { e.stopPropagation(); onRequestAction(ExceptionalActionType.DELETE); }}
                  >
                    <Trash2 size={14} className="mr-2" /> Request Deletion
                  </DropdownMenuItem>
                )}
                {audit.status === AuditStatus.CLOSED && (
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onRequestAction(ExceptionalActionType.REOPEN); }}
                  >
                    <RotateCcw size={14} className="mr-2" /> Request Reopen
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h4 className="text-sm font-semibold text-dark dark:text-bg-mid line-clamp-2 leading-snug">
        {audit.name}
      </h4>
      <p className="text-[11px] text-bg-muted dark:text-bg-muted mt-1 truncate">
        {audit.client?.fullName || 'No Client'} • {audit.businessUnits?.map(bu => bu.name).join(', ') || 'No BU'}
      </p>

      {/* Gradient Due Date Pill */}
      {audit.expectedCompletionDate && (
        <div className="mt-3 relative inline-block">
          <div className="p-[1px] rounded-full bg-gradient-to-r from-[#2b144d] to-[#a06dff]">
            <div className="bg-white dark:bg-[#2d1f45] rounded-full px-3 py-1 flex items-center gap-1.5 transition-colors">
              <Calendar size={12} className={cn(isOverdue ? "text-red-500" : "text-[#2b144d] dark:text-[#a06dff]")} />
              <span className={cn("text-[10px] font-medium", isOverdue ? "text-red-600" : "text-dark dark:text-bg-mid")}>
                {format(new Date(audit.expectedCompletionDate), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {[...Array(Math.min(audit.auditorCount || 0, 3))].map((_, i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-[#2d1f45] bg-bg-warm dark:bg-[#1a1025] flex items-center justify-center text-[10px] font-bold text-primary dark:text-accent">
              <Users size={12} />
            </div>
          ))}
          {(audit.auditorCount || 0) > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#2d1f45] bg-bg-warm dark:bg-[#1a1025] flex items-center justify-center text-[10px] font-bold text-bg-muted">
              +{(audit.auditorCount || 0) - 3}
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-1 flex-1 ml-4">
          <div className="flex justify-between w-full text-[10px] font-medium text-bg-muted">
            <span>Progress</span>
            <span>{audit.completionPercentage || 0}%</span>
          </div>
          <div className="w-full h-1 bg-bg-warm dark:bg-[#1a1025] rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-500 rounded-full" 
              style={{ width: `${audit.completionPercentage || 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const KanbanBoard = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [selectedAction, setSelectedAction] = useState<ExceptionalActionType>(ExceptionalActionType.DELETE);

  const { data: audits, isLoading } = useQuery({
    queryKey: ['audits'],
    queryFn: () => auditService.getAudits({ limit: 100 }),
  });

  const filteredAudits = audits?.items.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.client?.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const handleRequestAction = (audit: Audit, type: ExceptionalActionType) => {
    setSelectedAudit(audit);
    setSelectedAction(type);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">Audit Dashboard</h1>
          <p className="text-sm text-bg-muted dark:text-bg-muted mt-1">Manage and monitor all active audit engagements.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-bg-warm dark:bg-[#1a0d35] rounded-full p-1 flex shadow-sm border border-bg-mid dark:border-[#3d2a5a]">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "h-8 px-4", 
                view === 'kanban' ? "bg-white dark:bg-[#2d1f45] text-primary dark:text-accent shadow-elevated" : "text-bg-muted"
              )}
              onClick={() => setView('kanban')}
            >
              <LayoutGrid size={16} className="mr-2" /> Kanban
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "h-8 px-4", 
                view === 'list' ? "bg-white dark:bg-[#2d1f45] text-primary dark:text-accent shadow-elevated" : "text-bg-muted"
              )}
              onClick={() => setView('list')}
            >
              <List size={16} className="mr-2" /> List
            </Button>
          </div>
          <Button onClick={() => navigate('/manager/audits/new')} className="shadow-card">
            <Plus size={18} className="mr-2" /> New Audit
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bg-muted" />
          <Input 
            placeholder="Search audits or clients..." 
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
          {columns.map((_, i) => (
            <div key={i} className="w-72 flex-shrink-0 space-y-4">
              <div className="h-8 bg-bg-warm dark:bg-[#2d1f45] rounded-md w-2/3 animate-pulse" />
              {[...Array(2)].map((_, j) => (
                <div key={j} className="h-48 bg-bg-warm dark:bg-[#2d1f45] rounded-xl animate-pulse shadow-sm" />
              ))}
            </div>
          ))}
        </div>
      ) : view === 'kanban' ? (
        <div className="flex flex-row overflow-x-auto gap-4 pb-4 px-1 hide-scrollbar min-h-[calc(100vh-280px)]">
          {columns.map((column) => {
            const columnAudits = filteredAudits?.filter(a => a.status === column.status) || [];
            const accentColor = getStatusColor(column.status);
            
            return (
              <div key={column.status} className="w-72 flex-shrink-0 flex flex-col pt-2">
                <div className="flex items-center justify-between mb-4 px-1 pl-3 border-l-4" style={{ borderColor: accentColor }}>
                  <h3 className="font-bold text-sm text-dark dark:text-bg-mid flex items-center gap-3">
                    {column.title}
                    <span className="px-2 py-0.5 bg-bg-warm dark:bg-[#261840] rounded-full text-[10px] text-bg-muted font-bold">
                      {columnAudits.length}
                    </span>
                  </h3>
                </div>
                
                <div className="flex-1 space-y-3">
                  {columnAudits.map((audit) => (
                    <AuditCard 
                      key={audit.id} 
                      audit={audit} 
                      onRequestAction={(type) => handleRequestAction(audit, type)} 
                    />
                  ))}
                  
                  {columnAudits.length === 0 && (
                    <div className="h-24 border-2 border-dashed rounded-xl border-bg-mid dark:border-[#3d2a5a] flex items-center justify-center p-4 text-center">
                      <p className="text-[11px] text-bg-muted">No audits in this stage</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-bg-warm dark:bg-[#1a0d35] rounded-full flex items-center justify-center mb-4">
            <List size={32} className="text-bg-muted" />
          </div>
          <h3 className="text-sm font-medium text-dark dark:text-bg-mid">List view coming soon</h3>
          <p className="text-xs text-bg-muted mt-1 max-w-[200px]">Use the Kanban view to manage your audit portfolio.</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => setView('kanban')}>
            Back to Kanban
          </Button>
        </Card>
      )}

      {selectedAudit && (
        <ExceptionalRequestModal 
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedAudit(null); }}
          auditId={selectedAudit.id}
          auditName={selectedAudit.name}
          actionType={selectedAction}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
