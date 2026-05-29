'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Timer, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { href: '/', icon: Home, label: '首页' },
  { href: '/stats', icon: BarChart3, label: '统计' },
  { href: '/focus', icon: Timer, label: '专注' },
  { href: '/profile', icon: User, label: '我的' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2 z-50">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-6 h-6', isActive && 'scale-110')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
