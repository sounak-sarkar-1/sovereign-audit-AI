import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Target
} from 'lucide-react';
import { auditorService } from '@/services/auditorService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const AuditorPerformance: React.FC = () => {
  const { data: audits } = useQuery({
    queryKey: ['auditor-audits'],
    queryFn: () => auditorService.getAudits(),
  });

  // Mock performance data based on audits
  const totalAudits = audits?.length || 0;
  const completedAudits = audits?.filter((a: any) => a.status === 'completed' || a.status === 'submitted').length || 0;
  const completionRate = totalAudits > 0 ? (completedAudits / totalAudits) * 100 : 0;
  
  const avgCompletionPercent = audits && audits.length > 0 
    ? audits.reduce((acc: number, curr: any) => acc + (curr.stats?.completionPercent || 0), 0) / audits.length 
    : 0;

  const data = [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 18 },
    { name: 'Wed', value: 15 },
    { name: 'Thu', value: 25 },
    { name: 'Fri', value: 32 },
    { name: 'Sat', value: 10 },
    { name: 'Sun', value: 5 },
  ];

  const categoryData = [
    { name: 'Financial', value: 85, color: '#4f2d7f' },
    { name: 'Operational', value: 72, color: '#a06dff' },
    { name: 'Compliance', value: 94, color: '#2b144d' },
    { name: 'Technical', value: 65, color: '#7c3aed' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card border-none bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completion Rate</p>
                <h3 className="text-2xl font-bold text-dark">{Math.round(completionRate)}%</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Target size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-green-600 font-bold">
              <TrendingUp size={14} />
              <span>+5.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-none bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg. Progress</p>
                <h3 className="text-2xl font-bold text-dark">{Math.round(avgCompletionPercent)}%</h3>
              </div>
              <div className="p-2 bg-accent/10 rounded-xl text-accent">
                <Zap size={20} />
              </div>
            </div>
            <Progress value={avgCompletionPercent} className="h-1 mt-4" />
          </CardContent>
        </Card>

        <Card className="shadow-card border-none bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Exceptions</p>
                <h3 className="text-2xl font-bold text-dark">
                  {audits?.reduce((acc: number, a: any) => acc + (a.stats?.pendingExceptions || 0), 0)}
                </h3>
              </div>
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                <AlertCircle size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span>Awaiting manager review</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-none bg-primary text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Performance Rank</p>
                <h3 className="text-2xl font-bold">Elite Auditor</h3>
              </div>
              <div className="p-2 bg-white/20 rounded-xl">
                <Award size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-white/90">
              <CheckCircle2 size={14} />
              <span>Top 5% in organization</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Chart */}
        <Card className="lg:col-span-2 shadow-card border-none bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Productivity</CardTitle>
            <CardDescription>Number of items responded to per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f2d7f" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f2d7f" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#888'}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#888'}}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4f2d7f" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Competency Breakdown */}
        <Card className="shadow-card border-none bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Competency Areas</CardTitle>
            <CardDescription>Accuracy by audit category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{fontSize: 12, fontWeight: 600, fill: '#2b144d'}}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Recent Achievements</h4>
              <div className="flex gap-3 p-3 rounded-xl bg-accent/5 border border-accent/10">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-accent shadow-sm">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-dark">Speed Demon</p>
                  <p className="text-xs text-muted-foreground">3 audits completed ahead of schedule</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditorPerformance;
