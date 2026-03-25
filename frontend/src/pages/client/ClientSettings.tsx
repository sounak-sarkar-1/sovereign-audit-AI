import React from 'react';
import { 
  Settings, 
  Users, 
  Building2, 
  ShieldCheck, 
  Bell, 
  Lock,
  UserPlus,
  Mail,
  MoreVertical,
  MinusCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const ClientSettings: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-dark">Settings & Organization</h1>
        <p className="text-muted-foreground">Manage your account, team, and organization preferences.</p>
      </div>

      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="bg-muted/20 p-1 rounded-full mb-6">
          <TabsTrigger value="organization" className="rounded-full px-6 gap-2">
            <Building2 size={14} /> Organization
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-full px-6 gap-2">
            <Users size={14} /> Team Members
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-full px-6 gap-2">
            <Bell size={14} /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-full px-6 gap-2">
            <Lock size={14} /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6 mt-0">
          <Card className="shadow-card border-none bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Organization Details</CardTitle>
              <CardDescription>Update your company's profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Company Name</label>
                   <Input defaultValue="Global Corp Ltd." className="rounded-xl border-bg-mid" />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tax ID / Registration</label>
                   <Input defaultValue="GB-12345678" className="rounded-xl border-bg-mid" />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Industry Sector</label>
                   <Input defaultValue="Financial Services" className="rounded-xl border-bg-mid" />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Website</label>
                   <Input defaultValue="https://globalcorp.com" className="rounded-xl border-bg-mid" />
                </div>
              </div>
              <div className="pt-4 border-t flex justify-end">
                <Button className="rounded-full bg-primary px-8">Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-none bg-white overflow-hidden">
             <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg">Regulatory Scope</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y">
                   {[
                     { name: 'GDPR Compliance', status: 'Active', color: 'green' },
                     { name: 'SOC 2 Type II', status: 'In Review', color: 'blue' },
                     { name: 'ISO 27001', status: 'Active', color: 'green' }
                   ].map((item, i) => (
                     <div key={i} className="p-4 flex items-center justify-between">
                        <span className="text-sm font-bold text-dark">{item.name}</span>
                        <Badge className={item.color === 'green' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                           {item.status}
                        </Badge>
                     </div>
                   ))}
                </div>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6 mt-0">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold text-dark">Team Members</h2>
             <Button className="rounded-full bg-primary hover:bg-primary/90 gap-2">
                <UserPlus size={16} /> Invite Member
             </Button>
          </div>

          <Card className="shadow-card border-none bg-white overflow-hidden">
             <CardContent className="p-0">
                <div className="divide-y">
                   {[
                     { name: 'John Doe', email: 'john@globalcorp.com', role: 'Executive Sponsor', avatar: 'JD' },
                     { name: 'Jane Smith', email: 'jane@globalcorp.com', role: 'Compliance Lead', avatar: 'JS' },
                     { name: 'Sarah Wilson', email: 'sarah@globalcorp.com', role: 'Finance Manager', avatar: 'SW' },
                     { name: 'Alex Brown', email: 'alex@globalcorp.com', role: 'Legal Counsel', avatar: 'AB' }
                   ].map((user, i) => (
                      <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-10 w-10 border shadow-sm">
                              <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">{user.avatar}</AvatarFallback>
                           </Avatar>
                           <div>
                              <p className="text-sm font-bold text-dark">{user.name}</p>
                              <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                 <Mail size={10} /> {user.email}
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <Badge variant="outline" className="text-muted-foreground border-bg-mid font-medium">
                              {user.role}
                           </Badge>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="rounded-full">
                                    <MoreVertical size={16} />
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                 <DropdownMenuItem>Edit Role</DropdownMenuItem>
                                 <DropdownMenuItem className="text-red-600">
                                     <MinusCircle size={14} className="mr-2" /> Deactivate
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </div>
                      </div>
                   ))}
                </div>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-0">
           <Card className="shadow-card border-none bg-white">
              <CardHeader>
                 <CardTitle className="text-lg">Security Settings</CardTitle>
                 <CardDescription>Manage your organization's security and access controls.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="p-4 rounded-2xl bg-muted/20 border border-bg-mid flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="text-primary" />
                       <div>
                          <p className="text-sm font-bold text-dark">Multi-Factor Authentication</p>
                          <p className="text-xs text-muted-foreground">Enforce MFA for all your internal team members.</p>
                       </div>
                    </div>
                    <Button variant="outline" className="rounded-full">Enabled</Button>
                 </div>
                 
                 <div className="pt-4 border-t space-y-4">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Access Logs</h4>
                    <p className="text-sm text-muted-foreground italic">No recent unusual login attempts detected.</p>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientSettings;
