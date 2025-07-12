'use client';

import {type JSX} from 'react';
import {
	PlusIcon, FolderIcon, PlayIcon, FileTextIcon, UsersIcon, CalendarIcon, TrendingUpIcon,
} from 'lucide-react';
import {Header} from '@/components/layout/header';
import {Main} from '@/components/layout/main';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';

export default function ProjectsOverview(): JSX.Element {
	return (
		<>
			<Header>
				<div>
					<h1 className='text-lg font-medium'>项目概览</h1>
				</div>
			</Header>

			<Main>
				{/* Overview Stats */}
				<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6'>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>总项目数</CardTitle>
							<FolderIcon className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>0</div>
							<p className='text-xs text-muted-foreground'>包含所有状态的项目</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>进行中项目</CardTitle>
							<PlayIcon className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>0</div>
							<p className='text-xs text-muted-foreground'>当前活跃的项目</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>本月完成</CardTitle>
							<CalendarIcon className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>0</div>
							<p className='text-xs text-muted-foreground'>本月已完成项目</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>团队协作</CardTitle>
							<UsersIcon className='h-4 w-4 text-muted-foreground' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>1</div>
							<p className='text-xs text-muted-foreground'>参与的团队成员</p>
						</CardContent>
					</Card>
				</div>

				{/* Project Status Overview */}
				<div className='grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6'>
					<Card>
						<CardHeader>
							<CardTitle>项目状态分布</CardTitle>
							<CardDescription>各状态项目的分布情况</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center space-x-2'>
										<div className='w-3 h-3 bg-green-500 rounded-full' />
										<span className='text-sm'>已完成</span>
									</div>
									<span className='text-sm font-medium'>0</span>
								</div>
								<div className='flex items-center justify-between'>
									<div className='flex items-center space-x-2'>
										<div className='w-3 h-3 bg-blue-500 rounded-full' />
										<span className='text-sm'>进行中</span>
									</div>
									<span className='text-sm font-medium'>0</span>
								</div>
								<div className='flex items-center justify-between'>
									<div className='flex items-center space-x-2'>
										<div className='w-3 h-3 bg-yellow-500 rounded-full' />
										<span className='text-sm'>计划中</span>
									</div>
									<span className='text-sm font-medium'>0</span>
								</div>
								<div className='flex items-center justify-between'>
									<div className='flex items-center space-x-2'>
										<div className='w-3 h-3 bg-gray-500 rounded-full' />
										<span className='text-sm'>已暂停</span>
									</div>
									<span className='text-sm font-medium'>0</span>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>最近活动</CardTitle>
							<CardDescription>项目的最新更新和变化</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='flex flex-col items-center justify-center py-8 text-center'>
								<TrendingUpIcon className='h-8 w-8 text-muted-foreground mb-2' />
								<p className='text-sm text-muted-foreground'>暂无项目活动</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Empty State */}
				<Card>
					<CardHeader>
						<CardTitle>开始您的第一个项目</CardTitle>
						<CardDescription>创建项目来管理您的素材和团队协作</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='flex flex-col items-center justify-center py-12 text-center'>
							<FolderIcon className='h-16 w-16 text-muted-foreground mb-4' />
							<h3 className='text-lg font-semibold mb-2'>还没有项目</h3>
							<p className='text-muted-foreground mb-6 max-w-md'>
								创建您的第一个项目来开始管理素材、协调团队工作，并跟踪项目进度。
							</p>
							<Button size='lg'>
								<PlusIcon className='h-4 w-4 mr-2' />
								创建第一个项目
							</Button>
						</div>
					</CardContent>
				</Card>
			</Main>
		</>
	);
}
