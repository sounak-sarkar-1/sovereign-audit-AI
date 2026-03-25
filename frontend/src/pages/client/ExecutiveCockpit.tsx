import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp,
  Search,
  MessageSquare,
  ShieldCheck,
  ClipboardList,
  Settings,
  ChevronRight,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { clientService } from '@/services/clientService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ExecutiveCockpit: React.FC = () => {
  const navigate = useNavigate();

  const { data: auditsData, isLoading: auditsLoading } = useQuery({
    queryKey: ['client-audits'],
    queryFn: () => clientService.getAudits({ limit: 5 }),
  });

  const { data: insightsData, isLoading: insightsLoading } = useQuery({
    queryKey: ['client-insights'],
    queryFn: () => clientService.getInsights(),
  });

  const { data: clarificationsData } = useQuery({
    queryKey: ['client-clarifications'],
    queryFn: () => clientService.getClarifications({ status: 'pending' }),
  });

  const audits = auditsData?.data || [];
  const insights = insightsData?.data || { auditsCount: 0, complianceTrend: [], riskByBu: [] };
  const pendingClarifications = clarificationsData || [];

  if (auditsLoading || insightsLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-dark">Executive Cockpit</h1>
          <p className="text-muted-foreground">
            Real-time oversight of audit progress and compliance health.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Button 
                variant="outline" 
                className="rounded-full shadow-sm gap-2"
                onClick={() => navigate('/client/search')}
            >
             <Search size={16} /> Global Search
           </Button>
           <Button 
                className="rounded-full bg-primary hover:bg-primary/90 shadow-sm gap-2"
                onClick={() => navigate('/client/remediation')}
            >
             <Zap size={16} /> Remediation Tracking
           </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card border-none bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Audits</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-dark">{audits.filter((a: any) => a.status === 'in_progress').length}</div>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Across all business units</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card border-none bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pending Clarifications</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <MessageSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-dark">{pendingClarifications.length}</div>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Requires your attention</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-none bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Reports for Review</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-dark">{audits.filter((a: any) => a.status === 'pending_client_review').length}</div>
            <p className="text-[10px] text-muted-foreground font-medium mt-1">Awaiting final sign-off</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-none bg-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-white/70 uppercase tracking-widest">Compliance Health</CardTitle>
            <ShieldCheck className="h-4 w-4 text-white/50" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">94%</div>
            <p className="text-[10px] text-white/60 font-medium mt-1 flex items-center gap-1">
              <TrendingUp size={10} /> +2% from last quarter
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-card border-none bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Compliance Health Trend</CardTitle>
            <CardDescription>Historical compliance scores across completed audits.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={insights.complianceTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(new Date(val), 'MMM yy')}
                  fontSize={10}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis 
                  fontSize={10}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tick={{ fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4f2d7f" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#4f2d7f", strokeWidth: 2, stroke: "#fff" }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="col-span-3 space-y-6">
           <Card 
                className="shadow-card border-none bg-white hover:bg-muted/5 transition-colors cursor-pointer group"
                onClick={() => navigate('/client/remediation')}
            >
              <CardContent className="p-6 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                       <ClipboardList size={24} />
                    </div>
                    <div>
                       <h4 className="font-bold text-dark">Remediation Tracker</h4>
                       <p className="text-xs text-muted-foreground">Manage corrective action plans</p>
                    </div>
                 </div>
                 <ChevronRight className="text-muted-foreground group-hover:text-dark transition-colors" />
              </CardContent>
           </Card>

           <Card 
                className="shadow-card border-none bg-white hover:bg-muted/5 transition-colors cursor-pointer group"
                onClick={() => navigate('/client/settings')}
            >
              <CardContent className="p-6 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground">
                       <Settings size={24} />
                    </div>
                    <div>
                       <h4 className="font-bold text-dark">System Settings</h4>
                       <p className="text-xs text-muted-foreground">Organization & user management</p>
                    </div>
                 </div>
                 <ChevronRight className="text-muted-foreground group-hover:text-dark transition-colors" />
              </CardContent>
           </Card>

           <Card className="shadow-card border-none bg-accent/5 border border-accent/10">
              <CardContent className="p-6 space-y-4">
                 <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest">
                    <Zap size={14} /> AI Insight
                 </div>
                 <p className="text-sm font-medium leading-relaxed text-dark/80">
                    High turnover in "Digital Banking" BU is correlating with a 15% increase in SOP-related exceptions.
                 </p>
                 <Button variant="link" className="p-0 h-auto text-accent text-xs font-bold" onClick={() => navigate('/client/insights')}>
                    View full analysis →
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Active Audits Table */}
      <Card className="shadow-card border-none bg-white overflow-hidden">
        <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between p-6">
          <div>
            <CardTitle className="text-lg">Recent Engagement Activity</CardTitle>
            <CardDescription>Status and timeline for your ongoing audit projects.</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="rounded-full shadow-sm" onClick={() => navigate('/client/audits')}>
            View All Projects
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow>
                <TableHead className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Audit Project</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Lead Manager</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Timeline</TableHead>
                <TableHead className="py-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Audit Status</TableHead>
                <TableHead className="text-right px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.map((audit: any) => (
                <TableRow key={audit.id} className="hover:bg-muted/5 transition-colors">
                  <TableCell className="px-6 font-bold text-dark">{audit.name}</TableCell>
                  <TableCell className="text-sm font-medium text-muted-foreground">{audit.manager?.fullName}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-xs text-muted-foreground font-medium">
                      <Clock className="mr-1.5 h-3 w-3" />
                      {format(new Date(audit.startDate), 'MMM dd')} - {format(new Date(audit.expectedCompletionDate), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={cn(
                        "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-tight",
                         audit.status === 'pending_client_review' 
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' 
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                      )}
                    >
                      {audit.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/5 hover:text-primary transition-colors font-bold text-xs" onClick={() => navigate(`/client/audits/${audit.id}`)}>
                      Explore
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {audits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-60 text-center">
                    <div className="space-y-3">
                       <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                       <p className="text-muted-foreground font-medium">No active audit projects found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExecutiveCockpit;
