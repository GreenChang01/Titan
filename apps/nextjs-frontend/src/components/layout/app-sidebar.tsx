'use client';

import {
	HomeIcon, ProjectorIcon, Sparkles, Library, Package, FileText, Settings, ChevronRight, Folder, Cloud, FileImage, Mic
} from 'lucide-react';
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
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
	useSidebar,
} from '@/components/ui/sidebar';
import {Collapsible, CollapsibleTrigger, CollapsibleContent} from '@/components/ui/collapsible';
import {AIImageLink} from '@/components/ai-image/ai-image-link';

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
	const t = useTranslations('Component-Sidebar');
	const {state} = useSidebar();

	return (
		<Sidebar collapsible='icon' variant='sidebar' {...props}>
			<SidebarHeader>
				{state === 'collapsed' ? (
					<AIImageLink href='/dashboard' className='flex items-center justify-center p-2'>
						<div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
							<ProjectorIcon className='size-4'/>
						</div>
					</AIImageLink>
				) : (
					<AIImageLink href='/dashboard' className='flex items-center gap-2 p-2'>
						<div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
							<ProjectorIcon className='size-4'/>
						</div>
						<div className='flex flex-col gap-0.5 leading-none'>
							<span className='font-semibold'>Titan</span>
							<span className='text-xs text-muted-foreground'>智能创作平台</span>
						</div>
					</AIImageLink>
				)}
			</SidebarHeader>

			<SidebarContent>
				{/* 工作台 (Dashboard) */}
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<AIImageLink href='/dashboard'>
										<HomeIcon/>
										<span>工作台</span>
									</AIImageLink>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* 开始创作 (AI Generation) */}
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<AIImageLink href='/generate'>
										<Sparkles className="text-purple-500"/>
										<span>开始创作</span>
									</AIImageLink>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* 内容库 (My Creations) */}
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<AIImageLink href='/library'>
										<Library className="text-blue-500"/>
										<span>内容库</span>
									</AIImageLink>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* 素材库 (Assets) */}
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<Collapsible className="group/collapsible">
									<CollapsibleTrigger asChild>
										<SidebarMenuButton>
											<Package className="text-green-500"/>
											<span>素材库</span>
											<ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											<SidebarMenuSubItem>
												<SidebarMenuSubButton asChild>
													<AIImageLink href='/assets/upload'>
														<FileImage className="w-3 h-3"/>
														<span>本地上传</span>
													</AIImageLink>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem>
												<SidebarMenuSubButton asChild>
													<AIImageLink href='/assets/aliyun-drive/browser'>
														<Folder className="w-3 h-3"/>
														<span>阿里云盘</span>
													</AIImageLink>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem>
												<SidebarMenuSubButton asChild>
													<AIImageLink href='/assets/aliyun-drive/settings'>
														<Cloud className="w-3 h-3"/>
														<span>WebDAV设置</span>
													</AIImageLink>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										</SidebarMenuSub>
									</CollapsibleContent>
								</Collapsible>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* 提示词库 (Prompts) */}
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<AIImageLink href='/prompts'>
										<FileText className="text-orange-500"/>
										<span>提示词库</span>
									</AIImageLink>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* 设置 (Settings) */}
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<AIImageLink href='/settings'>
										<Settings className="text-gray-500"/>
										<span>设置</span>
									</AIImageLink>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarRail/>
		</Sidebar>
	);
}
