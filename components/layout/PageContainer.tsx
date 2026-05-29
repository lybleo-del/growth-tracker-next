import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface PageContainerProps {
  children: ReactNode;
  showNav?: boolean;
}

export function PageContainer({ children, showNav = true }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="max-w-md mx-auto px-4 py-6">
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
