import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import api from '../../lib/api';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../components/ui/form';
import { Progress } from '../../components/ui/progress';
import { AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[@$!%*?&]/, 'Must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const updateUser = useAuthStore((state) => state.updateUser);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = form.watch('newPassword');

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[@$!%*?&]/.test(pass)) score += 25;
    return score;
  };

  const strength = calculateStrength(newPassword);

  async function onSubmit(values: PasswordFormValues) {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      updateUser({ isFirstLogin: false });
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f0ee] p-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-[#a06dff] rounded-xl">
              <KeyRound className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#2b144d]">Reset Password</CardTitle>
          <CardDescription>
            You are logging in for the first time. Please set a new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Temporary Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" {...field} />
                    </FormControl>
                    <div className="mt-2 space-y-2">
                      <Progress value={strength} className="h-1" />
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          {newPassword.length >= 8 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <div className="h-3 w-3 border rounded-full" />}
                          8+ characters
                        </div>
                        <div className="flex items-center gap-1">
                          {/[A-Z]/.test(newPassword) ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <div className="h-3 w-3 border rounded-full" />}
                          Uppercase letter
                        </div>
                        <div className="flex items-center gap-1">
                          {/[0-9]/.test(newPassword) ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <div className="h-3 w-3 border rounded-full" />}
                          Number
                        </div>
                        <div className="flex items-center gap-1">
                          {/[@$!%*?&]/.test(newPassword) ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <div className="h-3 w-3 border rounded-full" />}
                          Special character
                        </div>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-[#4f2d7f] hover:bg-[#2b144d] text-white py-6 text-lg mt-4"
                disabled={isLoading || strength < 100}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
