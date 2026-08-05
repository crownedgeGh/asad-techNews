import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const badgeVariants = cva('badge', {
  variants: {
    variant: {
      default: 'badge-primary badge-soft',
      outline: 'badge-outline',
      success: 'badge-success badge-soft',
      warning: 'badge-warning badge-soft',
      destructive: 'badge-error badge-soft',
      secondary: 'badge-secondary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
