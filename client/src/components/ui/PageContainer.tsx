import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  /** Vertical spacing between page sections. Defaults to `space-y-6`. */
  className?: string;
}

export const PageContainer = ({ children, className = 'space-y-6' }: PageContainerProps) => {
  return (
    <div className={`w-full ${className}`.trim()}>
      {children}
    </div>
  );
}
