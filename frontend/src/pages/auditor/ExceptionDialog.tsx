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
import { Loader2, ShieldAlert } from 'lucide-react';
import type { ScopeLineItemExtended } from '@/types/scope';

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

  const handleAction = () => {
    onSubmit({ justification });
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

          <div className="space-y-1">
            <Label className="text-xs">Evidence Link (Optional)</Label>
            <div className="p-3 border rounded-lg border-dashed text-xs text-muted-foreground text-center">
              File upload coming soon. Please include links in justification for now.
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
