import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Sparkles, 
  FileSpreadsheet, 
  Plus,
  Loader2,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { scopeService } from '@/services/scopeService';
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

  const { data: scopeItemsByBu, isLoading } = useQuery({
    queryKey: ['scope', audit.id],
    queryFn: () => scopeService.getScope(audit.id),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scope', audit.id] });
      setIsManualDialogOpen(false);
      resetManualForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => scopeService.deleteLineItem(audit.id, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scope', audit.id] });
    }
  });

  const extractMutation = useMutation({
    mutationFn: (file: File) => scopeService.extractFromDocument(audit.id, file, activeBuId),
    onSuccess: (data: { jobId: string }) => {
      setAiJobId(data.jobId);
      setAiJobStatus('queued');
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
    }
  });

  const excelUploadMutation = useMutation({
    mutationFn: (file: File) => scopeService.importFromExcel(audit.id, file, activeBuId),
    onSuccess: (data: ImportSession) => {
      setImportSession(data);
    }
  });

  const confirmExcelMutation = useMutation({
    mutationFn: () => scopeService.confirmExcelImport(audit.id, importSession!.importId, { columnMapping: excelMapping }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scope', audit.id] });
      setIsExcelDialogOpen(false);
      setImportSession(null);
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Scope Management
          <Badge variant="outline" className="font-normal">
            {Object.values(scopeItemsByBu || {}).flat().length} items
          </Badge>
        </h3>
        {isDraft && (
          <div className="flex gap-2">
            {!hasAnyItems && (
              <Button size="sm" variant="outline" onClick={() => setIsManualDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setIsAiDialogOpen(true)} className="gap-2 border-accent/20 text-accent hover:bg-accent/5">
              <Sparkles className="h-4 w-4" /> AI Extract
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsExcelDialogOpen(true)} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" /> Excel Import
            </Button>
          </div>
        )}
      </div>

      {!hasAnyItems && !isManualDialogOpen && !isAiDialogOpen && !isExcelDialogOpen ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-2">
              <Plus className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">No scope items defined</p>
              <p className="text-sm">Start by adding items manually, using AI extraction, or importing from Excel.</p>
            </div>
            <Button onClick={() => setIsManualDialogOpen(true)}>+ Define Scope Manually</Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeBuId} onValueChange={setActiveBuId} className="w-full">
          <TabsList className="bg-muted/50 p-1">
            {audit.businessUnits?.map((bu: any) => (
              <TabsTrigger key={bu.id} value={bu.id} className="text-xs px-4 h-8">
                {bu.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {audit.businessUnits?.map((bu: any) => (
            <TabsContent key={bu.id} value={bu.id} className="mt-4">
              <ScopeItemsTable 
                items={scopeItemsByBu?.[bu.id] || []} 
                onEdit={handleEdit}
                onDelete={(id: string) => confirm('Delete item?') && deleteMutation.mutate(id)}
                isDraft={isDraft}
              />
              {isDraft && (
                <Button variant="ghost" className="mt-4 text-accent h-12 w-full border border-dashed border-accent/20 hover:bg-accent/5" onClick={() => setIsManualDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Item to {bu.name}
                </Button>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Manual Entry Dialog */}
      <Dialog open={isManualDialogOpen} onOpenChange={(open: boolean) => { if(!open) resetManualForm(); setIsManualDialogOpen(open); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Scope Item' : 'Add New Scope Item'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleManualSubmit} className="space-y-4 py-4">
            {/* Form fields same as before, ensuring types are correct */}
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input id="name" value={manualFormData.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualFormData({...manualFormData, name: e.target.value})} placeholder="e.g., Access Management Policy" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={manualFormData.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setManualFormData({...manualFormData, description: e.target.value})} placeholder="Audit objective..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inputMethod">Input Method</Label>
              <Select value={manualFormData.inputMethod} onValueChange={(v: string) => setManualFormData({...manualFormData, inputMethod: v as InputMethod})}>
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
                <Input id="options" value={manualFormData.options} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualFormData({...manualFormData, options: e.target.value})} placeholder="Pass, Fail, N/A" required />
              </div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={upsertMutation.isPending}>
                {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingItem ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Extraction Dialog */}
      <Dialog open={isAiDialogOpen} onOpenChange={(open: boolean) => { if(!open) resetAiFlow(); setIsAiDialogOpen(open); }}>
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
                   <Select value={excelMapping.nameColumn} onValueChange={(v: string) => setExcelMapping({...excelMapping, nameColumn: v})}>
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
                   <Select value={excelMapping.descriptionColumn} onValueChange={(v: string) => setExcelMapping({...excelMapping, descriptionColumn: v})}>
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
                <Button onClick={() => confirmExcelMutation.mutate()} disabled={!excelMapping.nameColumn || confirmExcelMutation.isPending}>
                   {confirmExcelMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Confirm Import
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScopeTab;
