import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronRight,
  Search,
} from 'lucide-react';
import { exceptionalRequestService } from '@/services/exceptionalRequestService';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import ReviewRequestDrawer from './ReviewRequestDrawer';

export default function ExceptionalRequestsList() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['exceptional-requests', activeTab],
    queryFn: () => exceptionalRequestService.getRequests(activeTab),
  });

  const filteredRequests = requests?.filter((req: any) => 
    req.audit?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.requester?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="text-amber-500" size={16} />;
      case 'approved': return <CheckCircle className="text-green-500" size={16} />;
      case 'rejected': return <XCircle className="text-red-500" size={16} />;
      default: return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="text-accent" />
            Exceptional Requests
          </h1>
          <p className="text-white/60">Review and approve audit deletion or reopening requests from managers.</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Tabs & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex p-1 bg-white/5 rounded-lg border border-white/10">
            {(['pending', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all capitalize",
                  activeTab === tab 
                    ? "bg-accent text-white shadow-lg" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <Input
              placeholder="Search audits or managers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : filteredRequests?.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10">
            <p className="text-white/40">No {activeTab} requests found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRequests?.map((req: any) => (
              <Card 
                key={req.id}
                className="bg-white/5 border-white/10 hover:border-accent/50 transition-all cursor-pointer overflow-hidden group"
                onClick={() => setSelectedRequestId(req.id)}
              >
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      req.actionType === 'delete' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                    )}>
                      {req.actionType === 'delete' ? <AlertTriangle size={24} /> : <Clock size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{req.audit?.name}</h3>
                        <Badge variant="outline" className="capitalize bg-white/5 border-white/10 text-white/70">
                          {req.actionType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/50">
                        <span>By: {req.requester?.fullName}</span>
                        <span>•</span>
                        <span>{format(new Date(req.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                      <div className="flex items-center gap-1.5 text-sm font-medium capitalize mb-1">
                        {getStatusIcon(req.status)}
                        <span className={cn(
                          req.status === 'pending' ? "text-amber-500" :
                          req.status === 'approved' ? "text-green-500" : "text-red-500"
                        )}>
                          {req.status}
                        </span>
                      </div>
                      {req.resolvedAt && (
                        <span className="text-[10px] text-white/30 uppercase tracking-wider">
                          Resolved {format(new Date(req.resolvedAt), 'MMM d')}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="text-white/20 group-hover:text-accent transition-colors" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedRequestId && (
        <ReviewRequestDrawer
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
          onSuccess={() => {
            setSelectedRequestId(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
