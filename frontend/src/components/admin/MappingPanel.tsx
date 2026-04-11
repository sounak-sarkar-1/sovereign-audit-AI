import React, { useState } from 'react';
import { Search, UserMinus, UserPlus } from 'lucide-react';
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

interface MappingProps {
  managerId: string;
  type: 'auditor' | 'client';
  existingMappings: any[];
}

export const MappingPanel: React.FC<MappingProps> = ({ managerId, type, existingMappings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const targetRole = type === 'auditor' ? 'auditor' : 'client';
  
  const { data: availableUsers } = useQuery<any[]>({
    queryKey: ['users', 'available', targetRole],
    queryFn: async () => {
      const response = await api.get('/admin/users', { 
        params: { role: targetRole, limit: 100 } 
      });
      return response.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (targetId: string) => {
      const endpoint = type === 'auditor' ? '/admin/mappings/manager-auditor' : '/admin/mappings/manager-client';
      await api.post(endpoint, { managerId, targetId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', managerId] });
      toast.success('Mapping added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add mapping');
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (targetId: string) => {
      const endpoint = type === 'auditor' ? '/admin/mappings/manager-auditor' : '/admin/mappings/manager-client';
      const params = type === 'auditor' ? { managerId, auditorId: targetId } : { managerId, clientId: targetId };
      await api.delete(endpoint, { params });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', managerId] });
      toast.success('Mapping removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove mapping');
    },
  });

  const filteredAvailable = availableUsers?.filter(u => 
    !existingMappings.some(m => (m.auditorId || m.clientId) === u.id) &&
    (u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-semibold text-dark capitalize">Assigned {type}s</h4>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${type}s to add...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
          {searchTerm && filteredAvailable && filteredAvailable.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
              {filteredAvailable.map(u => (
                <div 
                  key={u.id} 
                  className="p-2 hover:bg-muted/50 flex justify-between items-center cursor-pointer"
                  onClick={() => {
                    addMutation.mutate(u.id);
                    setSearchTerm('');
                  }}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{u.fullName}</span>
                    <span className="text-xs text-muted-foreground">{u.email}</span>
                  </div>
                  <UserPlus className="w-4 h-4 text-primary" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 h-10">
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Email</TableHead>
              <TableHead className="text-right text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {existingMappings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-4 text-xs italic">
                  No {type}s assigned yet.
                </TableCell>
              </TableRow>
            ) : (
              existingMappings.map((m) => {
                const target = m.auditor || m.client || {};
                const targetId = m.auditorId || m.clientId;
                return (
                  <TableRow key={m.id} className="h-10">
                    <TableCell className="text-sm">{target.fullName || 'Unknown'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{target.email || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeMutation.mutate(targetId)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
