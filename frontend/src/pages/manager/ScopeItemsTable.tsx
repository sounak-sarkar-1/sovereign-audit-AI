import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { scopeService } from '@/services/scopeService';
import { toast } from 'sonner';
import type { ScopeLineItem } from '@/types/scope';
import type { AuditStatus } from '@/types/audit';

interface ScopeItemsTableProps {
  auditId: string;
  auditStatus: AuditStatus;
  items: ScopeLineItem[];
  onEdit: (item: ScopeLineItem) => void;
  onDelete: (itemId: string) => void;
  isDraft: boolean;
  onRefresh?: () => void;
}

const ScopeItemsTable: React.FC<ScopeItemsTableProps> = ({ 
  auditId,
  auditStatus,
  items, 
  onEdit, 
  onDelete, 
  isDraft,
  onRefresh 
}) => {
  const [localWeightages, setLocalWeightages] = React.useState<Record<string, string>>({});
  const timeoutRef = React.useRef<Record<string, any>>({});

  const canEditWeightage = auditStatus === 'draft' || auditStatus === 'in_progress';

  const handleWeightageChange = (itemId: string, value: string) => {
    // Only allow numbers and one decimal point
    if (value !== '' && !/^\d*\.?\d{0,2}$/.test(value)) return;
    
    setLocalWeightages(prev => ({ ...prev, [itemId]: value }));

    // Debounce API call
    if (timeoutRef.current[itemId]) clearTimeout(timeoutRef.current[itemId]);
    
    timeoutRef.current[itemId] = setTimeout(async () => {
      try {
        const weightage = parseFloat(value) || 0;
        await scopeService.updateWeightages(auditId, [{ id: itemId, weightage }]);
        if (onRefresh) onRefresh();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to update weightage');
      }
    }, 500);
  };
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Item Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Input Method</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Weightage</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-32 text-center text-bg-muted font-medium italic">
              No checkpoints defined for this business unit.
            </TableCell>
          </TableRow>
        ) : (
          items.map((item) => (
            <TableRow key={item.id} data-testid="scope-line-item">
              <TableCell className="font-bold text-dark dark:text-white">{item.name}</TableCell>
              <TableCell className="max-w-md truncate text-dark/70 dark:text-bg-mid" title={item.description}>
                {item.description}
              </TableCell>
              <TableCell className="capitalize font-medium text-xs tracking-tight">
                {item.inputMethod.replace('_', ' ')}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize text-[10px] font-bold border-bg-mid py-0 h-5">
                   {item.source.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    item.status === 'not_started' ? 'draft' :
                    item.status === 'draft_saved' ? 'draft' :
                    item.status === 'submitted' ? 'inProgress' :
                    item.status === 'exception_approved' ? 'approved' :
                    item.status === 'exception_rejected' ? 'rejected' :
                    item.status === 'returned' ? 'returned' : 'default'
                  }
                  className="capitalize text-[10px] font-bold py-0 h-5"
                >
                  {item.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell className="w-[120px]">
                <div className="flex items-center gap-2">
                  <Input
                    className={`h-8 w-16 text-xs px-2 ${item.weightage === null ? 'border-destructive/50' : ''}`}
                    value={localWeightages[item.id] ?? (item.weightage?.toString() || '')}
                    onChange={(e) => handleWeightageChange(item.id, e.target.value)}
                    disabled={!canEditWeightage}
                    placeholder="--"
                  />
                  {item.weightage === null && (
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" title="Weightage missing" />
                  )}
                  <span className="text-[10px] font-bold text-muted-foreground">%</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {isDraft && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-bg-warm dark:hover:bg-[#3d2a5a]">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Checkpoint
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ScopeItemsTable;
