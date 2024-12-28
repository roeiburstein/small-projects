'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Arbitrage', href: '/arbitrage' },
  { name: 'AI Chat', href: '/chat' },
  { name: 'Interactive Art', href: '/art' },
] as const;

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-8 lg:space-x-12">
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-foreground/80',
            pathname === item.href
              ? 'text-foreground'
              : 'text-foreground/60'
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
