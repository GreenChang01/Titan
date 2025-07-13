'use client';

import {HomeIcon, ProjectorIcon, Zap} from 'lucide-react';
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	useSidebar,
} from '@/components/ui/sidebar';

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
	const t = useTranslations('Component-Sidebar');
	const {state} = useSidebar();

	return (
		<Sidebar collapsible="icon" variant="sidebar" {...props}>
			<SidebarHeader>
				{state === 'collapsed' ? (
					<div className="flex items-center justify-center p-2">
						<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<ProjectorIcon className="size-4" />
						</div>
					</div>
				) : (
					<div className="flex items-center gap-2 p-2">
						<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<ProjectorIcon className="size-4" />
						</div>
						<div className="flex flex-col gap-0.5 leading-none">
							<span className="font-semibold">Titan</span>
							<span className="text-xs text-muted-foreground">ASMR创作平台</span>
						</div>
					</div>
				)}
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>核心功能</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="/dashboard">
										<HomeIcon />
										<span>工作台</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<Link href="/generate">
										<Zap />
										<span>ASMR生成</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarRail />
		</Sidebar>
	);
}
