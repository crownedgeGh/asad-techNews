import React from 'react';
import { Toaster } from 'sonner';

export default function AdminToaster() {
  return (
    <Toaster
      position="top-right"
      theme="system"
      toastOptions={{
        classNames: {
          toast: 'bg-card! border-border! text-foreground! shadow-lg!',
          title: 'text-foreground!',
          description: 'text-muted-foreground!',
        },
      }}
    />
  );
}
