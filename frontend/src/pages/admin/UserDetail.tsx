import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  CheckCircle,
  XCircle,
  Building,
  Users
} from 'lucide-react';
import api from '@/lib/api';
import { UserRole, UserStatus } from '@/types/user';
import type { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { MappingPanel } from '@/components/admin/MappingPanel';
import { BusinessUnitPanel } from '@/components/admin/BusinessUnitPanel';

const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const { data: rawUser, isLoading } = useQuery<any>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });

  const user = (rawUser as any)?.data || rawUser;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground text-lg animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">User Not Found</h2>
        <Button variant="link" onClick={() => navigate('/admin/users')}>Back to Users</Button>
      </div>
    );
  }

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge className="bg-purple-100 text-purple-700">Admin</Badge>;
      case UserRole.MANAGER:
        return <Badge className="bg-blue-100 text-blue-700">Manager</Badge>;
      case UserRole.AUDITOR:
        return <Badge className="bg-green-100 text-green-700">Auditor</Badge>;
      case UserRole.CLIENT:
        return <Badge className="bg-orange-100 text-orange-700">Client</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    return status === UserStatus.ACTIVE ? (
      <Badge className="bg-green-50 text-green-600 border-green-200 gap-1">
        <CheckCircle className="w-3 h-3" /> Active
      </Badge>
    ) : (
      <Badge variant="outline" className="text-muted-foreground gap-1">
        <XCircle className="w-3 h-3" /> Inactive
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/admin/users')}
        className="gap-2 -ml-2 text-muted-foreground hover:text-dark"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to User List
      </Button>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold mx-auto mb-4">
                {user.fullName.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-dark">{user.fullName}</h2>
              <div className="flex justify-center gap-2 mt-2">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.status)}
              </div>
            </CardContent>
            <div className="border-t p-4 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-dark">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-dark">{user.phone || 'No phone number'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined {format(new Date(user.createdAt), 'MMMM d, yyyy')}</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>First Login</span>
                <Badge variant={user.isFirstLogin ? "default" : "outline"}>
                  {user.isFirstLogin ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Last Updated</span>
                <span className="text-muted-foreground text-xs">{format(new Date(user.updatedAt), 'MMM d, p')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-2/3 space-y-6">
          {user.role === UserRole.CLIENT && (
            <Card>
              <CardHeader className="border-b bg-muted/10">
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Business Units
                </CardTitle>
                <CardDescription>Manage business units for this client.</CardDescription>
              </CardHeader>
              <CardContent className="py-6">
                <BusinessUnitPanel clientId={user.id} />
              </CardContent>
            </Card>
          )}

          {user.role === UserRole.MANAGER && (
            <>
              <Card>
                <CardHeader className="border-b bg-muted/10">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Auditor Mappings
                  </CardTitle>
                  <CardDescription>Auditors assigned to this manager.</CardDescription>
                </CardHeader>
                <CardContent className="py-6">
                  <MappingPanel managerId={user.id} type="auditor" existingMappings={user.auditorMappings || []} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b bg-muted/10">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    Client Mappings
                  </CardTitle>
                  <CardDescription>Clients assigned to this manager.</CardDescription>
                </CardHeader>
                <CardContent className="py-6">
                  <MappingPanel managerId={user.id} type="client" existingMappings={user.clientMappings || []} />
                </CardContent>
              </Card>
            </>
          )}

          {user.role === UserRole.AUDITOR && (
            <Card>
              <CardHeader className="border-b bg-muted/10">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Managed By
                </CardTitle>
                <CardDescription>Managers this auditor is assigned to.</CardDescription>
              </CardHeader>
              <CardContent className="py-6">
                <div className="space-y-2">
                  {user.managedByMappings?.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic text-center py-4">No managers assigned.</p>
                  ) : (
                    user.managedByMappings?.map((m: any) => (
                      <div key={m.id} className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                        <span className="text-sm font-medium">{m.manager?.fullName}</span>
                        <span className="text-xs text-muted-foreground">{m.manager?.email}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="border-b bg-muted/10">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Shield className="w-5 h-5" />
                Access Log
              </CardTitle>
              <CardDescription>Recent activity for this user.</CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              <p className="text-muted-foreground text-center text-sm italic">No recent activity found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
