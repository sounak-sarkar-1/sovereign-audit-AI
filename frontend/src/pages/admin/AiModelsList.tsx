import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  Trash2, 
  Edit,
  Power,
  Play
} from 'lucide-react';
import api from '@/lib/api';
import type { AiModel, TestConnectionResponse } from '@/types/ai-model';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AiModelDrawer } from '@/components/admin/AiModelDrawer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const AiModelsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AiModel | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [modelToProcess, setModelToProcess] = useState<AiModel | null>(null);

  const queryClient = useQueryClient();

  const { data: models, isLoading } = useQuery<AiModel[]>({
    queryKey: ['ai-models'],
    queryFn: async () => {
      const response = await api.get('/admin/ai-models');
      return response.data;
    },
  });

  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/admin/ai-models/${id}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
      toast.success('AI Model activated successfully');
      setActivateDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to activate AI Model');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/ai-models/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
      toast.success('AI Model deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete AI Model');
    },
  });

  const testMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<TestConnectionResponse>(`/admin/ai-models/${id}/test`);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: () => {
      toast.error('Failed to test connection');
    },
  });

  const filteredModels = models?.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.modelType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (model: AiModel) => {
    setSelectedModel(model);
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedModel(undefined);
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = (model: AiModel) => {
    if (model.isActive) {
      toast.error('Cannot delete an active AI Model');
      return;
    }
    setModelToProcess(model);
    setDeleteDialogOpen(true);
  };

  const handleActivateClick = (model: AiModel) => {
    if (model.isActive) return;
    setModelToProcess(model);
    setActivateDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#4f2d7f]">AI Model Configuration</h1>
          <p className="text-muted-foreground">Manage and activate AI models for audit analysis</p>
        </div>
        <Button onClick={handleCreate} className="bg-[#4f2d7f] hover:bg-[#2b144d]">
          <Plus className="w-4 h-4 mr-2" />
          Add AI Model
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border">
        <Search className="w-5 h-5 text-gray-400 ml-2" />
        <Input
          placeholder="Search models..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-none focus-visible:ring-0"
        />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Endpoint URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">Loading AI models...</TableCell>
              </TableRow>
            ) : filteredModels?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">No AI models found</TableCell>
              </TableRow>
            ) : (
              filteredModels?.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {model.modelType.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {model.endpointUrl}
                  </TableCell>
                  <TableCell>
                    {model.isActive ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-gray-500">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                       <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => testMutation.mutate(model.id)}
                        disabled={testMutation.isPending}
                        title="Test Connection"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!model.isActive && (
                            <DropdownMenuItem onClick={() => handleActivateClick(model)}>
                              <Power className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleEdit(model)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Configuration
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600" 
                            onClick={() => handleDeleteClick(model)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AiModelDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        model={selectedModel}
      />

      <AlertDialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate AI Model?</AlertDialogTitle>
            <AlertDialogDescription>
              This will activate "{modelToProcess?.name}" and deactivate any other currently active model.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => modelToProcess && activateMutation.mutate(modelToProcess.id)}
              className="bg-[#4f2d7f] hover:bg-[#2b144d]"
            >
              Confirm Activation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete AI Model?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{modelToProcess?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => modelToProcess && deleteMutation.mutate(modelToProcess.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
