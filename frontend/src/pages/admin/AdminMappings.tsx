import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  UserCheck,
  Building,
  Shield,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { adminMappingsService } from '@/services/adminMappingsService';
import { userService } from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminMappings() {
  const [activeTab, setActiveTab] = useState<'auditors' | 'clients'>('auditors');
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  
  const queryClient = useQueryClient();

  // Fetch users for selection
  const { data: managers } = useQuery({
    queryKey: ['users', 'manager'],
    queryFn: () => userService.getUsers({ role: 'manager' }),
  });

  const { data: targets } = useQuery({
    queryKey: ['users', activeTab === 'auditors' ? 'auditor' : 'client'],
    queryFn: () => userService.getUsers({ role: activeTab === 'auditors' ? 'auditor' : 'client' }),
  });

  // Fetch current mappings (Assuming backend has GET endpoints, if not we'll need to adjust)
  // The backend controller I saw only had POST/DELETE. 
  // I'll check the service to see if GET exists.
  
  const { data: mappings, isLoading: isLoadingMappings } = useQuery({
    queryKey: ['admin-mappings', activeTab],
    queryFn: () => adminMappingsService.getMappings(activeTab === 'auditors' ? 'manager-auditor' : 'manager-client'),
  });

  const createMutation = useMutation({
    mutationFn: (data: { managerId: string, targetId: string }) => 
      adminMappingsService.createMapping(activeTab === 'auditors' ? 'manager-auditor' : 'manager-client', data),
    onSuccess: () => {
      toast.success('Mapping created successfully');
      setSelectedTarget('');
      queryClient.invalidateQueries({ queryKey: ['admin-mappings'] });
    },
    onError: (err: any) => {
      console.error('Mapping error response:', err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to create mapping');
    }
  });

  const handleRemoveMapping = (managerId: string, targetId: string) => {
    adminMappingsService.removeMapping(activeTab === 'auditors' ? 'manager-auditor' : 'manager-client', managerId, targetId)
      .then(() => {
        toast.success('Mapping removed');
        queryClient.invalidateQueries({ queryKey: ['admin-mappings'] });
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to remove');
      });
  };

  const handleAddMapping = () => {
    if (!selectedManager || !selectedTarget) {
      toast.error('Please select both a manager and a ' + (activeTab === 'auditors' ? 'auditor' : 'client'));
      return;
    }
    createMutation.mutate({ managerId: selectedManager, targetId: selectedTarget });
  };

  const managerList = (managers as any)?.items || (managers as any)?.data || (Array.isArray(managers) ? managers : []);
  const targetList = (targets as any)?.items || (targets as any)?.data || (Array.isArray(targets) ? targets : []);
  const mappingList = (mappings as any)?.data || (Array.isArray(mappings) ? mappings : []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-dark dark:text-white flex items-center gap-3" data-testid="mappings-page-title">
          <Shield className="text-primary dark:text-accent" />
          Manager Mappings
        </h1>
        <p className="text-muted-foreground font-medium">Link managers to their designated auditors or clients.</p>
      </div>

      <div className="flex p-1 bg-bg-warm dark:bg-[#1a0d35]/50 rounded-full w-fit gap-1">
        <button
          onClick={() => setActiveTab('auditors')}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
            activeTab === 'auditors' 
              ? "bg-white text-dark shadow-elevated" 
              : "text-bg-muted hover:text-dark dark:text-white/60 dark:hover:text-white"
          )}
          data-testid="tab-auditors"
        >
          <UserCheck size={16} />
          MANAGER-AUDITOR
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
            activeTab === 'clients' 
              ? "bg-white text-dark shadow-elevated" 
              : "text-bg-muted hover:text-dark dark:text-white/60 dark:hover:text-white"
          )}
          data-testid="tab-clients"
        >
          <Building size={16} />
          MANAGER-CLIENT
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 border-none shadow-card overflow-hidden bg-white dark:bg-[#2d1f45] rounded-xl">
          <CardHeader className="bg-bg-warm/30 border-b border-bg-mid">
            <CardTitle className="text-lg font-semibold text-dark">Create New Link</CardTitle>
            <CardDescription className="text-xs">Select a manager and a target to associate them.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-bg-muted">Manager</label>
              <Select value={selectedManager} onValueChange={setSelectedManager}>
                <SelectTrigger className="rounded-md h-10 border-bg-mid" data-testid="manager-select">
                  <SelectValue placeholder="Select Manager" />
                </SelectTrigger>
                <SelectContent>
                  {managerList.map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>{m.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center py-2">
              <div className="w-10 h-10 rounded-full bg-bg-warm dark:bg-white/5 flex items-center justify-center text-bg-muted">
                <ArrowRight size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-bg-muted">
                {activeTab === 'auditors' ? 'Auditor' : 'Client'}
              </label>
              <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                <SelectTrigger className="rounded-md h-10 border-bg-mid" data-testid="target-select">
                  <SelectValue placeholder={`Select ${activeTab === 'auditors' ? 'Auditor' : 'Client'}`} />
                </SelectTrigger>
                <SelectContent>
                  {targetList.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full h-10 rounded-full font-semibold bg-dark hover:bg-primary transition-colors" 
              onClick={handleAddMapping}
              disabled={createMutation.isPending}
              data-testid="create-mapping-btn"
            >
              {createMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <UserPlus className="mr-2 h-4 w-4" />} 
              {createMutation.isPending ? 'Linking...' : 'CREATE LINK'}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-none shadow-card overflow-hidden bg-white dark:bg-[#2d1f45] rounded-xl">
           <CardHeader className="border-b border-bg-mid">
            <CardTitle className="text-lg font-semibold text-dark flex items-center gap-2" data-testid="active-mappings-section-title">
              <Users className="text-primary h-5 w-5" />
              Active Mappings
            </CardTitle>
            <CardDescription className="text-xs">Currently established relationships in the system.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
              {isLoadingMappings ? (
                <div className="p-12 text-center text-bg-muted italic">Loading mappings...</div>
              ) : mappingList.length === 0 ? (
                <div className="p-12 text-center text-bg-muted italic">No active mappings found.</div>
              ) : (
                <div className="divide-y divide-bg-mid dark:divide-white/5">
                  {mappingList.map((m: any) => (
                    <div key={m.id} className="p-4 flex items-center justify-between hover:bg-bg-warm/50 dark:hover:bg-white/5 transition-colors" data-testid="mapping-row">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {m.manager?.fullName?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-dark dark:text-white uppercase tracking-tight">{m.manager?.fullName}</div>
                          <div className="text-[10px] text-bg-muted uppercase font-black tracking-widest leading-none">Manager</div>
                        </div>
                        <ArrowRight size={14} className="text-bg-mid" />
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                            {(m.auditor?.fullName || m.client?.fullName)?.[0]}
                          </div>
                          <div>
                             <div className="text-sm font-bold text-dark dark:text-white uppercase tracking-tight">
                               {m.auditor?.fullName || m.client?.fullName}
                             </div>
                             <div className="text-[10px] text-bg-muted uppercase font-black tracking-widest leading-none">
                               {activeTab === 'auditors' ? 'Auditor' : 'Client'}
                             </div>
                          </div>
                        </div>
                      </div>
                      <Button 
                       variant="ghost" 
                       size="icon" 
                       className="text-red-500 hover:text-red-600 hover:bg-red-50"
                       onClick={() => handleRemoveMapping(m.managerId, m.auditorId || m.clientId)}
                       data-testid="remove-mapping-btn"
                      >
                        <UserMinus size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
