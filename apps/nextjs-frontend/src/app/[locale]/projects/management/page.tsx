'use client';

import {type JSX} from 'react';
import {
	PlusIcon, FolderIcon, SearchIcon, FilterIcon, GridIcon, ListIcon, MoreHorizontalIcon,
} from 'lucide-react';
import {Header} from '@/components/layout/header';
import {Main} from '@/components/layout/main';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';

export default function ProjectsManagement(): JSX.Element {
	return (
		<>
			<Header>
				<div>
					<h1 className='text-lg font-medium'>项目管理</h1>
				</div>
			</Header>

			<Main>
				{/* Search and View Controls */}
				<div className='flex items-center justify-between mb-6'>
					<div className='flex items-center space-x-2'>
						<div className='relative'>
							<SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground'/>
							<input
								type='text'
								placeholder='搜索项目...'
								className='pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm'
							/>
						</div>
						<Button variant='outline' size='sm'>
							<FilterIcon className='h-4 w-4 mr-2'/>
							筛选
						</Button>
					</div>

					<div className='flex items-center space-x-1'>
						<Button variant='outline' size='sm'>
							<GridIcon className='h-4 w-4'/>
						</Button>
						<Button variant='outline' size='sm'>
							<ListIcon className='h-4 w-4'/>
						</Button>
					</div>
				</div>

				{/* Project Grid */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'>
					{/* Empty State - Would be replaced with actual projects */}
					<Card className='border-dashed border-2'>
						<CardContent className='flex flex-col items-center justify-center py-12'>
							<FolderIcon className='h-12 w-12 text-muted-foreground mb-4'/>
							<h3 className='text-lg font-semibold mb-2'>创建新项目</h3>
							<p className='text-muted-foreground text-center mb-4'>开始一个新的素材协作项目</p>
							<Button>
								<PlusIcon className='h-4 w-4 mr-2'/>
								创建项目
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* Project Table View */}
				<Card>
					<CardHeader>
						<CardTitle>所有项目</CardTitle>
						<CardDescription>查看和管理您的项目列表</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead>
									<tr className='border-b'>
										<th className='text-left py-3 px-4 font-medium'>项目名称</th>
										<th className='text-left py-3 px-4 font-medium'>状态</th>
										<th className='text-left py-3 px-4 font-medium'>成员</th>
										<th className='text-left py-3 px-4 font-medium'>素材数量</th>
										<th className='text-left py-3 px-4 font-medium'>最后更新</th>
										<th className='text-left py-3 px-4 font-medium'>操作</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td colSpan={6} className='text-center py-12 text-muted-foreground'>
											<FolderIcon className='h-8 w-8 mx-auto mb-2'/>
											<p>暂无项目</p>
											<p className='text-sm'>创建您的第一个项目开始协作</p>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-base'>快速创建</CardTitle>
						</CardHeader>
						<CardContent className='space-y-2'>
							<Button variant='outline' size='sm' className='w-full justify-start'>
								从模板创建
							</Button>
							<Button variant='outline' size='sm' className='w-full justify-start'>
								空白项目
							</Button>
							<Button variant='outline' size='sm' className='w-full justify-start'>
								导入项目
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-base'>最近访问</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-sm text-muted-foreground'>暂无最近访问的项目</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className='pb-3'>
							<CardTitle className='text-base'>团队项目</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-sm text-muted-foreground'>暂无团队协作项目</p>
						</CardContent>
					</Card>
				</div>
			</Main>
		</>
	);
}
