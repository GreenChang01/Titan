'use client';

import {BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, User} from 'lucide-react';
import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar} from '@/components/ui/sidebar';
import {useRouter} from '@/i18n/navigation';
import {useUserStore} from '@/store/user/user.store';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook';

export function NavUser() {
	const {isMobile} = useSidebar();
	const t = useTranslations('Component-Header');
	const router = useRouter();
	const user = useUserStore((state) => state.user);
	const {logout} = useAuthApi();

	const handleLogout = async () => {
		await logout({
			onSuccess() {
				router.push('/login');
			},
		});
	};

	const userName = user?.username || 'User';
	const userEmail = user?.email || 'user@example.com';

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
									{userName.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{userName}</span>
								<span className="truncate text-xs">{userEmail}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
						side={isMobile ? 'bottom' : 'right'}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
										{userName.charAt(0).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{userName}</span>
									<span className="truncate text-xs">{userEmail}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link href="/profile">
									<BadgeCheck className="mr-2 h-4 w-4" />
									{t('profile-button-label')}
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/settings">
									<CreditCard className="mr-2 h-4 w-4" />
									{t('settings')}
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/settings">
									<Bell className="mr-2 h-4 w-4" />
									通知设置
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout}>
							<LogOut className="mr-2 h-4 w-4" />
							{t('logout-button-label')}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
