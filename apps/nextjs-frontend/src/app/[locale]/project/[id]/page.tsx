import {getTranslations} from 'next-intl/server';
import {type JSX} from 'react';
import {
	SettingsIcon, PlusIcon, FilterIcon, CloudIcon, FileIcon, ClockIcon, FolderIcon,
} from 'lucide-react';
import {Breadcrumb} from '@/components/breadcrumb/breadcrumb.component';
import {Button} from '@/components/ui/button';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Header} from '@/components/layout/header';
import {Main} from '@/components/layout/main';

type ProjectDetailsProps = {
	readonly params: Promise<{
		locale: string;
		id: string;
	}>;
};

export default async function ProjectDetails({params}: ProjectDetailsProps): Promise<JSX.Element> {
	const {id} = await params;
	const t = await getTranslations('Page-ProjectDetails');

	return (
		<>
			<Header>
				<div className='flex items-center justify-between w-full'>
					<Breadcrumb/>
					<div className='flex items-center space-x-2'>
						<Button variant='outline' size='sm'>
							<SettingsIcon className='h-4 w-4 mr-2'/>
							{t('settings', {defaultMessage: '设置'})}
						</Button>
						<Button size='sm'>
							<PlusIcon className='h-4 w-4 mr-2'/>
							{t('add-material', {defaultMessage: '添加素材'})}
						</Button>
					</div>
				</div>
			</Header>

			<Main>
				<div className='space-y-6'>
					{/* Page Header */}
					<div>
						<h1 className='text-3xl font-bold tracking-tight mb-2'>{t('title', {defaultMessage: '项目详情'})}</h1>
						<p className='text-muted-foreground'>
							{t('subtitle', {defaultMessage: '管理项目素材和配置', projectId: id})}
						</p>
					</div>

					{/* Project Info Card */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<FolderIcon className='h-5 w-5'/>
								项目信息
							</CardTitle>
							<CardDescription>项目的基本信息和统计数据</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
								<div>
									<h3 className='text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2'>
										{t('project-name', {defaultMessage: '项目名称'})}
									</h3>
									<p className='text-lg font-semibold'>{t('loading-project-name', {defaultMessage: '加载中...'})}</p>
								</div>
								<div>
									<h3 className='text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2'>
										{t('material-count', {defaultMessage: '素材数量'})}
									</h3>
									<p className='text-lg font-semibold'>0</p>
								</div>
								<div>
									<h3 className='text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2'>
										{t('created-date', {defaultMessage: '创建时间'})}
									</h3>
									<p className='text-lg font-semibold'>{t('loading-date', {defaultMessage: '加载中...'})}</p>
								</div>
							</div>

							<div className='mt-6'>
								<h3 className='text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2'>
									{t('description', {defaultMessage: '项目描述'})}
								</h3>
								<p className='text-foreground'>{t('loading-description', {defaultMessage: '加载中...'})}</p>
							</div>
						</CardContent>
					</Card>

					{/* Materials Card */}
					<Card>
						<CardHeader>
							<div className='flex items-center justify-between'>
								<div>
									<CardTitle className='flex items-center gap-2'>
										<FileIcon className='h-5 w-5'/>
										{t('materials-list', {defaultMessage: '项目素材'})}
									</CardTitle>
									<CardDescription>管理项目中的所有素材文件</CardDescription>
								</div>
								<div className='flex items-center space-x-2'>
									<Button variant='outline' size='sm'>
										<FilterIcon className='h-4 w-4 mr-2'/>
										{t('filter', {defaultMessage: '筛选'})}
									</Button>
									<Button size='sm'>
										<CloudIcon className='h-4 w-4 mr-2'/>
										{t('browse-cloud', {defaultMessage: '浏览云盘'})}
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{/* Empty State */}
							<div className='text-center py-12'>
								<div className='mx-auto h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4'>
									<FileIcon className='h-6 w-6 text-muted-foreground'/>
								</div>
								<h3 className='text-lg font-semibold mb-2'>{t('no-materials', {defaultMessage: '暂无素材'})}</h3>
								<p className='text-muted-foreground mb-6'>
									{t('no-materials-description', {defaultMessage: '从您的阿里云盘添加素材到此项目'})}
								</p>
								<Button>
									<CloudIcon className='h-4 w-4 mr-2'/>
									{t('add-first-material', {defaultMessage: '添加第一个素材'})}
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Activity Log Card */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<ClockIcon className='h-5 w-5'/>
								{t('activity-log', {defaultMessage: '活动日志'})}
							</CardTitle>
							<CardDescription>查看项目的最新活动记录</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='text-center py-8'>
								<div className='mx-auto h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4'>
									<ClockIcon className='h-6 w-6 text-muted-foreground'/>
								</div>
								<p className='text-muted-foreground'>{t('no-activity', {defaultMessage: '暂无活动记录'})}</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</Main>
		</>
	);
}
