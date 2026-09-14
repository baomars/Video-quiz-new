import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-xs active:bg-amber-600',
        primary:
          'bg-blue-600 text-white hover:bg-blue-500 shadow-xs active:bg-blue-700',
        destructive:
          'bg-rose-500 text-white hover:bg-rose-600 shadow-xs active:bg-rose-700',
        outline:
          'border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-700 shadow-xs',
        secondary:
          'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300',
        ghost:
          'hover:bg-slate-100 hover:text-slate-900 text-slate-600',
        link:
          'text-amber-600 underline-offset-4 hover:underline',
        gradient:
          'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-white hover:opacity-95 shadow-md active:scale-[0.98]'
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-[11px]',
        lg: 'h-10 rounded-xl px-5 text-sm',
        icon: 'h-9 w-9 rounded-xl',
        iconSm: 'h-7 w-7 rounded-lg'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
