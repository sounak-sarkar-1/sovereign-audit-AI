import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ShieldAlert, Upload, X, FileIcon } from 'lucide-react';
import type { ScopeLineItemExtended } from '@/types/scope';
import { fileService, FileEntityType } from '@/services/fileService';
import type { UploadedFile } from '@/services/fileService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExceptionDialogProps {
  item: ScopeLineItemExtended | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
}

const ExceptionDialog: React.FC<ExceptionDialogProps> = ({ 
  item, 
  open, 
  onOpenChange, 
  onSubmit,
  isPending 
}) => {
  const [justification, setJustification] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newFiles: UploadedFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const uploaded = await fileService.uploadFile(files[i], FileEntityType.EXCEPTION_EVIDENCE);
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

  const handleAction = () => {
    onSubmit({ 
      justification,
      evidenceFileIds: uploadedFiles.map(f => f.id)
    });
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            Raise Exception
          </DialogTitle>
          <DialogDescription>
            Request an exception for <strong>{item.name}</strong> if compliance cannot be met or audited.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Alert variant="destructive" className="bg-destructive/5 text-destructive border-destructive/20">
            <AlertDescription className="text-xs">
              Exceptional requests require detailed justification and will be reviewed by the Audit Manager. 
              The line item will be locked until the request is approved or rejected.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="justification">Justification & Evidence</Label>
            <Textarea 
              id="justification" 
              value={justification} 
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Provide a detailed reason why this item requires an exception..."
              className="min-h-[150px]"
              required
            />
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Min 20 characters.</p>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center justify-between">
              Evidence Attachments
              <span className="text-[10px] text-muted-foreground font-normal uppercase">Required for Exceptions</span>
            </Label>
            
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map(file => (
                <div key={file.id} className="flex items-center gap-2 bg-destructive/5 px-2 py-1 rounded-md border border-destructive/20 text-xs group">
                  <FileIcon size={14} className="text-destructive" />
                  <span className="truncate max-w-[120px] font-medium">{file.originalFilename}</span>
                  <button 
                    onClick={() => removeFile(file.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <label className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md border border-dashed text-xs cursor-pointer hover:bg-destructive/5 hover:border-destructive/30 transition-all",
                isUploading && "opacity-50 pointer-events-none"
              )}>
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                <span>Add Evidence</span>
                <input type="file" className="hidden" multiple onChange={handleFileChange} disabled={isUploading} />
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAction} 
            disabled={isPending || justification.length < 20}
            variant="destructive"
            className="gap-2"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert size={16} />}
            Raise Exception Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExceptionDialog;
