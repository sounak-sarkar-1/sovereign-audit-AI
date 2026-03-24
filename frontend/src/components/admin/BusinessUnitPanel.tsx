import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BusinessUnitPanelProps {
  clientId: string;
}

export const BusinessUnitPanel: React.FC<BusinessUnitPanelProps> = ({ clientId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [editName, setEditName] = useState('');
  
  const queryClient = useQueryClient();

  const { data: businessUnits, isLoading } = useQuery<any[]>({
    queryKey: ['business-units', clientId],
    queryFn: async () => {
      const response = await api.get(`/admin/clients/${clientId}/business-units`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      await api.post(`/admin/clients/${clientId}/business-units`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-units', clientId] });
      toast.success('Business Unit created');
      setIsAdding(false);
      setNewName('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create business unit');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string, name: string }) => {
      await api.put(`/admin/clients/${clientId}/business-units/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-units', clientId] });
      toast.success('Business Unit updated');
      setEditingId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update business unit');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/clients/${clientId}/business-units/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-units', clientId] });
      toast.success('Business Unit deleted');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 
        'Cannot delete Business Unit as it is part of an active audit'
      );
    },
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate(newName);
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) return;
    updateMutation.mutate({ id, name: editName });
  };

  const startEdit = (bu: any) => {
    setEditingId(bu.id);
    setEditName(bu.name);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold text-dark">Client Business Units</h4>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)} variant="outline" className="h-8 gap-1">
            <Plus className="w-3.5 h-3.5" /> Add BU
          </Button>
        )}
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 h-10">
              <TableHead className="text-xs">Business Unit Name</TableHead>
              <TableHead className="text-right text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAdding && (
              <TableRow className="bg-primary/5 h-10">
                <TableCell>
                  <Input 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter BU name..."
                    className="h-8 text-sm"
                    autoFocus
                  />
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleCreate}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setIsAdding(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )}
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-4 text-xs italic">Loading...</TableCell>
              </TableRow>
            ) : (businessUnits?.length === 0 && !isAdding) ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground py-4 text-xs italic">
                  No business units defined yet.
                </TableCell>
              </TableRow>
            ) : (
              businessUnits?.map((bu) => (
                <TableRow key={bu.id} className="h-10">
                  <TableCell>
                    {editingId === bu.id ? (
                      <Input 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 text-sm"
                        autoFocus
                      />
                    ) : (
                      <span className="text-sm">{bu.name}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === bu.id ? (
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleUpdate(bu.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(bu)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-red-500" 
                          onClick={() => deleteMutation.mutate(bu.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
