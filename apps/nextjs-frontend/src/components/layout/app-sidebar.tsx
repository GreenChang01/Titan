'use client';

import {HomeIcon, ProjectorIcon, SettingsIcon, UserIcon, FolderIcon, BarChart3Icon, FileTextIcon} from 'lucide-react';
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {NavUser} from './nav-user.js';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from '@/components/ui/sidebar';

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
	const t = useTranslations('Component-Sidebar');

	return (
		<Sidebar collapsible="icon" variant="sidebar" {...props}>
			<SidebarHeader>
				<div className="flex items-center gap-2 p-2">
					<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
						<ProjectorIcon className="size-4" />
					</div>
					<div className="flex flex-col gap-0.5 leading-none">
						<span className="font-semibold">Titan</span>
						<span className="text-xs text-muted-foreground">{t('subtitle')}</span>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>{t('main-features')}</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="/dashboard">
										<HomeIcon />
										<span>{t('dashboard')}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>{t('project-management')}</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="/projects/overview">
										<FileTextIcon />
										<span>{t('overview')}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="/projects/management">
										<ProjectorIcon />
										<span>{t('project-management')}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="/projects/materials">
										<FolderIcon />
										<span>{t('materials')}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="/projects/analytics">
										<BarChart3Icon />
										<span>{t('analytics')}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>{t('settings')}</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="/profile">
										<UserIcon />
										<span>{t('profile')}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="/settings">
										<SettingsIcon />
										<span>{t('settings')}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<NavUser />
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
