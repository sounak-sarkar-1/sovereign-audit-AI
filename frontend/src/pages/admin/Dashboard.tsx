import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Files, 
  AlertTriangle, 
  TrendingUp,
  ShieldCheck,
  Building2,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { adminAuditService } from '@/services/adminAuditService';
import { exceptionalRequestService } from '@/services/exceptionalRequestService';
import api from '@/lib/api';

export default function AdminDashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['admin-dashboard-summary'],
    queryFn: async () => {
      const response = await api.get('/admin/summary');
      return response.data;
    },
  });

  const { data: audits } = useQuery({
    queryKey: ['admin-audits-summary'],
    queryFn: () => adminAuditService.getAudits({ limit: 5 }),
  });

  const { data: pendingRequests } = useQuery({
    queryKey: ['exceptional-requests-pending-summary'],
    queryFn: () => exceptionalRequestService.getRequests('pending'),
  });

  const auditsList = Array.isArray(audits) ? audits : (audits as any)?.data || [];
  const pendingList = Array.isArray(pendingRequests) ? pendingRequests : (pendingRequests as any)?.data || [];

  const stats = [
    {
      title: 'Total Users',
      value: summary?.totalUsers || '0',
      description: 'Active across all tenants',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Active Audits',
      value: summary?.activeAudits || '0',
      description: 'Engagements in progress',
      icon: Files,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'Pending Requests',
      value: summary?.pendingRequests || '0',
      description: 'Awaiting admin review',
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      title: 'System Health',
      value: summary?.systemHealth || '99.9%',
      description: 'Operational status',
      icon: ShieldCheck,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    }
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      <div className="space-y-1">
        <div className="flex items-center text-[10px] uppercase tracking-widest font-bold text-muted-foreground gap-2">
          <ShieldCheck size={12} className="opacity-50" />
          <span>System Administration</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground font-medium">Global system overview and key performance indicators.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (stat && (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-black">{stat.value}</h3>
                    <TrendingUp size={16} className="text-green-500" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} strokeWidth={2.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        )))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm border-none overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Recent Audits</CardTitle>
                <CardDescription>Latest system-wide engagements</CardDescription>
              </div>
              <Building2 className="text-muted-foreground opacity-30" size={24} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest font-black text-muted-foreground bg-muted/10">
                    <th className="px-6 py-4">Engagement</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/10">
                  {auditsList.slice(0, 5).map((audit: any) => (
                    <tr key={audit.id} className="hover:bg-accent/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm">{audit.name}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{audit.id}</div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="text-xs font-semibold">{audit.client?.fullName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-accent/10">
                          {audit.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {auditsList.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground italic text-sm">
                        No recent audits found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none overflow-hidden h-fit">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
               <div>
                  <CardTitle className="text-lg font-bold">Pending Actions</CardTitle>
                  <CardDescription>Needs attention</CardDescription>
               </div>
               <Clock className="text-muted-foreground opacity-30" size={24} />
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
             {pendingList.slice(0, 4).map((req: any) => (
               <div key={req.id} className="flex items-start gap-4 group cursor-pointer border-b border-muted/10 pb-4 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold group-hover:text-amber-600 transition-colors uppercase tracking-tight">
                      {req.actionType} AUDIT: {req.audit?.name}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Requester: {req.requester?.fullName}
                    </p>
                  </div>
               </div>
             ))}
             {pendingList.length === 0 && (
               <div className="text-center py-8 text-muted-foreground italic text-xs">
                 No pending exceptional requests.
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
