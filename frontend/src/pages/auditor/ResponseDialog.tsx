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
import { Loader2, AlertTriangle } from 'lucide-react';
import type { ScopeLineItemExtended } from '@/types/scope';


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
    selectedOptionId: '',
    comment: '',
  });

  useEffect(() => {
    if (item?.ownResponse) {
      setFormData({
        responseText: item.ownResponse.responseText || '',
        selectedOptionId: item.ownResponse.selectedOptionId || '',
        comment: item.ownResponse.comment || '',
      });
    } else {
      setFormData({
        responseText: '',
        selectedOptionId: '',
        comment: '',
      });
    }
  }, [item]);

  const handleAction = (isDraft: boolean) => {
    onSubmit({ ...formData, isDraft });
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Audit Response: {item.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-muted/30 p-3 rounded-lg text-sm text-muted-foreground mb-4">
            <p className="font-semibold text-dark mb-1 text-xs uppercase tracking-wider">Item Description</p>
            {item.description}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Once submitted, this response will be locked for review by the manager.</p>
          </div>

          {item.inputMethod === 'free_text' ? (
            <div className="space-y-2">
              <Label htmlFor="responseText">Response Evidence</Label>
              <Textarea 
                id="responseText" 
                value={formData.responseText} 
                onChange={(e) => setFormData({...formData, responseText: e.target.value})}
                placeholder="Describe your findings and evidence..."
                className="min-h-[150px]"
                required
              />
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Min 10 characters for final submission.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Label>Select Finding</Label>
              <div className="grid grid-cols-1 gap-2">
                {item.options?.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({...formData, selectedOptionId: opt.id})}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border text-sm transition-all text-left",
                      formData.selectedOptionId === opt.id 
                        ? "border-primary bg-primary/5 text-primary font-medium shadow-sm" 
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    )}
                  >
                    {opt.optionText}
                    {formData.selectedOptionId === opt.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="comment">Internal Comments (Visible to Manager)</Label>
            <Textarea 
              id="comment" 
              value={formData.comment} 
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
              placeholder="Any additional context or notes..."
              className="resize-none"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button 
            variant="outline" 
            onClick={() => handleAction(true)} 
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Draft'}
          </Button>
          <Button 
            onClick={() => handleAction(false)} 
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Response'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResponseDialog;

import { cn } from '@/lib/utils';
