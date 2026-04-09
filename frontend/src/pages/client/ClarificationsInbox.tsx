import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '@/services/clientService';
import { 
  MessageSquare, 
  Search, 
  Clock, 
  Send,
  User,
  Upload,
  X,
  FileIcon,
  Loader2
} from 'lucide-react';
import { fileService, FileEntityType } from '@/services/fileService';
import type { UploadedFile } from '@/services/fileService';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ClarificationsInbox: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: threads, isLoading } = useQuery({
    queryKey: ['client-clarifications'],
    queryFn: () => clientService.getClarifications(),
  });

  const { data: activeThread } = useQuery({
    queryKey: ['client-clarification-detail', selectedId],
    queryFn: () => clientService.getClarificationDetail(selectedId!),
    enabled: !!selectedId,
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, message, attachmentFileIds }: { id: string, message: string, attachmentFileIds?: string[] }) => 
      clientService.respondToClarification(id, message, attachmentFileIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-clarification-detail', selectedId] });
      queryClient.invalidateQueries({ queryKey: ['client-clarifications'] });
      setReply('');
      setUploadedFiles([]);
      toast.success('Response sent successfully');
    },
    onError: () => {
      toast.error('Failed to send response');
    }
  });

  const handleSend = () => {
    if (!reply.trim() || !selectedId) return;
    respondMutation.mutate({ 
      id: selectedId, 
      message: reply,
      attachmentFileIds: uploadedFiles.map(f => f.id)
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newFiles: UploadedFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const uploaded = await fileService.uploadFile(files[i], FileEntityType.CLARIFICATION_ATTACHMENT);
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

  if (isLoading) {
    return <div className="p-8">Loading Clarifications...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-120px)] border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Sidebar List */}
      <div className="w-80 border-r flex flex-col bg-slate-50/50">
        <div className="p-4 border-b bg-white">
          <h2 className="font-semibold flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Clarification Inbox
          </h2>
          <div className="mt-2 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input 
              placeholder="Search threads..." 
              className="pl-8 h-8 text-xs bg-slate-50 border-none" 
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="divide-y">
            {(threads as any[])?.map((t) => (
              <div 
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`p-4 cursor-pointer hover:bg-slate-100 transition-colors ${selectedId === t.id ? 'bg-white border-l-4 border-l-[#4f2d7f] shadow-sm' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    {t.audit?.name}
                  </span>
                  <Badge variant={t.status === 'pending' ? 'default' : 'secondary'} className="text-[9px] px-1.5 py-0 h-4">
                    {t.status}
                  </Badge>
                </div>
                <h3 className="text-sm font-medium line-clamp-1">{t.subject}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{t.message}</p>
                <div className="flex items-center mt-2 text-[10px] text-slate-400">
                  <Clock className="mr-1 h-3 w-3" />
                  {format(new Date(t.createdAt), 'dd MMM, HH:mm')}
                </div>
              </div>
            ))}
            {(!threads || (threads as any[]).length === 0) && (
              <div className="p-8 text-center text-slate-400 text-sm italic">
                No clarification requests yet.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Detail View */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedId ? (
          <>
            <div className="p-6 border-b flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{activeThread?.subject}</h2>
                <div className="flex items-center gap-3 mt-1">
                   <div className="flex items-center text-xs text-slate-500">
                    <User className="mr-1 h-3 w-3" />
                    Manager: {activeThread?.manager?.fullName}
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Project: {activeThread?.audit?.name}
                  </Badge>
                </div>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl mx-auto space-y-8">
                {/* Original Request */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{activeThread?.manager?.fullName}</span>
                      <span className="text-[10px] text-slate-400">{format(new Date(activeThread?.createdAt || 0), 'PPP p')}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {activeThread?.message}
                    </div>
                  </div>
                </div>

                {/* Responses */}
                {activeThread?.responses?.map((r: any) => (
                  <div key={r.id} className={`flex gap-4 ${r.responder?.role === 'client' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      r.responder?.role === 'client' ? 'bg-[#4f2d7f] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <User className="h-5 w-5" />
                    </div>
                    <div className={`space-y-2 flex-1 ${r.responder?.role === 'client' ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 ${r.responder?.role === 'client' ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm font-semibold">{r.responder?.fullName}</span>
                        <span className="text-[10px] text-slate-400">{format(new Date(r.createdAt), 'PPP p')}</span>
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        r.responder?.role === 'client' 
                          ? 'bg-[#4f2d7f] text-white' 
                          : 'bg-slate-50 border text-slate-800'
                      }`}>
                        {r.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Reply Area */}
            <div className="p-6 border-t bg-slate-50/30">
              <div className="max-w-3xl mx-auto relative">
                <textarea 
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full p-4 pr-14 border rounded-2xl min-h-[100px] text-sm focus:ring-[#4f2d7f] focus:border-[#4f2d7f] shadow-inner bg-white"
                />
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="flex items-center gap-2 bg-white px-2 py-1 rounded-md border text-[10px] group shadow-sm">
                      <FileIcon size={12} className="text-[#4f2d7f]" />
                      <span className="truncate max-w-[100px]">{file.originalFilename}</span>
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  
                  <label className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-dashed text-[10px] cursor-pointer hover:bg-white hover:border-[#4f2d7f] transition-all",
                    isUploading && "opacity-50 pointer-events-none text-slate-400"
                  )}>
                    {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    <span>Attach Evidence</span>
                    <input type="file" className="hidden" multiple onChange={handleFileChange} disabled={isUploading} />
                  </label>
                </div>

                <Button 
                  onClick={handleSend}
                  disabled={!reply.trim() || respondMutation.isPending}
                  className="absolute bottom-4 right-4 h-10 w-10 p-0 rounded-full bg-[#4f2d7f] hover:bg-[#3d2263]"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-lg font-medium text-slate-600">Select a clarification request</h3>
            <p className="max-w-xs mt-2 text-sm">
              Click on a thread from the left pane to view the conversation and provide responses to audit findings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClarificationsInbox;
