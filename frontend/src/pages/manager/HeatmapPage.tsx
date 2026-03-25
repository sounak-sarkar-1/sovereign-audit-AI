import { useQuery } from '@tanstack/react-query';
import { 
  Clock, 
  BarChart3,
  Loader2,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReChartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { auditorService } from '@/services/auditorService';

const HeatmapPage = () => {
  const { data: heatmapData, isLoading } = useQuery({
    queryKey: ['heatmap'],
    queryFn: () => auditorService.getHeatmap(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <span className="ml-2">Loading utilization heatmap...</span>
      </div>
    );
  }

  const { kpis, auditors } = heatmapData || {
    kpis: { openLineItems: 0, completionPercent: 0, activeEngagementsCount: 0 },
    auditors: []
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Auditor Utilisation Heatmap</h1>
        <p className="text-muted-foreground">Monitor resource allocation and engagement progress across all auditors.</p>
      </div>

      {/* KPI Overviews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-accent/5 border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" /> Open Line Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.openLineItems}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending verification</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" /> Avg. Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.completionPercent}%</div>
            <p className="text-xs text-muted-foreground mt-1">Workload throughput</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" /> Avg. Throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(kpis.completionPercent / 1.2)} items/day</div>
            <p className="text-xs text-muted-foreground mt-1">Velocity across teams</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-none rounded-xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="text-primary h-4 w-4" /> Completion Velocity (Trailing 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { date: 'Mon', items: 12 },
                { date: 'Tue', items: 19 },
                { date: 'Wed', items: 15 },
                { date: 'Thu', items: 22 },
                { date: 'Fri', items: 30 },
                { date: 'Sat', items: 8 },
                { date: 'Sun', items: 5 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
                <ReChartsTooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                   itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="items" stroke="#4f2d7f" strokeWidth={3} dot={{ r: 4, fill: '#4f2d7f' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card border-none rounded-xl">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="text-accent h-4 w-4" /> Auditor Efficiency Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[240px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={auditors.map((a: any) => ({ name: a.fullName.split(' ')[0], progress: a.completionPercent }))}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} hide />
                  <ReChartsTooltip 
                     cursor={{fill: 'transparent'}}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="progress" radius={[4, 4, 0, 0]} barSize={32}>
                    {auditors.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f2d7f' : '#a06dff'} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Auditor Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          Auditor Breakdown
          <Badge variant="outline" className="font-normal">{auditors.length} Total</Badge>
        </h2>
        
        <div className="grid grid-cols-1 gap-4">
          {auditors.map((auditor: any) => (
            <Card key={auditor.id} className="overflow-hidden hover:border-accent/30 transition-colors">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-12">
                  {/* Auditor Info */}
                  <div className="md:col-span-3 p-6 bg-muted/20 border-r">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                        {auditor.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{auditor.fullName}</div>
                        <div className="text-xs text-muted-foreground">{auditor.email}</div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Active Engagements</span>
                        <span className="font-medium">{auditor.activeEngagementsCount}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Open Tasks</span>
                        <span className="font-medium">{auditor.openLineItems}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Breakdown */}
                  <div className="md:col-span-9 p-6">
                    <div className="mb-6 space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span>Overall Progress</span>
                        <span>{auditor.completionPercent}%</span>
                      </div>
                      <Progress value={auditor.completionPercent} className="h-2" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {auditor.breakdown.map((b: any, idx: number) => (
                        <div key={idx} className="p-3 border rounded-md bg-muted/5 space-y-2">
                          <div className="font-medium text-[11px] truncate" title={b.auditName}>{b.auditName}</div>
                          <div className="flex flex-wrap gap-1">
                            {b.businessUnits.map((bu: any) => (
                              <Badge key={bu.id} variant="secondary" className="text-[9px] px-1 py-0">{bu.name}</Badge>
                            ))}
                          </div>
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>{b.totalItems - b.openItems} / {b.totalItems} verified</span>
                            <span className={b.openItems > 5 ? "text-amber-500 font-medium" : ""}>
                              {b.openItems} left
                            </span>
                          </div>
                        </div>
                      ))}
                      {auditor.breakdown.length === 0 && (
                        <div className="col-span-full py-4 text-center text-xs text-muted-foreground italic">
                          No active assignments
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeatmapPage;
