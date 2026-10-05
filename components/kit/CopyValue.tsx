'use client';

import { useToast } from '@/components/system/ToastProvider';

/** A small "copy" control for a value printed beside it. */
export function CopyValue({ value, className }: { value: string; className?: string }) {
  const { toast } = useToast();
  return (
    <button
      type="button"
      className={className}
      aria-label={`Copy ${value}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast({ kind: 'Copied', message: value, tone: 'revision', group: 'copy' });
        } catch {
          toast({
            kind: 'Copy blocked',
            message: 'The browser refused clipboard access',
            tone: 'issue',
            group: 'copy',
          });
        }
      }}
    >
      Copy
    </button>
  );
}
