import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Send, 
  MessageSquare,
  X,
  User as UserIcon
} from 'lucide-react';
import { auditorService } from '@/services/auditorService';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface LineItemCommentDialogProps {
  auditId: string;
  item: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LineItemCommentDialog: React.FC<LineItemCommentDialogProps> = ({ 
  auditId, 
  item, 
  open, 
  onOpenChange 
}) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: comments, isLoading } = useQuery({
    queryKey: ['line-item-comments', item?.id],
    queryFn: () => auditorService.getLineItemComments(auditId, item!.id),
    enabled: !!item && open,
    refetchInterval: 5000,
  });

  const mutation = useMutation({
    mutationFn: (text: string) => auditorService.addLineItemComment(auditId, item!.id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['line-item-comments', item?.id] });
      setContent('');
    },
    onError: (error: any) => {
      toast.error('Failed to post comment');
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  const handleSend = () => {
    if (!content.trim() || mutation.isPending) return;
    mutation.mutate(content);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 overflow-hidden border-none shadow-elevated">
        <DialogHeader className="p-6 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MessageSquare size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-dark">Item Discussion</DialogTitle>
              <p className="text-xs text-muted-foreground truncate max-w-[300px]">{item?.name}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-[#faf9f8]">
          <ScrollArea className="h-full p-6">
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : comments?.length === 0 ? (
                <div className="text-center p-12 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground mx-auto">
                    <MessageSquare size={24} />
                  </div>
                  <p className="text-sm text-muted-foreground">No comments yet. Start the discussion!</p>
                </div>
              ) : (
                comments?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 border shadow-sm">
                      <AvatarFallback className="bg-muted text-[10px]">
                        {comment.author?.fullName?.substring(0, 1) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-bold text-dark">{comment.author?.fullName || 'User'}</span>
                        <span className="text-[10px] text-muted-foreground">{format(new Date(comment.createdAt), 'MMM dd, h:mm a')}</span>
                      </div>
                      <div className="bg-white p-3 rounded-2xl rounded-tl-none border shadow-sm text-sm text-dark">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="p-4 bg-white border-t sm:justify-start">
          <div className="flex w-full gap-2 relative">
            <Input 
              placeholder="Type your comment..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-11 rounded-full pr-12 border-bg-mid bg-muted/10 text-sm focus:ring-primary/20"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button 
                size="icon" 
                onClick={handleSend}
                disabled={!content.trim() || mutation.isPending}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-primary hover:bg-primary/90"
            >
              <Send size={16} />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LineItemCommentDialog;
