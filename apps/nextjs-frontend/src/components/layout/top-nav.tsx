'use client';

import Link from 'next/link';
import {Menu} from 'lucide-react';
import {cn} from '@/lib/utils';
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';

type TopNavProps = {
  readonly links: Array<{
    title: string;
    href: string;
    isActive: boolean;
    disabled?: boolean;
  }>;
} & React.HTMLAttributes<HTMLElement>

export function TopNav({className, links, ...props}: TopNavProps) {
  return (
    <>
      <div className="md:hidden">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline">
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start">
            {links.map(({title, href, isActive, disabled}) => (
              <DropdownMenuItem key={`${title}-${href}`} asChild>
                <Link href={href} className={isActive ? '' : 'text-muted-foreground'}>
                  {title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className={cn('hidden items-center space-x-4 md:flex lg:space-x-6', className)} {...props}>
        {links.map(({title, href, isActive, disabled}) => (
          <Link
            key={`${title}-${href}`}
            href={href}
            className={`hover:text-primary text-sm font-medium transition-colors ${isActive ? '' : 'text-muted-foreground'}`}
          >
            {title}
          </Link>
        ))}
      </nav>
    </>
  );
}
