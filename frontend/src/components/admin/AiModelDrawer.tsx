import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AiModel } from '@/types/ai-model';
import api from '@/lib/api';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const aiModelSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  modelType: z.enum(['openai', 'anthropic', 'google', 'slm', 'open_source', 'other']),
  endpointUrl: z.string().url('Invalid endpoint URL'),
  apiKey: z.string().optional(),
});

type AiModelFormValues = z.infer<typeof aiModelSchema>;

interface AiModelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  model?: AiModel;
}

export const AiModelDrawer: React.FC<AiModelDrawerProps> = ({ isOpen, onClose, model }) => {
  const queryClient = useQueryClient();
  const isEditing = !!model;

  const form = useForm<AiModelFormValues>({
    resolver: zodResolver(aiModelSchema),
    defaultValues: {
      name: '',
      modelType: 'openai',
      endpointUrl: '',
      apiKey: '',
    },
  });

  useEffect(() => {
    if (model) {
      form.reset({
        name: model.name,
        modelType: model.modelType,
        endpointUrl: model.endpointUrl,
        apiKey: '', // Don't show existing API key
      });
    } else {
      form.reset({
        name: '',
        modelType: 'openai',
        endpointUrl: '',
        apiKey: '',
      });
    }
  }, [model, form]);

  const mutation = useMutation({
    mutationFn: async (values: AiModelFormValues) => {
      if (isEditing) {
        // Only send apiKey if it's not empty
        const { apiKey, ...rest } = values;
        const payload = apiKey ? values : rest;
        await api.put(`/admin/ai-models/${model.id}`, payload);
      } else {
        await api.post('/admin/ai-models', values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-models'] });
      toast.success(isEditing ? 'AI Model updated' : 'AI Model created');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  const onSubmit = (values: AiModelFormValues) => {
    if (!isEditing && !values.apiKey) {
      toast.error('API Key is required for new models');
      return;
    }
    mutation.mutate(values);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-w-md mx-auto">
        <DrawerHeader>
          <DrawerTitle>{isEditing ? 'Edit AI Model' : 'Add AI Model'}</DrawerTitle>
          <DrawerDescription>
            Configure the connection details for the AI analysis engine.
          </DrawerDescription>
        </DrawerHeader>

        <div className="p-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Production GPT-4o" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="modelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="google">Google Gemini</SelectItem>
                        <SelectItem value="slm">Small Language Model (SLM)</SelectItem>
                        <SelectItem value="open_source">Open Source (Self-hosted)</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endpointUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endpoint URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://api.openai.com/v1/chat/completions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key {isEditing && '(leave blank to keep current)'}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex flex-col gap-2">
                <Button 
                  type="submit" 
                  className="w-full bg-[#4f2d7f] hover:bg-[#2b144d]"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? 'Saving...' : isEditing ? 'Update Configuration' : 'Save Connection'}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full">Cancel</Button>
                </DrawerClose>
              </div>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
