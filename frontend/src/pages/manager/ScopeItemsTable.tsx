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
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import type { ScopeLineItem } from '@/types/scope';

interface ScopeItemsTableProps {
  items: ScopeLineItem[];
  onEdit: (item: ScopeLineItem) => void;
  onDelete: (itemId: string) => void;
  isDraft: boolean;
}

const ScopeItemsTable: React.FC<ScopeItemsTableProps> = ({ items, onEdit, onDelete, isDraft }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Item Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Input Method</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-32 text-center text-bg-muted font-medium italic">
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
