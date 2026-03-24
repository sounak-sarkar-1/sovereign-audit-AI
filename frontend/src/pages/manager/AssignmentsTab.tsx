import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Loader2, 
  ChevronRight,
  ChevronDown,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { auditService } from '@/services/auditService';
import type { Audit } from '@/types/audit';

interface AssignmentsTabProps {
  audit: Audit;
  isDraft: boolean;
}

const AssignmentsTab: React.FC<AssignmentsTabProps> = ({ audit, isDraft }) => {
  const queryClient = useQueryClient();
  const [isLineItemModalOpen, setIsLineItemModalOpen] = useState(false);
  const [expandedBuId, setExpandedBuId] = useState<string | null>(null);

  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ['assignments', audit.id],
    queryFn: () => auditService.getAssignments(audit.id),
  });

  const assignBuMutation = useMutation({
    mutationFn: (data: { auditorId: string; auditBusinessUnitId: string }) => 
      auditService.assignToBU(audit.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', audit.id] });
    }
  });

  const unassignBuMutation = useMutation({
    mutationFn: (assignmentId: string) => 
      auditService.unassignFromBU(audit.id, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', audit.id] });
    }
  });

  const assignLiMutation = useMutation({
    mutationFn: (data: { auditorId: string; lineItemId: string }) => 
      auditService.assignToLineItem(audit.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', audit.id] });
    }
  });

  const unassignLiMutation = useMutation({
    mutationFn: (assignmentId: string) => 
      auditService.unassignFromLineItem(audit.id, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', audit.id] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <span className="ml-2">Loading assignments...</span>
      </div>
    );
  }

  const { auditors, businessUnits, buAssignments, lineItems, lineItemAssignments } = assignmentsData || {
    auditors: [],
    businessUnits: [],
    buAssignments: [],
    lineItems: [],
    lineItemAssignments: []
  };

  const getBuAssignment = (buId: string, auditorId: string) => {
    return buAssignments.find((a: any) => a.auditBusinessUnitId === buId && a.auditorId === auditorId);
  };

  return (
    <div className="pt-2 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Auditor Assignments
          <Badge variant="outline" className="font-normal">
            {auditors.length} Auditors available
          </Badge>
        </h3>
        <Button size="sm" variant="outline" onClick={() => setIsLineItemModalOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" /> Granular Assignments
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Business Unit Assignment Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground w-1/4">Business Unit</th>
                  {auditors.map((auditor: any) => (
                    <th key={auditor.id} className="text-center py-3 px-2 font-medium text-muted-foreground">
                      <div className="flex flex-col items-center">
                        <span className="truncate max-w-[100px]">{auditor.fullName}</span>
                        <span className="text-[10px] font-normal opacity-60">{auditor.email}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {businessUnits.map((bu: any) => (
                  <tr key={bu.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 font-medium">{bu.businessUnit.name}</td>
                    {auditors.map((auditor: any) => {
                      const assignment = getBuAssignment(bu.id, auditor.id);
                      const isAssigned = !!assignment;
                      return (
                        <td key={auditor.id} className="text-center py-4 px-2">
                          <Checkbox 
                            checked={isAssigned}
                            disabled={!isDraft || assignBuMutation.isPending || unassignBuMutation.isPending}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                assignBuMutation.mutate({ auditorId: auditor.id, auditBusinessUnitId: bu.id });
                              } else if (assignment) {
                                unassignBuMutation.mutate(assignment.id);
                              }
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Granular Line-Item Assignments Modal */}
      <Dialog open={isLineItemModalOpen} onOpenChange={setIsLineItemModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Granular Line-Item Assignments</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-4">
            {businessUnits.map((bu: any) => (
              <div key={bu.id} className="border rounded-lg overflow-hidden">
                <button 
                  className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors"
                  onClick={() => setExpandedBuId(expandedBuId === bu.id ? null : bu.id)}
                >
                  <div className="flex items-center gap-2">
                    {expandedBuId === bu.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span className="font-medium text-sm">{bu.businessUnit.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {lineItems.filter((li: any) => li.auditBusinessUnitId === bu.id).length} items
                  </Badge>
                </button>
                
                {expandedBuId === bu.id && (
                  <div className="p-0 border-t bg-card">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/10 border-b">
                        <tr>
                          <th className="text-left p-3 font-medium text-muted-foreground w-1/2">Line Item</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Assigned Auditor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.filter((li: any) => li.auditBusinessUnitId === bu.id).map((li: any) => {
                          const liAsgn = lineItemAssignments.find((a: any) => a.lineItemId === li.id);
                          return (
                            <tr key={li.id} className="border-b last:border-0 hover:bg-muted/5">
                              <td className="p-3">
                                <div className="font-medium">{li.name}</div>
                                <div className="text-muted-foreground text-[10px] line-clamp-1">{li.description}</div>
                              </td>
                              <td className="p-3">
                                <Select 
                                  value={liAsgn?.auditorId || 'none'} 
                                  disabled={!isDraft || assignLiMutation.isPending || unassignLiMutation.isPending}
                                  onValueChange={(val) => {
                                    if (val === 'none') {
                                      if (liAsgn) unassignLiMutation.mutate(liAsgn.id);
                                    } else {
                                      assignLiMutation.mutate({ auditorId: val, lineItemId: li.id });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8 text-[11px]">
                                    <SelectValue placeholder="Unassigned" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Unassigned</SelectItem>
                                    {auditors.map((a: any) => (
                                      <SelectItem key={a.id} value={a.id}>{a.fullName}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentsTab;
