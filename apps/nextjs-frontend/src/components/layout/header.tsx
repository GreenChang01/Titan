'use client';

import React from 'react';
import {usePathname} from 'next/navigation';
import {Settings, ChevronsUpDown} from 'lucide-react';
import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {cn} from '@/lib/utils';
import {Separator} from '@/components/ui/separator';
import {SidebarTrigger, useSidebar} from '@/components/ui/sidebar';
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

	// 条件性地使用 sidebar，只在有提供者时使用
	const [hasSidebar, setHasSidebar] = React.useState(false);

	React.useEffect(() => {
		// 检查是否在 sidebar 上下文中
		try {
			// 这里我们只检查是否可以访问，不实际调用 hook
			const element = document.querySelector('[data-sidebar]');
			setHasSidebar(Boolean(element));
		} catch {
			setHasSidebar(false);
		}
	}, []);

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
	const pathname = usePathname();

	return (
		<header
			className={cn(
				'bg-background flex h-16 items-center gap-3 p-4 sm:gap-4 sticky top-0 z-50 border-b',
				fixed && 'header-fixed peer/header fixed z-50 w-[inherit] rounded-md',
				offset > 10 && fixed ? 'shadow-sm' : 'shadow-none',
				className,
			)}
			{...props}
		>
			{hasSidebar ? (
				<>
					<SidebarTrigger variant='outline' className='scale-125 sm:scale-100'/>
					<Separator orientation='vertical' className='h-6'/>
				</>
			) : null}

			{/* Page title and navigation */}
			<div className='flex-1 flex items-center gap-4'>
				{children}
			</div>

			{/* Right side - User Menu */}
			<div className='flex items-center gap-3'>
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
						<DropdownMenuSeparator/>
						<DropdownMenuItem asChild>
							<Link href='/profile'>
								<Settings className='mr-2 h-4 w-4'/>
								<span>{t('profile-button-label')}</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href='/settings'>
								<Settings className='mr-2 h-4 w-4'/>
								<span>{t('settings')}</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator/>
						<DropdownMenuItem onClick={handleLogout}>
							<Settings className='mr-2 h-4 w-4'/>
							<span>{t('logout-button-label')}</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}

Header.displayName = 'Header';
