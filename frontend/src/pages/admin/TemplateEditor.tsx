import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Save, Plus, ArrowLeft, GripVertical, Trash2 } from 'lucide-react';
import { templateService } from '@/services/templateService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UnsavedChangesGuard } from '@/components/UnsavedChangesGuard';
import type { AuditTemplateLineItem, InputMethod } from '@/types/template';
import { toast } from 'sonner';

interface SortableLineItemProps {
  item: AuditTemplateLineItem;
  index: number;
  onUpdate: (index: number, updates: Partial<AuditTemplateLineItem>) => void;
  onRemove: (index: number) => void;
}

const SortableLineItem = ({ item, index, onUpdate, onRemove }: SortableLineItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id || `temp-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start space-x-4 p-4 border rounded-lg bg-card shadow-sm mb-4">
      <div {...attributes} {...listeners} className="mt-2 cursor-grab active:cursor-grabbing text-muted-foreground">
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input 
              value={item.name} 
              onChange={(e) => onUpdate(index, { name: e.target.value })}
              placeholder="e.g., Firewall Configuration"
            />
          </div>
          <div className="space-y-2">
            <Label>Input Method</Label>
            <Select 
              value={item.inputMethod} 
              onValueChange={(val) => onUpdate(index, { inputMethod: val as InputMethod, options: val === 'multiple_choice' ? [] : undefined })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free_text">Free Text</SelectItem>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input 
            value={item.description} 
            onChange={(e) => onUpdate(index, { description: e.target.value })}
            placeholder="Description of the audit check..."
          />
        </div>

        {item.inputMethod === 'multiple_choice' && (
          <div className="space-y-2 pl-4 border-l-2 border-muted">
            <Label className="text-xs uppercase text-muted-foreground">Options</Label>
            {(item.options || []).map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center space-x-2">
                <Input 
                  value={opt.optionText} 
                  onChange={(e) => {
                    const newOpts = [...(item.options || [])];
                    newOpts[optIdx] = { ...newOpts[optIdx], optionText: e.target.value };
                    onUpdate(index, { options: newOpts });
                  }}
                  className="h-8 text-sm"
                  placeholder={`Option ${optIdx + 1}`}
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive"
                  onClick={() => {
                    const newOpts = (item.options || []).filter((_, i) => i !== optIdx);
                    onUpdate(index, { options: newOpts });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const newOpts = [...(item.options || []), { optionText: '', displayOrder: (item.options?.length || 0) + 1 }];
                onUpdate(index, { options: newOpts });
              }}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Option
            </Button>
          </div>
        )}
      </div>
      <Button variant="ghost" size="icon" className="text-destructive mt-1" onClick={() => onRemove(index)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

const TemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lineItems, setLineItems] = useState<AuditTemplateLineItem[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: existingTemplate, isLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: () => templateService.getTemplate(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingTemplate) {
      setName(existingTemplate.name);
      setDescription(existingTemplate.description || '');
      setLineItems(existingTemplate.lineItems || []);
      setIsDirty(false);
    }
  }, [existingTemplate]);

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? templateService.updateTemplate(id!, data) : templateService.createTemplate(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Template updated' : 'Template created');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setIsDirty(false);
      navigate('/admin/templates');
    },
    onError: () => {
      toast.error('Failed to save template');
    }
  });

  const handleUpdateLineItem = (index: number, updates: Partial<AuditTemplateLineItem>) => {
    const newList = [...lineItems];
    newList[index] = { ...newList[index], ...updates };
    setLineItems(newList);
    setIsDirty(true);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, {
      name: '',
      description: '',
      inputMethod: 'free_text',
      isOptional: false,
      displayOrder: lineItems.length + 1,
    }]);
    setIsDirty(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLineItems((items) => {
        const oldIndex = items.findIndex((i) => (i.id || `temp-${items.indexOf(i)}`) === active.id);
        const newIndex = items.findIndex((i) => (i.id || `temp-${items.indexOf(i)}`) === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
      });
      setIsDirty(true);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (lineItems.length === 0) {
      toast.error('At least one line item is required');
      return;
    }

    const payload = {
      name,
      description,
      lineItems: lineItems.map((item, idx) => ({
        ...item,
        displayOrder: idx + 1,
        options: item.inputMethod === 'multiple_choice' ? (item.options || []) : undefined
      }))
    };

    mutation.mutate(payload);
  };

  if (isLoading) return <div className="p-8 text-center">Loading template...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <UnsavedChangesGuard isDirty={isDirty} />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/templates')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Template' : 'Create New Template'}</h1>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => navigate('/admin/templates')}>Cancel</Button>
          <Button onClick={handleSave} disabled={mutation.isPending}>
            <Save className="mr-2 h-4 w-4" /> {mutation.isPending ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tpl-name">Template Name</Label>
            <Input 
              id="tpl-name"
              value={name} 
              onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
              placeholder="e.g., standard security audit"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tpl-desc">Description</Label>
            <Input 
              id="tpl-desc"
              value={description} 
              onChange={(e) => { setDescription(e.target.value); setIsDirty(true); }}
              placeholder="Brief overview of this template..."
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Line Items ({lineItems.length})</h3>
          <Button variant="secondary" size="sm" onClick={handleAddLineItem}>
            <Plus className="mr-1 h-4 w-4" /> Add Item
          </Button>
        </div>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext 
            items={lineItems.map((item, idx) => item.id || `temp-${idx}`)}
            strategy={verticalListSortingStrategy}
          >
            {lineItems.map((item, index) => (
              <SortableLineItem 
                key={item.id || `temp-${index}`}
                item={item}
                index={index}
                onUpdate={handleUpdateLineItem}
                onRemove={handleRemoveLineItem}
              />
            ))}
          </SortableContext>
        </DndContext>

        {lineItems.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
            No items added yet. Click "Add Item" to start building your template.
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateEditor;
