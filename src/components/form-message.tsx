'use client';

import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export type Message = {
  message?: string;
  error?: string;
  success?: string;
};

export function FormMessage({ message }: { message: Message }) {
  const searchParams = useSearchParams();
  const errorMessage = message?.error || searchParams.get('error');
  const successMessage = message?.success || searchParams.get('message');

  if (!errorMessage && !successMessage) {
    return null;
  }

  return (
    <div
      className={`p-3 rounded-md flex items-center gap-x-2 text-sm ${
        errorMessage ? 'bg-destructive/15 text-destructive' : 'bg-emerald-500/15 text-emerald-500'
      }`}
    >
      {errorMessage ? (
        <AlertCircle className="h-4 w-4" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}
      <p>{errorMessage || successMessage}</p>
    </div>
  );
}