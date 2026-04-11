import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Loader2, AlertTriangle, Upload, X, FileIcon, MessageSquare } from 'lucide-react';
import type { ScopeLineItemExtended } from '@/types/scope';
import { fileService, FileEntityType } from '@/services/fileService';
import type { UploadedFile } from '@/services/fileService';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ResponseDialogProps {
  item: ScopeLineItemExtended | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
}

const ResponseDialog: React.FC<ResponseDialogProps> = ({ 
  item, 
  open, 
  onOpenChange, 
  onSubmit,
  isPending 
}) => {
  const [formData, setFormData] = useState({
    responseText: '',
    selectedOptionId: null as string | null,
    comment: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);
  const [tempAnnotation, setTempAnnotation] = useState('');

  useEffect(() => {
    if (item?.ownResponse) {
      setFormData({
        responseText: item.ownResponse.responseText || '',
        selectedOptionId: item.ownResponse.selectedOptionId || '',
        comment: item.ownResponse.comment || '',
      });
      setUploadedFiles((item as any).evidenceFiles || []);
    } else {
      setFormData({
        responseText: '',
        selectedOptionId: null,
        comment: '',
      });
      setUploadedFiles([]);
    }
  }, [item]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newFiles: UploadedFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const uploaded = await fileService.uploadFile(files[i], FileEntityType.LINE_ITEM_EVIDENCE);
        newFiles.push(uploaded);
      }
      setUploadedFiles([...uploadedFiles, ...newFiles]);
      toast.success(`Uploaded ${files.length} file(s)`);
    } catch (error) {
      toast.error('Failed to upload some files');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.id !== id));
  };

  const handleSaveAnnotation = async (fileId: string) => {
    try {
      const updated = await fileService.updateAnnotations(fileId, { note: tempAnnotation });
      setUploadedFiles(uploadedFiles.map(f => f.id === fileId ? { ...f, annotations: updated.annotations } : f));
      setEditingAnnotationId(null);
      toast.success('Annotation saved');
    } catch (error) {
      toast.error('Failed to save annotation');
    }
  };

  const handleAction = (isDraft: boolean) => {
    onSubmit({ 
      ...formData, 
      isDraft,
      evidenceFileIds: uploadedFiles.map(f => f.id)
    });
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <FileIcon size={18} />
             </div>
             Audit Response: {item.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-muted/30 p-4 rounded-xl text-sm text-dark/70 border border-muted/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-5">
                <FileIcon size={40} />
             </div>
             <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-2">Requirement Context</p>
                <Button variant="ghost" className="h-4 p-0 text-[10px] font-black text-primary hover:bg-transparent uppercase tracking-widest gap-1">
                   <FileText size={10} /> View SOP
                </Button>
             </div>
             <p className="font-medium leading-relaxed">{item.description}</p>
          </div>

          <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 text-xs text-orange-800 flex gap-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-orange-500" />
            <p className="font-medium">Submitting this response triggers the manager review workflow. Please ensure all evidence is annotated correctly.</p>
          </div>

          {item.inputMethod === 'free_text' ? (
            <div className="space-y-2">
              <Label htmlFor="responseText" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Response Narrative</Label>
              <Textarea 
                id="responseText" 
                value={formData.responseText} 
                onChange={(e) => setFormData({...formData, responseText: e.target.value})}
                placeholder="Describe your findings and the specific evidence providing assurance..."
                className="min-h-[120px] rounded-xl border-muted/30 focus:border-primary transition-all shadow-sm"
                required
                data-testid="response-text-input"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assurance Finding</Label>
              <div className="grid grid-cols-1 gap-2">
                {item.options?.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({...formData, selectedOptionId: opt.id})}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border text-sm transition-all text-left group",
                      formData.selectedOptionId === opt.id 
                        ? "border-primary bg-primary/5 text-primary font-bold shadow-sm" 
                        : "border-muted/30 hover:border-primary/50 hover:bg-muted/20"
                    )}
                    data-testid="response-option"
                  >
                    {opt.optionText}
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center",
                      formData.selectedOptionId === opt.id ? "border-primary bg-primary" : "border-muted group-hover:border-primary/50"
                    )}>
                       {formData.selectedOptionId === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Manager Context (Optional)</Label>
            <Textarea 
              id="comment" 
              value={formData.comment} 
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
              placeholder="Internal notes for the manager review team..."
              className="resize-none rounded-xl border-muted/30 shadow-sm"
              rows={2}
              data-testid="manager-comment-input"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
               <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Evidence Artifacts</Label>
               <label className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-primary transition-all hover:text-white",
                  isUploading && "opacity-50 pointer-events-none"
                )}>
                  {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                  <span>Upload Artifact</span>
                  <input type="file" className="hidden" multiple onChange={handleFileChange} disabled={isUploading} />
                </label>
            </div>
            
            <div className="space-y-3">
              {uploadedFiles.map(file => (
                <div key={file.id} className="flex flex-col gap-2 p-3 bg-muted/20 rounded-xl border border-muted/10 group animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary border">
                         <FileIcon size={16} />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-xs font-bold text-dark truncate max-w-[200px]">{file.originalFilename}</span>
                         <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">
                            {(file.fileSizeBytes / 1024).toFixed(1)} KB • {file.mimeType.split('/')[1]}
                         </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                       <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary"
                          onClick={() => {
                             setEditingAnnotationId(file.id);
                             setTempAnnotation(file.annotations?.note || '');
                          }}
                       >
                          <MessageSquare size={14} />
                       </Button>
                       <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-full text-muted-foreground hover:text-red-600"
                          onClick={() => removeFile(file.id)}
                       >
                          <X size={14} />
                       </Button>
                    </div>
                  </div>
                  
                  {editingAnnotationId === file.id ? (
                     <div className="flex gap-2 p-1 bg-white rounded-lg border shadow-sm">
                        <Input 
                           className="h-8 text-xs font-medium border-none shadow-none focus-visible:ring-0 bg-transparent" 
                           placeholder="Add contextual annotation..."
                           autoFocus
                           value={tempAnnotation}
                           onChange={(e) => setTempAnnotation(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleSaveAnnotation(file.id)}
                        />
                        <Button 
                           size="sm" 
                           className="h-8 rounded-md px-3 bg-primary text-[10px] font-bold"
                           onClick={() => handleSaveAnnotation(file.id)}
                        >
                           SAVE
                        </Button>
                     </div>
                  ) : file.annotations?.note && (
                     <div className="flex items-start gap-2 bg-primary/5 p-2 rounded-lg border border-primary/10 ml-1">
                        <MessageSquare size={10} className="mt-1 text-primary shrink-0" />
                        <p className="text-[10px] font-bold text-primary italic leading-tight">{file.annotations.note}</p>
                     </div>
                  )}
                </div>
              ))}
              
              {uploadedFiles.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed rounded-xl bg-muted/5 border-muted/20">
                   <p className="text-xs font-bold text-muted-foreground flex items-center justify-center gap-2">
                      <Upload size={14} /> No evidence artifacts uploaded yet.
                   </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:px-0">
          <Button 
            variant="outline" 
            onClick={() => handleAction(true)} 
            disabled={isPending}
            className="flex-1 rounded-full border-muted-foreground/30 font-bold uppercase tracking-widest text-[10px] h-10"
            data-testid="save-draft-btn"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Draft Evidence'}
          </Button>
          <Button 
            onClick={() => handleAction(false)} 
            disabled={isPending}
            className="flex-1 rounded-full bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px] h-10 shadow-elevated"
            data-testid="submit-for-review-btn"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit for Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResponseDialog;
