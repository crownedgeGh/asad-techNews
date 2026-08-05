import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

const buttonVariants = cva('btn [&_svg]:pointer-events-none [&_svg]:shrink-0', {
  variants: {
    variant: {
      default: 'btn-primary',
      destructive: 'btn-error',
      outline: 'btn-outline',
      secondary: 'btn-secondary',
      ghost: 'btn-ghost',
      link: 'btn-link',
    },
    size: {
      default: '[&_svg]:size-4',
      sm: 'btn-sm [&_svg]:size-3.5',
      xs: 'btn-xs [&_svg]:size-3',
      lg: 'btn-lg [&_svg]:size-4',
      icon: 'btn-square [&_svg]:size-4',
      'icon-sm': 'btn-square btn-sm [&_svg]:size-3.5',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <Loader2 className="animate-spin" />}
            {children}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
