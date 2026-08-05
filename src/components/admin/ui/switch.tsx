import * as React from 'react';
import { cn } from '../../../lib/utils';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => (
    <input
      type="checkbox"
      role="switch"
      ref={ref}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={cn('toggle toggle-primary', className)}
      {...props}
    />
  )
);
Switch.displayName = 'Switch';

export { Switch };
