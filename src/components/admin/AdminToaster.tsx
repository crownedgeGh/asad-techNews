import React from 'react';
import { Toaster } from 'sonner';

export default function AdminToaster() {
  return (
    <Toaster
      position="top-right"
      theme="system"
      toastOptions={{
        classNames: {
          toast: 'bg-base-100! border-base-300! text-base-content! shadow-lg!',
          title: 'text-base-content!',
          description: 'text-base-content/60!',
        },
      }}
    />
  );
}
