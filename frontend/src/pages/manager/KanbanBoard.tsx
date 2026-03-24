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
  AlertCircle,
  RotateCcw,
  Trash2,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
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

const AuditCard = ({ audit, onRequestAction }: { audit: Audit, onRequestAction: (type: ExceptionalActionType) => void }) => {
  const navigate = useNavigate();
  const isOverdue = audit.expectedCompletionDate && new Date(audit.expectedCompletionDate) < new Date() && audit.status !== AuditStatus.CLOSED;
  const hasPendingRequest = (audit as any).hasPendingExceptionalRequest;

  return (
    <Card 
      className={cn(
        "mb-4 cursor-pointer hover:shadow-md transition-shadow relative",
        hasPendingRequest && "opacity-80 grayscale-[0.2] border-blue-200"
      )}
      onClick={() => navigate(`/manager/audits/${audit.id}`)}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider mb-1">
            {audit.client?.fullName || 'No Client'}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
        <CardTitle className="text-sm font-semibold line-clamp-2 leading-tight">
          {audit.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Progress</span>
            <span>{audit.completionPercentage || 0}%</span>
          </div>
          <Progress value={audit.completionPercentage || 0} className="h-1.5" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {[...Array(Math.min(audit.auditorCount || 0, 3))].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium">
                <Users size={12} />
              </div>
            ))}
            {(audit.auditorCount || 0) > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium">
                +{(audit.auditorCount || 0) - 3}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            {hasPendingRequest && (
              <Badge variant="secondary" className="h-5 px-1.5 bg-blue-50 text-blue-700 border-blue-200">
                <Clock size={10} className="mr-1" />
                <span className="text-[9px]">Pending Req</span>
              </Badge>
            )}

            {audit.openExceptionsCount && audit.openExceptionsCount > 0 ? (
              <Badge variant="destructive" className="h-5 px-1.5 flex gap-1">
                <AlertCircle size={10} />
                <span className="text-[10px]">{audit.openExceptionsCount}</span>
              </Badge>
            ) : null}
            
            {audit.expectedCompletionDate && (
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded",
                isOverdue ? "text-destructive bg-destructive/10" : "text-muted-foreground bg-secondary"
              )}>
                <Calendar size={10} />
                {format(new Date(audit.expectedCompletionDate), 'MMM d')}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
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
          <h1 className="text-3xl font-bold tracking-tight">Audit Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all active audit engagements.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-secondary rounded-lg p-1 flex">
            <Button 
              variant={view === 'kanban' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={cn("h-8", view === 'kanban' && "bg-background shadow-sm")}
              onClick={() => setView('kanban')}
            >
              <LayoutGrid size={16} className="mr-2" /> Kanban
            </Button>
            <Button 
              variant={view === 'list' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={cn("h-8", view === 'list' && "bg-background shadow-sm")}
              onClick={() => setView('list')}
            >
              <List size={16} className="mr-2" /> List
            </Button>
          </div>
          <Button onClick={() => navigate('/manager/audits/new')}>
            <Plus size={18} className="mr-2" /> New Audit
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search audits or clients..." 
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 bg-muted rounded w-2/3 animate-pulse" />
              {[...Array(2)].map((_, j) => (
                <div key={j} className="h-40 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      ) : view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-h-[600px]">
          {columns.map((column) => {
            const columnAudits = filteredAudits?.filter(a => a.status === column.status) || [];
            
            return (
              <div key={column.status} className="bg-secondary/30 rounded-lg p-3 flex flex-col">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    {column.title}
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                      {columnAudits.length}
                    </Badge>
                  </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto hide-scrollbar space-y-1">
                  {columnAudits.map((audit) => (
                    <AuditCard 
                      key={audit.id} 
                      audit={audit} 
                      onRequestAction={(type) => handleRequestAction(audit, type)} 
                    />
                  ))}
                  
                  {columnAudits.length === 0 && (
                    <div className="h-24 border-2 border-dashed rounded-lg border-muted flex items-center justify-center p-4 text-center">
                      <p className="text-[10px] text-muted-foreground">No audits in this stage</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="p-8 text-center text-muted-foreground">
              List view implementation pending - use Kanban for now.
            </div>
          </CardContent>
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
