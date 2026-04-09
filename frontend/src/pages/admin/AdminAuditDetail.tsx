import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Building2, 
  History,
  ShieldAlert,
  Info,
  ExternalLink,
  Clock
} from 'lucide-react';
import { adminAuditService } from '@/services/adminAuditService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminAuditDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: audit, isLoading, error } = useQuery({
    queryKey: ['admin-audit', id],
    queryFn: () => adminAuditService.getAuditById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Audit Not Found</h2>
        <p className="text-muted-foreground">The requested audit could not be loaded or does not exist.</p>
        <Button onClick={() => navigate('/admin/audit-oversight')}>Back to Oversight</Button>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'draft';
      case 'in_progress': return 'inProgress';
      case 'under_manager_review': return 'underReview';
      case 'pending_client_review': return 'pendingClient';
      case 'closed': return 'closed';
      case 'reopened': return 'default';
      case 'deleted': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin/audit-oversight')}
            className="mb-2 -ml-2 text-muted-foreground hover:text-dark"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Oversight
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{audit.name}</h1>
            <Badge variant={getStatusVariant(audit.status)} className="capitalize px-3 py-0.5 text-xs font-bold">
              {audit.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">{audit.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Info Cards */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm border-bg-mid">
            <CardHeader className="bg-bg-warm/10 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info size={18} className="text-primary" />
                Audit Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/5 text-primary">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-bg-muted tracking-wider block">Client Organization</label>
                    <span className="font-semibold text-dark">{audit.client?.fullName || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/5 text-primary">
                    <User size={20} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-bg-muted tracking-wider block">Engagement Manager</label>
                    <span className="font-semibold text-dark">{audit.manager?.fullName || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/5 text-primary">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-bg-muted tracking-wider block">Timeline</label>
                    <div className="text-sm font-medium">
                      Start: <span className="text-dark font-bold">{audit.startDate ? format(new Date(audit.startDate), 'MMM d, yyyy') : 'N/A'}</span>
                    </div>
                    <div className="text-sm font-medium">
                      Exp. End: <span className="text-dark font-bold">{audit.expectedCompletionDate ? format(new Date(audit.expectedCompletionDate), 'MMM d, yyyy') : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-bg-mid">
            <CardHeader className="bg-bg-warm/10 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 size={18} className="text-primary" />
                Business Units in Scope
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {audit.businessUnits?.length > 0 ? (
                  audit.businessUnits.map((bu: any) => (
                    <Badge key={bu.id} variant="secondary" className="bg-bg-warm border-bg-mid text-bg-muted h-9 px-4 text-xs font-bold rounded-full">
                      {bu.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground italic text-sm">No business units assigned to this audit.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Exceptional Action Request Block */}
          {audit.hasPendingExceptionalRequest && (
            <Card className="border-amber-200 bg-amber-50/50 shadow-sm overflow-hidden">
               <div className="bg-amber-100/50 px-4 py-3 border-b border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                    <ShieldAlert size={16} />
                    EXCEPTIONAL ACTION REQUEST PENDING
                  </div>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-amber-700 font-bold p-0 h-auto"
                    onClick={() => navigate('/admin/exceptional-requests')}
                  >
                    REVIEW REQUEST <ExternalLink size={12} className="ml-1" />
                  </Button>
               </div>
               <CardContent className="p-4 bg-white/50">
                  <p className="text-sm text-amber-900 leading-relaxed font-medium italic">
                    This audit has a pending request for deletion or reopening that requires administrator approval.
                  </p>
               </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Audit Trail */}
        <div className="space-y-6">
           <Card className="shadow-sm border-bg-mid h-full flex flex-col">
            <CardHeader className="bg-bg-warm/10 border-b shrink-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <History size={18} className="text-primary" />
                Audit Trail
              </CardTitle>
              <CardDescription>Chronological log of major events.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <ScrollArea className="h-[400px]">
                <div className="p-6 space-y-6">
                  {audit.auditTrail && audit.auditTrail.length > 0 ? (
                    audit.auditTrail.map((entry: any, idx: number) => (
                      <div key={idx} className="relative pl-6 border-l-2 border-bg-mid pb-6 last:pb-0">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-primary"></div>
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold text-bg-muted uppercase tracking-widest flex items-center gap-2">
                            <Clock size={10} />
                            {format(new Date(entry.createdAt), 'MMM d, yyyy · p')}
                          </div>
                          <div className="font-bold text-sm text-dark leading-tight">
                            {entry.actionType.replace(/_/g, ' ')}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            by {entry.actorUser?.fullName || 'System'} 
                            <Badge variant="outline" className="text-[8px] h-4 py-0 px-1 ml-1 opacity-70">
                              {entry.actorUser?.role || 'SYSTEM'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <History size={32} className="text-bg-mid mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-bg-muted italic">No audit trail entries found.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditDetail;
