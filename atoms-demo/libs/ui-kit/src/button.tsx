import * as React from 'react';
import { cn } from './utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
