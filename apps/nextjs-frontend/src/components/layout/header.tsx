'use client';

import React from 'react';
import {Search, Settings, ChevronsUpDown} from 'lucide-react';
import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {TopNav} from './top-nav.js';
import {cn} from '@/lib/utils';
import {Separator} from '@/components/ui/separator';
import {SidebarTrigger} from '@/components/ui/sidebar';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Input} from '@/components/ui/input';
import {useRouter} from '@/i18n/navigation';
import {useUserStore} from '@/store/user/user.store';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook';

type HeaderProps = {
  readonly fixed?: boolean;
  readonly ref?: React.Ref<HTMLElement>;
} & React.HTMLAttributes<HTMLElement>;

export function Header({className, fixed, children, ...props}: HeaderProps) {
  const [offset, setOffset] = React.useState(0);
  const t = useTranslations('Component-Header');
  const router = useRouter();
  const user = useUserStore(state => state.user);
  const {logout} = useAuthApi();

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    };

    document.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      document.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleLogout = async () => {
    await logout({
      onSuccess() {
        router.push('/login');
      },
    });
  };

  const userName = user?.username || 'User';
  const userEmail = user?.email || 'user@example.com';

  // Navigation links for top nav
  const navLinks = [
    {title: '概览', href: '/dashboard', isActive: true},
    {title: '项目', href: '/projects/overview', isActive: false},
    {title: '设置', href: '/settings', isActive: false},
  ];

  return (
    <header
      className={cn(
        'bg-background flex h-16 items-center gap-3 p-4 sm:gap-4',
        fixed && 'header-fixed peer/header fixed z-50 w-[inherit] rounded-md',
        offset > 10 && fixed ? 'shadow-sm' : 'shadow-none',
        className,
      )}
      {...props}
    >
      <SidebarTrigger variant='outline' className='scale-125 sm:scale-100' />
      <Separator orientation='vertical' className='h-6' />

      {/* Page title and navigation */}
      <div className='flex-1 flex items-center gap-4'>
        {children}

        {/* Top Navigation - only show on certain pages */}
        <TopNav links={navLinks} className='ml-6' />
      </div>

      {/* Right side - Search and User */}
      <div className='flex items-center gap-3'>
        {/* Search */}
        <div className='relative hidden sm:block'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input type='search' placeholder='搜索...' className='w-64 pl-8' />
        </div>

        {/* Mobile search button */}
        <Button variant='outline' size='sm' className='sm:hidden h-8 w-8 p-0'>
          <Search className='h-4 w-4' />
          <span className='sr-only'>搜索</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
              <Avatar className='h-8 w-8'>
                <AvatarFallback className='bg-primary text-primary-foreground'>
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent forceMount className='w-56' align='end'>
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-medium leading-none'>{userName}</p>
                <p className='text-xs leading-none text-muted-foreground'>{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href='/profile'>
                <Settings className='mr-2 h-4 w-4' />
                <span>{t('profile-button-label')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href='/settings'>
                <Settings className='mr-2 h-4 w-4' />
                <span>{t('settings')}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <Settings className='mr-2 h-4 w-4' />
              <span>{t('logout-button-label')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

Header.displayName = 'Header';
