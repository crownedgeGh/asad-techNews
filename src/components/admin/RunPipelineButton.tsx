import React, { useState } from 'react';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export default function RunPipelineButton() {
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pipeline/run', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to start pipeline');
      toast.success('AI pipeline started - the new draft will appear here shortly');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start pipeline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" onClick={handleRun} loading={loading}>
      <Sparkles /> Run AI Pipeline
    </Button>
  );
}
