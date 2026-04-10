import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  ArrowRight,
  Check, 
  Calendar as CalendarIcon, 
  User as UserIcon,
  Info,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { auditService } from '@/services/auditService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const steps = [
  { id: 1, title: 'Engagement Info', icon: Info },
  { id: 2, title: 'Client & BUs', icon: UserIcon },
  { id: 3, title: 'Timeline', icon: CalendarIcon },
];

const NewAuditForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    businessUnitIds: [] as string[],
    startDate: undefined as Date | undefined,
    expectedCompletionDate: undefined as Date | undefined,
  });

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['manager', 'clients'],
    queryFn: () => auditService.getClients(),
  });

  // Handle BU loading when client is selected
  const [availableBUs, setAvailableBUs] = useState<any[]>([]);
  
  const clientBUsQuery = useQuery({
    queryKey: ['client', formData.clientId, 'bus'],
    queryFn: async () => {
      if (!formData.clientId) return [];
      // Assuming there's a way to get BUs for a client
      // I'll call a hypothetical endpoint or use the detail if available
      const response = await api.get(`/admin/clients/${formData.clientId}/business-units`);
      return response.data.data || response.data;
    },
    enabled: !!formData.clientId,
  });

  useEffect(() => {
    if (clientBUsQuery.data) {
      setAvailableBUs(clientBUsQuery.data);
    }
  }, [clientBUsQuery.data]);

  const createMutation = useMutation({
    mutationFn: (data: any) => auditService.createAudit({
      ...data,
      startDate: data.startDate?.toISOString(),
      expectedCompletionDate: data.expectedCompletionDate?.toISOString(),
    }),
    onSuccess: (audit) => {
      toast.success('Audit engagement created as draft');
      navigate(`/manager/audits/${audit.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create audit');
    }
  });

  const nextStep = () => {
    if (currentStep === 1 && !formData.name) {
      toast.error('Engagement name is required');
      return;
    }
    if (currentStep === 2 && (!formData.clientId || formData.businessUnitIds.length === 0)) {
      toast.error('Client and at least one Business Unit must be selected');
      return;
    }
    if (currentStep < 3) setCurrentStep(s => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  const handleSubmit = () => {
    if (!formData.startDate || !formData.expectedCompletionDate) {
      toast.error('Project timeline is required');
      return;
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/manager/audits')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inititate New Audit</h1>
          <p className="text-muted-foreground">Follow the steps below to setup a new audit engagement.</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 -z-10" />
        <div className="flex justify-between">
          {steps.map((step) => {
            const Icon = step.icon as any;
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center bg-background px-4">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    isCompleted ? "bg-accent border-accent text-white" : 
                    isActive ? "border-accent text-accent" : "bg-background border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={cn(
                  "mt-2 text-xs font-medium whitespace-nowrap",
                  isActive ? "text-accent" : "text-muted-foreground"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step {currentStep}: {steps.find(s => s.id === currentStep)?.title}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Provide the basic identification for this engagement."}
            {currentStep === 2 && "Select the target client and specific business units to be audited."}
            {currentStep === 3 && "Define the project start and expected completion dates."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Engagement Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Q1 FY24 Statutory Compliance Audit"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="audit-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description (Optional)</Label>
                <Textarea 
                  id="desc" 
                  placeholder="Context and objectives of the audit..."
                  className="min-h-[120px]"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="audit-description-input"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Select Client</Label>
                <Select 
                  value={formData.clientId} 
                  onValueChange={(val) => setFormData({ ...formData, clientId: val, businessUnitIds: [] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={clientsLoading ? "Loading clients..." : "Select a client"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.clientId && (
                <div className="space-y-3">
                  <Label>Business Units</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/20">
                    {clientBUsQuery.isLoading ? (
                      <div className="col-span-2 text-center text-sm text-muted-foreground py-4">Loading BUs...</div>
                    ) : availableBUs.length > 0 ? (
                      availableBUs.map((bu) => (
                        <div key={bu.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`bu-${bu.id}`} 
                            checked={formData.businessUnitIds.includes(bu.id)}
                            onCheckedChange={(checked: boolean) => {
                              const ids = checked 
                                ? [...formData.businessUnitIds, bu.id]
                                : formData.businessUnitIds.filter(id => id !== bu.id);
                              setFormData({ ...formData, businessUnitIds: ids });
                            }}
                            data-testid="bu-checkbox"
                          />
                          <Label htmlFor={`bu-${bu.id}`} className="text-sm cursor-pointer font-normal">
                            {bu.name}
                          </Label>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center text-sm text-destructive py-4 flex items-center justify-center gap-2">
                        <AlertCircle size={16} /> No business units found for this client.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start" data-testid="start-date-input">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date: Date | undefined) => setFormData({ ...formData, startDate: date })}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Expected Completion Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-10",
                        !formData.expectedCompletionDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expectedCompletionDate ? format(formData.expectedCompletionDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start" data-testid="end-date-input">
                    <Calendar
                      mode="single"
                      selected={formData.expectedCompletionDate}
                      onSelect={(date: Date | undefined) => setFormData({ ...formData, expectedCompletionDate: date })}
                      initialFocus
                      disabled={(date) => formData.startDate ? date <= formData.startDate : date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="col-span-2 bg-secondary/50 p-4 rounded-lg flex gap-3 text-sm text-muted-foreground">
                <Info size={18} className="text-accent shrink-0 mt-0.5" />
                <p>
                  As the engagement manager, you can re-allocate timelines and auditor assignments anytime while the audit is in "Draft" or "In Progress" status. BUs become immutable once the audit is started.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          className={cn(currentStep === 1 && "invisible")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        {currentStep < 3 ? (
          <Button onClick={nextStep}>
            Next Step <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            className="bg-accent hover:bg-accent/90" 
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            data-testid="create-audit-confirm-btn"
          >
            {createMutation.isPending ? "Creating..." : "Confirm & Create Audit"}
            {!createMutation.isPending && <Check className="ml-2 h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
};

export default NewAuditForm;
