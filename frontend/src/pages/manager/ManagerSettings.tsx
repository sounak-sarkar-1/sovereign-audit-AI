import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Settings, 
  Bell, 
  Shield, 
  Users, 
  Mail, 
  Clock, 
  Smartphone,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../../components/ui/tabs';
import { managerService } from '../../services/managerService';
import { toast } from 'sonner';

const ManagerSettings: React.FC = () => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['manager-settings'],
    queryFn: () => managerService.getSettings(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => managerService.updateSettings(data),
    onSuccess: () => {
      toast.success('Settings updated successfully');
    },
  });

  const handleToggle = (key: string) => {
    if (!settings) return;
    const newSettings = { ...settings };
    // Simplified toggle for demonstration
    updateMutation.mutate(newSettings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-dark">Management Settings</h1>
        <p className="text-muted-foreground">
          Configure your operational preferences and notification workflows.
        </p>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="bg-muted/30 p-1 rounded-full w-fit mb-8">
          <TabsTrigger value="notifications" className="rounded-full px-8 gap-2">
            <Bell size={14} /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-full px-8 gap-2">
            <Lock size={14} /> Team & Security
          </TabsTrigger>
          <TabsTrigger value="export" className="rounded-full px-8 gap-2">
            <Globe size={14} /> Regional Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-card border-none bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Communication Workflow</CardTitle>
                <CardDescription>How you receive updates about audit progress.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-dark flex items-center gap-2">
                       <Mail size={14} className="text-primary" /> Email Alerts
                    </div>
                    <div className="text-xs text-muted-foreground">Receive real-time notifications via email.</div>
                  </div>
                  <Switch checked={true} onCheckedChange={() => handleToggle('email')} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-dark flex items-center gap-2">
                       <Smartphone size={14} className="text-accent" /> In-App Popups
                    </div>
                    <div className="text-xs text-muted-foreground">Show notification banners while in the platform.</div>
                  </div>
                  <Switch checked={true} onCheckedChange={() => handleToggle('inApp')} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-dark flex items-center gap-2">
                       <Clock size={14} className="text-orange-500" /> Daily Summary
                    </div>
                    <div className="text-xs text-muted-foreground">Receive a digestive summary at 8:00 AM daily.</div>
                  </div>
                  <Switch checked={true} onCheckedChange={() => handleToggle('summary')} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-none bg-white overflow-hidden">
               <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <CardTitle className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                     <Shield size={14} /> Management Access
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-6 space-y-4">
                  <p className="text-sm font-medium text-dark/70 leading-relaxed">
                     Your manager profile has authorization to view all audits within your mapped business units. 
                  </p>
                  <div className="pt-2">
                     <Badge className="rounded-full bg-primary/10 text-primary border-none font-bold text-[10px]">
                        LEVEL 2: ENGAGEMENT LEAD
                     </Badge>
                  </div>
                  <Button variant="outline" className="w-full rounded-full bg-white shadow-sm font-bold text-xs mt-4">
                     Request Access Elevation
                  </Button>
               </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
           <Card className="shadow-card border-none bg-white">
              <CardContent className="p-12 text-center space-y-6">
                 <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground mx-auto">
                    <Users size={40} />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-xl font-bold text-dark">Team Management</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                       You can view team performance metrics in the Heatmap. Direct auditor profile management is restricted to Admin roles.
                    </p>
                 </div>
                 <Button className="rounded-full bg-primary px-8 shadow-sm">
                    View Team Heatmap
                 </Button>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerSettings;
