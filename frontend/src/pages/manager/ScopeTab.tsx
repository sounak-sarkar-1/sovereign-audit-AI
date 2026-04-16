import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  FileSpreadsheet,
  Plus,
  Loader2,
  FileText,
  CheckCircle2,
  Library,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { scopeService } from '@/services/scopeService';
import { templateService } from '@/services/templateService';
import ScopeItemsTable from './ScopeItemsTable';
import type { ScopeLineItem, InputMethod, ImportSession } from '@/types/scope';
import type { Audit } from '@/types/audit';

interface ScopeTabProps {
  audit: Audit;
  isDraft: boolean;
}

const ScopeTab: React.FC<ScopeTabProps> = ({ audit, isDraft }) => {
  const queryClient = useQueryClient();
  const [activeBuId, setActiveBuId] = useState<string>(audit.businessUnits?.[0]?.id || '');

  // Manual Entry Dialog State
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScopeLineItem | null>(null);
  const [manualFormData, setManualFormData] = useState({
    name: '',
    description: '',
    inputMethod: 'free_text' as InputMethod,
    options: ''
  });

  // AI Extraction State
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [aiJobId, setAiJobId] = useState<string | null>(null);
  const [aiJobStatus, setAiJobStatus] = useState<'queued' | 'processing' | 'completed' | 'failed' | 'none'>('none');
  const [extractedItems, setExtractedItems] = useState<any[]>([]);

  // Excel Import State
  const [isExcelDialogOpen, setIsExcelDialogOpen] = useState(false);
  const [importSession, setImportSession] = useState<ImportSession | null>(null);
  const [excelMapping, setExcelMapping] = useState({
    nameColumn: '',
    descriptionColumn: '',
    inputMethodColumn: ''
  });

  // Template Import State
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const { data: scopeItemsByBu, isLoading } = useQuery({
    queryKey: ['scope', audit.id],
    queryFn: () => scopeService.getScope(audit.id),
  });

  const { data: templatesData } = useQuery({
    queryKey: ['admin-templates'],
    queryFn: () => templateService.getTemplates(1, 100),
    enabled: isTemplateDialogOpen
  });

  const upsertMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingItem) {
        return scopeService.updateLineItem(audit.id, editingItem.id, data);
      }
      return scopeService.createLineItems(audit.id, {
        auditBusinessUnitId: activeBuId,
        items: [data]
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scope', audit.id] });
      setIsManualDialogOpen(false);
      resetManualForm();
      toast.success('Scope item saved successfully');
      // If adding a new item, redistribution is needed
      if (!editingItem) {
        distributeMutation.mutate();
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save scope item');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => scopeService.deleteLineItem(audit.id, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scope', audit.id] });
      distributeMutation.mutate();
    }
  });

  const excelUploadMutation = useMutation({
    mutationFn: (file: File) => scopeService.importFromExcel(audit.id, file, activeBuId),
    onSuccess: (data: ImportSession) => {
      setImportSession(data);
      toast.success('Excel file processed. Please map the columns.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to analyze Excel file');
    }
  });

  const extractMutation = useMutation({
    mutationFn: (file: File) => scopeService.extractFromDocument(audit.id, file, activeBuId),
    onSuccess: (data: { jobId: string }) => {
      setAiJobId(data.jobId);
      setAiJobStatus('queued');
    }
  });

  const templateImportMutation = useMutation({
    mutationFn: (templateId: string) => scopeService.importFromTemplate(audit.id, {
      templateIds: [templateId],
      auditBusinessUnitId: activeBuId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scope', audit.id] });
      setIsTemplateDialogOpen(false);
      setSelectedTemplateId('');
      toast.success('Items imported from template');
      distributeMutation.mutate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to import from template');
    }
  });

  const distributeMutation = useMutation({
    mutationFn: () => scopeService.distributeEqualWeightage(audit.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scope', audit.id] });
      toast.success('Equal weightage distributed');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to distribute weightages');
    }
  });

  const confirmAiBatchMutation = useMutation({
    mutationFn: (items: any[]) => scopeService.createLineItems(audit.id, {
      auditBusinessUnitId: activeBuId,
      items: items.map(it => ({
        name: it.name,
        description: it.description,
        inputMethod: it.inputMethod || 'free_text',
        options: it.options || []
      }))
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scope', audit.id] });
      setIsAiDialogOpen(false);
      resetAiFlow();
      distributeMutation.mutate();
    }
  });

  const confirmExcelMutation = useMutation({
    mutationFn: (mapping: any) => scopeService.confirmExcelImport(audit.id, importSession!.importId, { columnMapping: mapping }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scope', audit.id] });
      setIsExcelDialogOpen(false);
      setImportSession(null);
      toast.success('Scope items imported successfully');
      distributeMutation.mutate();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to import scope items');
    }
  });

  useEffect(() => {
    let interval: any;
    if (aiJobId && (aiJobStatus === 'queued' || aiJobStatus === 'processing')) {
      interval = setInterval(async () => {
        try {
          const job = await scopeService.getAiJob(aiJobId);
          setAiJobStatus(job.status);
          if (job.status === 'completed' && job.outputPayload) {
            setExtractedItems(job.outputPayload.items);
            clearInterval(interval);
          } else if (job.status === 'failed') {
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Polling failed', err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [aiJobId, aiJobStatus]);

  const resetManualForm = () => {
    setEditingItem(null);
    setManualFormData({
      name: '',
      description: '',
      inputMethod: 'free_text',
      options: ''
    });
  };

  const resetAiFlow = () => {
    setAiJobId(null);
    setAiJobStatus('none');
    setExtractedItems([]);
  };

  const handleEdit = (item: ScopeLineItem) => {
    setEditingItem(item);
    setManualFormData({
      name: item.name,
      description: item.description,
      inputMethod: item.inputMethod,
      options: item.options?.map(o => o.optionText).join(', ') || ''
    });
    setIsManualDialogOpen(true);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...manualFormData,
      options: manualFormData.inputMethod === 'multiple_choice'
        ? manualFormData.options.split(',').map(s => s.trim()).filter(Boolean)
        : []
    };
    upsertMutation.mutate(payload);
  };

  const hasAnyItems = scopeItemsByBu && Object.keys(scopeItemsByBu).length > 0;

  const currentBuItems = scopeItemsByBu?.[activeBuId] || [];
  const totalWeightage = Math.round(currentBuItems.reduce((sum, item) => sum + (item.weightage || 0), 0) * 100) / 100;
  const isWeightageValid = totalWeightage === 100;
  const missingWeightage = Math.round((100 - totalWeightage) * 100) / 100;
  const canEditWeightage = audit.status === 'draft' || audit.status === 'in_progress';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <span className="ml-2">Loading scope items...</span>
      </div>
    );
  }

  return (
    <div className="pt-2 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-dark dark:text-white flex items-center gap-3">
          Scope Management
          <Badge variant="outline" className="font-bold border-bg-mid py-0 h-6 px-3">
            {Object.values(scopeItemsByBu || {}).flat().length} ITEMS
          </Badge>
        </h3>
        {isDraft && (
          <div className="flex flex-wrap gap-2">
            {!hasAnyItems && (
              <Button size="sm" variant="outline" onClick={() => setIsManualDialogOpen(true)} className="rounded-full border-bg-mid">
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setIsAiDialogOpen(true)} className="rounded-full gap-2 border-primary/20 text-primary dark:text-accent font-bold bg-primary/5 dark:bg-accent/5 hover:bg-primary/10 transition-all">
              <Sparkles className="h-4 w-4" /> AI EXTRACT
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsTemplateDialogOpen(true)} className="rounded-full gap-2 border-bg-mid font-medium">
              <Library className="h-4 w-4" /> Template Import
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsExcelDialogOpen(true)} className="rounded-full gap-2 border-bg-mid font-medium">
              <FileSpreadsheet className="h-4 w-4" /> Excel Import
            </Button>
          </div>
        )}
      </div>

      {!hasAnyItems && !isManualDialogOpen && !isAiDialogOpen && !isExcelDialogOpen ? (
        <EmptyState
          icon={Plus}
          title="Audit scope is currently empty"
          description="Build your audit framework by adding checkpoints manually, importing an Excel file, or using our AI to extract items from policy documents."
          action={{
            label: "Define Scope Manually",
            onClick: () => setIsManualDialogOpen(true),
            icon: Plus
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* Weightage Summary Bar */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#1a0d35]/80 backdrop-blur-md border border-bg-mid dark:border-[#3d2a5a] rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Weightage</span>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-black ${totalWeightage === 100 ? 'text-green-600' :
                    totalWeightage > 0 ? 'text-amber-500' : 'text-destructive'
                    }`}>
                    {totalWeightage}%
                  </span>
                  {totalWeightage === 100 ? (
                    <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  ) : (
                    <div className={`${totalWeightage > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-destructive/10'} p-1 rounded-full`}>
                      <AlertTriangle className={`h-4 w-4 ${totalWeightage > 0 ? 'text-amber-500' : 'text-destructive'}`} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => distributeMutation.mutate()}
              disabled={distributeMutation.isPending || !hasAnyItems || !canEditWeightage}
              className="rounded-full border-primary/20 hover:bg-primary/5 font-bold"
            >
              {distributeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Distribute Equally
            </Button>
          </div>

          {/* Warning Banner */}
          {!isWeightageValid && hasAnyItems && (
            <Alert variant="warning" className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-bold">Weightages incomplete</AlertTitle>
              <AlertDescription>
                Weightages must sum to 100% before the audit report can be generated.
                Current total: <span className="font-bold">{totalWeightage}%</span>.
                {missingWeightage > 0 ? `Missing: ${missingWeightage}%` : `Excess: ${Math.abs(missingWeightage)}%`}
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeBuId} onValueChange={setActiveBuId} className="w-full">
            <TabsList className="mb-4">
              {audit.businessUnits?.map((bu: any) => (
                <TabsTrigger key={bu.id} value={bu.id}>
                  {bu.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {audit.businessUnits?.map((bu: any) => (
              <TabsContent key={bu.id} value={bu.id} className="mt-0">
                <div className="bg-white dark:bg-[#1a0d35] rounded-xl overflow-hidden border border-bg-mid dark:border-[#3d2a5a]">
                  <ScopeItemsTable
                    auditId={audit.id}
                    auditStatus={audit.status}
                    items={scopeItemsByBu?.[bu.id] || []}
                    onEdit={handleEdit}
                    onDelete={(id: string) => confirm('Delete item?') && deleteMutation.mutate(id)}
                    isDraft={isDraft}
                    onRefresh={() => queryClient.invalidateQueries({ queryKey: ['scope', audit.id] })}
                  />
                </div>
                {isDraft && (
                  <Button
                    variant="ghost"
                    className="mt-4 text-primary dark:text-accent h-14 w-full border-2 border-dashed border-primary/20 dark:border-accent/20 hover:bg-primary/5 dark:hover:bg-accent/5 rounded-xl font-bold transition-all"
                    onClick={() => setIsManualDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-5 w-5" /> ADD CHECKPOINT TO {bu.name.toUpperCase()}
                  </Button>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Manual Entry Dialog */}
          <Dialog open={isManualDialogOpen} onOpenChange={(open: boolean) => { if (!open) resetManualForm(); setIsManualDialogOpen(open); }}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Scope Item' : 'Add New Scope Item'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleManualSubmit} className="space-y-4 py-4">
                {/* Form fields same as before, ensuring types are correct */}
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input id="name" value={manualFormData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualFormData({ ...manualFormData, name: e.target.value })} placeholder="e.g., Access Management Policy" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={manualFormData.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setManualFormData({ ...manualFormData, description: e.target.value })} placeholder="Audit objective..." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inputMethod">Input Method</Label>
                  <Select value={manualFormData.inputMethod} onValueChange={(v: string) => setManualFormData({ ...manualFormData, inputMethod: v as InputMethod })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free_text">Free Text</SelectItem>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {manualFormData.inputMethod === 'multiple_choice' && (
                  <div className="space-y-2">
                    <Label htmlFor="options">Options (comma-separated)</Label>
                    <Input id="options" value={manualFormData.options} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualFormData({ ...manualFormData, options: e.target.value })} placeholder="Pass, Fail, N/A" required />
                  </div>
                )}
                <DialogFooter>
                  <Button type="submit" disabled={upsertMutation.isPending} className="rounded-full">
                    {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingItem ? 'Update' : 'Add'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* AI Extraction Dialog */}
          <Dialog open={isAiDialogOpen} onOpenChange={(open: boolean) => { if (!open) resetAiFlow(); setIsAiDialogOpen(open); }}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" /> Gen AI Scope Extraction
                </DialogTitle>
              </DialogHeader>

              {aiJobStatus === 'none' && (
                <div className="space-y-6 py-6 text-center">
                  <div className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center gap-4 bg-muted/30">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Upload SOP or Policy Document</p>
                      <p className="text-xs text-muted-foreground">AI will extract audit checkpoints for <strong>{audit.businessUnits?.find((b: any) => b.id === activeBuId)?.name}</strong></p>
                    </div>
                    <input type="file" id="ai-file" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.files?.[0] && extractMutation.mutate(e.target.files[0])} />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('ai-file')?.click()} disabled={extractMutation.isPending}>
                      {extractMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Select SOP File
                    </Button>
                  </div>
                </div>
              )}

              {(aiJobStatus === 'queued' || aiJobStatus === 'processing') && (
                <div className="py-20 flex flex-col items-center gap-6 text-center">
                  <Loader2 className="h-12 w-12 text-accent animate-spin" />
                  <div className="space-y-1">
                    <h4 className="text-lg font-semibold">AI is analyzing your document...</h4>
                    <p className="text-sm text-muted-foreground italic tracking-wide">Expected time: ~30 seconds</p>
                  </div>
                </div>
              )}

              {aiJobStatus === 'completed' && extractedItems.length > 0 && (
                <div className="space-y-6 py-4">
                  <Alert className="bg-accent/5 border-accent/20">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <AlertTitle className="text-accent">Extraction Successful</AlertTitle>
                    <AlertDescription>Found {extractedItems.length} compliance checkpoints.</AlertDescription>
                  </Alert>
                  <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
                    {extractedItems.map((item, idx) => (
                      <div key={idx} className="p-3 border rounded-lg bg-card text-sm">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-muted-foreground text-xs mt-1">{item.description}</p>
                      </div>
                    ))}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetAiFlow}>Cancel</Button>
                    <Button onClick={() => confirmAiBatchMutation.mutate(extractedItems)} disabled={confirmAiBatchMutation.isPending}>
                      {confirmAiBatchMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add All to Scope
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Excel Import Dialog */}
          <Dialog open={isExcelDialogOpen} onOpenChange={(open: boolean) => setIsExcelDialogOpen(open)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" /> Excel Scope Import
                </DialogTitle>
              </DialogHeader>

              {!importSession ? (
                <div className="space-y-6 py-6 text-center">
                  <div className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center gap-4 bg-muted/30">
                    <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Upload an .xlsx or .xls file.</p>
                    <input type="file" id="excel-file" className="hidden" accept=".xlsx,.xls" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files?.[0]) excelUploadMutation.mutate(e.target.files[0]);
                    }} />
                    <Button variant="outline" onClick={() => document.getElementById('excel-file')?.click()} disabled={excelUploadMutation.isPending}>
                      {excelUploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Select Excel File
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <p className="text-sm font-medium">Map Excel Columns to Scope Fields</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Item Name</Label>
                      <Select value={excelMapping.nameColumn} onValueChange={(v: string) => setExcelMapping({ ...excelMapping, nameColumn: v })}>
                        <SelectTrigger><SelectValue placeholder="Select Column" /></SelectTrigger>
                        <SelectContent>
                          {importSession.detectedColumns.map((col: any) => (
                            <SelectItem key={col.columnLetter} value={col.columnLetter}>{col.headerText} ({col.columnLetter})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Select value={excelMapping.descriptionColumn} onValueChange={(v: string) => setExcelMapping({ ...excelMapping, descriptionColumn: v })}>
                        <SelectTrigger><SelectValue placeholder="Select Column" /></SelectTrigger>
                        <SelectContent>
                          {importSession.detectedColumns.map((col: any) => (
                            <SelectItem key={col.columnLetter} value={col.columnLetter}>{col.headerText} ({col.columnLetter})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Input Method (Optional)</Label>
                      <Select value={excelMapping.inputMethodColumn} onValueChange={(v: string) => setExcelMapping({ ...excelMapping, inputMethodColumn: v })}>
                        <SelectTrigger><SelectValue placeholder="Select Column" /></SelectTrigger>
                        <SelectContent>
                          {importSession.detectedColumns.map((col: any) => (
                            <SelectItem key={col.columnLetter} value={col.columnLetter}>{col.headerText} ({col.columnLetter})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setImportSession(null)}>Back</Button>
                    <Button onClick={() => confirmExcelMutation.mutate(excelMapping)} disabled={!excelMapping.nameColumn || confirmExcelMutation.isPending}>
                      {confirmExcelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirm Import
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Template Import Dialog */}
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Library className="h-5 w-5 text-accent" /> Import from Template
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Template</Label>
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Browse templates..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templatesData?.items.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedTemplateId && (
                  <p className="text-xs text-muted-foreground italic">
                    {templatesData?.items.find(t => t.id === selectedTemplateId)?.description || 'No description available.'}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>Cancel</Button>
                <Button
                  className="bg-accent"
                  disabled={!selectedTemplateId || templateImportMutation.isPending}
                  onClick={() => templateImportMutation.mutate(selectedTemplateId)}
                >
                  {templateImportMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Import Template Items
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default ScopeTab;
