'use client';

import {type JSX} from 'react';
import {
	FolderIcon,
	PlayIcon,
	FileTextIcon,
	PlusIcon,
	FolderOpenIcon,
	ActivityIcon,
	UsersIcon,
	Zap,
	Headphones,
	Loader2,
} from 'lucide-react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Header} from '@/components/layout/header';
import {Main} from '@/components/layout/main';
import {JobList} from '@/features/asmr/components/AsmrJobMonitor';
import {useProjectStats} from '@/hooks/api';

export default function Dashboard(): JSX.Element {
	const {data: stats, isLoading: statsLoading} = useProjectStats();

	return (
		<>
			{/* ===== Top Heading ===== */}
			<Header>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-lg font-medium'>项目看板</h1>
						<p className='text-sm text-muted-foreground'>管理您的素材协作项目和ASMR内容生产</p>
					</div>
					<div className='flex items-center space-x-2'>
						<Link href='/generate'>
							<Button className='flex items-center gap-2'>
								<Zap className='h-4 w-4'/>
								创建ASMR音频
							</Button>
						</Link>
						<Button variant='outline'>
							<PlusIcon className='h-4 w-4 mr-2'/>
							创建项目
						</Button>
					</div>
				</div>
			</Header>

			{/* ===== Main ===== */}
			<Main>
				{/* Stats Cards */}
				<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6'>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>总项目数</CardTitle>
							<FolderIcon className='h-4 w-4 text-muted-foreground'/>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{statsLoading ? <Loader2 className='h-6 w-6 animate-spin'/> : stats?.totalProjects || 0}
							</div>
							<p className='text-xs text-muted-foreground'>
								{stats?.totalProjects === 0 ? '等待您创建第一个项目' : '总计项目数量'}
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>活跃项目</CardTitle>
							<PlayIcon className='h-4 w-4 text-muted-foreground'/>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{statsLoading ? <Loader2 className='h-6 w-6 animate-spin'/> : stats?.activeProjects || 0}
							</div>
							<p className='text-xs text-muted-foreground'>当前进行中的项目</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>总素材数</CardTitle>
							<FileTextIcon className='h-4 w-4 text-muted-foreground'/>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{statsLoading ? <Loader2 className='h-6 w-6 animate-spin'/> : stats?.totalMaterials || 0}
							</div>
							<p className='text-xs text-muted-foreground'>已上传的素材文件</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>团队成员</CardTitle>
							<UsersIcon className='h-4 w-4 text-muted-foreground'/>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>1</div>
							<p className='text-xs text-muted-foreground'>协作团队成员数量</p>
						</CardContent>
					</Card>
				</div>

				{/* Project List and ASMR Jobs */}
				<div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
					<Card className='col-span-1 lg:col-span-4'>
						<CardHeader>
							<CardTitle>最近项目</CardTitle>
							<CardDescription>您最近访问和修改的项目</CardDescription>
						</CardHeader>
						<CardContent>
							{/* TODO: Replace with RecentProjectList component */}
							<div className='flex flex-col items-center justify-center py-12 text-center'>
								<FolderOpenIcon className='h-12 w-12 text-muted-foreground mb-4'/>
								<h3 className='text-lg font-semibold mb-2'>
									{statsLoading ? '加载中...' : (stats?.totalProjects === 0 ? '暂无项目' : '项目列表')}
								</h3>
								<p className='text-muted-foreground mb-6 max-w-sm'>
									{stats?.totalProjects === 0 ? '创建您的第一个项目来开始管理素材和协作' : '项目管理功能正在开发中...'}
								</p>
								<Button>
									<PlusIcon className='h-4 w-4 mr-2'/>
									创建第一个项目
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card className='col-span-1 lg:col-span-3'>
						<CardHeader>
							<CardTitle>快速操作</CardTitle>
							<CardDescription>常用功能快捷入口</CardDescription>
						</CardHeader>
						<CardContent className='space-y-3'>
							<Link href='/generate'>
								<Button variant='outline' className='w-full justify-start'>
									<Zap className='h-4 w-4 mr-2'/>
									创建ASMR音频
								</Button>
							</Link>
							<Button variant='outline' className='w-full justify-start'>
								<PlusIcon className='h-4 w-4 mr-2'/>
								创建新项目
							</Button>
							<Button variant='outline' className='w-full justify-start'>
								<FileTextIcon className='h-4 w-4 mr-2'/>
								上传素材
							</Button>
							<Button variant='outline' className='w-full justify-start'>
								<Headphones className='h-4 w-4 mr-2'/>
								查看ASMR任务
							</Button>
							<Button variant='outline' className='w-full justify-start'>
								<ActivityIcon className='h-4 w-4 mr-2'/>
								查看项目活动
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* ASMR Jobs Section */}
				<div className='mt-6'>
					<JobList/>
				</div>
			</Main>
		</>
	);
}
