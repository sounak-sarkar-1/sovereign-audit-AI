import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { clientService } from '@/services/clientService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { Info, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

const Insights: React.FC = () => {
  const { data: insightsData, isLoading } = useQuery({
    queryKey: ['client-insights-full'],
    queryFn: () => clientService.getInsights(),
  });

  const insights = insightsData?.data || { auditsCount: 0, complianceTrend: [], riskByBu: [] };

  if (isLoading) {
    return <div className="p-8">Loading Insights...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Compliance Insights</h1>
        <p className="text-muted-foreground">
          Deep-dive analytics into organizational compliance performance and risk trends.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Compliance Velocity</CardTitle>
            <CardDescription>Progression of audit scores over the last 12 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={insights.complianceTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(new Date(val), 'MMM yyyy')}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[80, 100]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  labelFormatter={(val) => format(new Date(val), 'PPP')}
                />
                <Legend />
                <Line 
                  name="Compliance Score"
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4f2d7f" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: "#4f2d7f", strokeWidth: 2, stroke: "#fff" }} 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <ShieldCheck className="mr-2 h-4 w-4 text-emerald-500" />
                Overall Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">Excellent</div>
              <p className="text-xs text-muted-foreground mt-1">Based on {insights.auditsCount} completed audits.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                Critical Gaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">03</div>
              <p className="text-xs text-muted-foreground mt-1">Found in most recent Access Review.</p>
            </CardContent>
          </Card>

          <Card className="bg-[#4f2d7f] text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/80">AI Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">96.4%</div>
              <p className="text-xs text-white/60 mt-1">Estimated score for next quarter based on current remediation pace.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Heatmap by Business Unit</CardTitle>
          <CardDescription>Identifying high-risk clusters across your organization.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={insights.riskByBu} 
              layout="vertical"
              margin={{ left: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis 
                type="category" 
                dataKey="buName" 
                fontSize={12}
                width={120}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(79, 45, 127, 0.05)' }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Exception Rate']}
              />
              <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={30}>
                {insights.riskByBu.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.rate > 15 ? "#ef4444" : "#4f2d7f"} 
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Insights;
