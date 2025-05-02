'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

const settingsSchema = z.object({
  email_notifications: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

type ToastMessage = {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
};

export default function SettingsPage() {
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const supabase = createClient();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      email_notifications: false,
    },
  });

  const showToast = (message: ToastMessage) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000); // Auto-dismiss after 3s
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('email_notifications')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
        console.error('Error fetching settings:', error);
        showToast({
          title: 'Error',
          description: 'Failed to load settings.',
          variant: 'destructive',
        });
      } else if (data) {
        form.reset({ email_notifications: data.email_notifications });
      }
    };

    fetchSettings();
  }, [supabase, form]);

  const onSubmit = async (data: SettingsFormValues) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert(
        { user_id: user.id, email_notifications: data.email_notifications, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Error saving settings:', error);
      showToast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      });
    } else {
      showToast({
        title: 'Success',
        description: 'Settings saved!',
      });
    }
  };

  return (
    <ToastProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Notification Settings</h1>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <FormField
              control={form.control}
              name="email_notifications"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-medium">
                    Receive email notifications for post actions (e.g., generation, drafts, publishing)
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save Settings</Button>
          </form>
        </FormProvider>
      </div>
      <ToastViewport />
      {toastMessage && (
        <Toast
          open={!!toastMessage}
          onOpenChange={() => setToastMessage(null)}
          variant={toastMessage.variant}
        >
          <ToastTitle>{toastMessage.title}</ToastTitle>
          <ToastDescription>{toastMessage.description}</ToastDescription>
          <ToastClose />
        </Toast>
      )}
    </ToastProvider>
  );
}