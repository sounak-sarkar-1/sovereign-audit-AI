import { Shield, Key, Lock, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

const roles = [
  {
    name: 'Admin',
    description: 'Full system access, user management, and global settings.',
    users: 2,
    permissions: ['all_access', 'manage_users', 'manage_tenants', 'configure_system']
  },
  {
    name: 'Manager',
    description: 'Manage audits, assign auditors, and review findings.',
    users: 5,
    permissions: ['manage_audits', 'assign_tasks', 'review_reports', 'manage_clients']
  },
  {
    name: 'Auditor',
    description: 'Execute audit tasks, upload evidence, and raise clarifications.',
    users: 12,
    permissions: ['execute_tests', 'upload_evidence', 'create_clarifications', 'view_assigned_audits']
  },
  {
    name: 'Client',
    description: 'View audit progress, respond to clarifications, and download reports.',
    users: 20,
    permissions: ['view_audits', 'respond_clarifications', 'download_reports']
  }
];

export default function AccessControl() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark dark:text-white flex items-center gap-3">
            <Shield className="text-primary dark:text-accent" />
            Access Control
          </h1>
          <p className="text-muted-foreground font-medium">Define roles and manage system-wide permissions.</p>
        </div>
        <Button className="rounded-full font-bold shadow-elevated">
          <Lock className="mr-2 h-4 w-4" /> CREATE ROLE
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10 border-b">
            <CardTitle className="text-lg">System Roles</CardTitle>
            <CardDescription>Predefined roles and their access levels.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/5">
                  <TableHead className="px-6 py-4">Role</TableHead>
                  <TableHead className="px-6 py-4">Description</TableHead>
                  <TableHead className="px-6 py-4">Permissions</TableHead>
                  <TableHead className="px-6 py-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.name} className="hover:bg-accent/5 transition-colors group">
                    <TableCell className="px-6 py-5 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Key size={16} />
                        </div>
                        <span className="font-bold text-dark dark:text-white uppercase tracking-tight">{role.name}</span>
                      </div>
                      <div className="mt-1 text-[10px] text-bg-muted font-bold uppercase">{role.users} Users</div>
                    </TableCell>
                    <TableCell className="px-6 py-5 align-top max-w-xs">
                       <p className="text-xs text-muted-foreground leading-relaxed">{role.description}</p>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="flex flex-wrap gap-1.5">
                        {role.permissions.map(p => (
                          <Badge key={p} variant="outline" className="text-[9px] uppercase font-black tracking-tight border-bg-mid">
                            {p.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-right align-top">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Eye size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <Edit size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
