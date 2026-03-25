import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  Plus, 
  MapPin, 
  ChevronRight, 
  ChevronDown, 
  MoreVertical,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import { adminBusinessUnitService } from '@/services/adminBusinessUnitService';
import type { BusinessUnit } from '@/services/adminBusinessUnitService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function BusinessUnitsList() {
  const [search, setSearch] = useState('');
  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeClient, setActiveClient] = useState<any>(null);
  const [activeBU, setActiveBU] = useState<BusinessUnit | null>(null);
  const [form, setForm] = useState({ name: '', code: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const handleCreateBU = async (clientId: string) => {
    setIsSubmitting(true);
    try {
      await adminBusinessUnitService.createBusinessUnit(clientId, form);
      toast.success('Business unit created');
      setIsAddOpen(false);
      setForm({ name: '', code: '' });
      queryClient.invalidateQueries({ queryKey: ['business-units', clientId] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBU = async (clientId: string, buId: string) => {
    setIsSubmitting(true);
    try {
      await adminBusinessUnitService.updateBusinessUnit(clientId, buId, form);
      toast.success('Business unit updated');
      setIsEditOpen(false);
      setForm({ name: '', code: '' });
      queryClient.invalidateQueries({ queryKey: ['business-units', clientId] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['admin-clients-for-bu'],
    queryFn: adminBusinessUnitService.getClients,
  });

  const toggleClient = (clientId: string) => {
    setExpandedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId) 
        : [...prev, clientId]
    );
  };

  const clients = Array.isArray(clientsData) ? clientsData : (clientsData as any)?.data || [];

  const filteredClients = clients.filter((client: any) => 
    client.fullName.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white">Business Units</h1>
          <p className="text-muted-foreground font-medium">Manage organizational structures for each client.</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-bg-muted" size={18} />
        <Input 
          placeholder="Search clients..." 
          className="pl-10 h-10 rounded-md border-bg-mid"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {isLoadingClients ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredClients?.length === 0 ? (
          <Card className="border-dashed py-20 text-center">
            <p className="text-muted-foreground">No clients found matching your search.</p>
          </Card>
        ) : (
          filteredClients?.map((client: any) => (
            <ClientBUGroup 
              key={client.id} 
              client={client} 
              isExpanded={expandedClients.includes(client.id)}
              onToggle={() => toggleClient(client.id)}
              onAdd={() => {
                setActiveClient(client);
                setForm({ name: '', code: '' });
                setIsAddOpen(true);
              }}
              onEdit={(bu) => {
                setActiveClient(client);
                setActiveBU(bu);
                setForm({ name: bu.name, code: bu.code });
                setIsEditOpen(true);
              }}
            />
          ))
        )}
      </div>
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Business Unit - {activeClient?.fullName}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Unit Name</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. IT Operations" />
            </div>
            <div className="space-y-2">
              <Label>Unit Code</Label>
              <Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="e.g. IT-OPS" />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" className="rounded-full px-5" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button className="rounded-full px-5 bg-dark hover:bg-primary" onClick={() => handleCreateBU(activeClient.id)} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Business Unit</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Unit Name</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Unit Code</Label>
              <Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" className="rounded-full px-5" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button className="rounded-full px-5 bg-dark hover:bg-primary" onClick={() => handleUpdateBU(activeClient.id, activeBU!.id)} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ClientBUGroup({ 
  client, 
  isExpanded, 
  onToggle,
  onAdd,
  onEdit
}: { 
  client: any, 
  isExpanded: boolean, 
  onToggle: () => void,
  onAdd: () => void,
  onEdit: (bu: BusinessUnit) => void
}) {
  const { data: buData, isLoading } = useQuery({
    queryKey: ['business-units', client.id],
    queryFn: () => adminBusinessUnitService.getBusinessUnits(client.id),
    enabled: isExpanded,
  });

  const businessUnits = Array.isArray(buData) ? buData : (buData as any)?.data || [];

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (buId: string) => adminBusinessUnitService.deleteBusinessUnit(client.id, buId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-units', client.id] });
      toast.success('Business unit deleted');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete business unit');
    }
  });

  return (
    <Card className={cn(
      "overflow-hidden border-none shadow-card transition-all rounded-xl",
      isExpanded ? "ring-2 ring-primary/20 shadow-elevated" : "hover:bg-bg-warm/30"
    )}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-dark dark:text-white">{client.fullName}</h3>
            <p className="text-xs text-muted-foreground">{client.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="rounded-full px-3 font-bold">
            {isExpanded && businessUnits ? businessUnits.length : '?'} UNITS
          </Badge>
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-bg-mid dark:border-[#3d2a5a] bg-bg-warm/10 dark:bg-accent/5 p-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" className="rounded-full font-bold text-[10px] h-8" onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}>
              <Plus className="mr-1 h-3 w-3" /> ADD UNIT
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary/50"></div>
            </div>
          ) : businessUnits?.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground italic">
              No business units configured for this client.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {businessUnits?.map((bu: BusinessUnit) => (
                <div key={bu.id} className="bg-white dark:bg-[#1a0d35] p-3 rounded-xl border border-bg-mid dark:border-[#3d2a5a] flex items-center justify-between group shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-bg-warm dark:bg-[#2d1f45] flex items-center justify-center text-bg-muted">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-dark dark:text-white uppercase tracking-tight">{bu.name}</div>
                      <div className="text-[10px] font-mono text-bg-muted">{bu.code}</div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100">
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(bu)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => deleteMutation.mutate(bu.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
