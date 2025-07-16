'use client';

import {type JSX} from 'react';
import {
	HomeIcon,
	Sparkles,
	Clock,
	FileAudio,
	TrendingUp,
	Activity,
	Plus,
	Play,
	Download,
	BarChart3,
	Loader2,
} from 'lucide-react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Header} from '@/components/layout/header';
import {Main} from '@/components/layout/main';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';

// Mock data for demonstration
const recentCreations = [
	{
		id: '1',
		title: '睡前放松音频',
		description: '闭上眼睛，让身体完全放松下来...',
		duration: '5:32',
		createdAt: '2024-01-15T10:30:00Z',
		category: '睡眠引导',
		status: 'completed',
	},
	{
		id: '2',
		title: '自然冥想',
		description: '想象自己置身于宁静的森林中...',
		duration: '8:15',
		createdAt: '2024-01-14T15:45:00Z',
		category: '冥想引导',
		status: 'completed',
	},
	{
		id: '3',
		title: '正念练习',
		description: '将注意力集中在当下的感受...',
		duration: '12:08',
		createdAt: '2024-01-13T09:20:00Z',
		category: '正念练习',
		status: 'completed',
	},
];

const currentJobs = [
	{
		id: '1',
		title: '深度放松引导',
		progress: 75,
		estimatedTime: '2分钟',
		status: 'processing',
	},
	{
		id: '2',
		title: '呼吸练习音频',
		progress: 25,
		estimatedTime: '5分钟',
		status: 'processing',
	},
];

export default function Dashboard(): JSX.Element {
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('zh-CN', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<>
			<Header>
				<div>
					<h1 className='text-lg font-medium flex items-center gap-2'>
						<HomeIcon className='h-5 w-5 text-primary'/>
						工作台
					</h1>
					<p className='text-sm text-muted-foreground'>
						您的AI内容创作中心
					</p>
				</div>
			</Header>

			<Main>
				<div className='max-w-7xl mx-auto space-y-6'>
					{/* Hero Section - Start Creating */}
					<Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
						<CardContent className="pt-6">
							<div className="flex flex-col md:flex-row items-center justify-between gap-6">
								<div className="flex-1 text-center md:text-left">
									<h2 className="text-2xl font-bold mb-2">开始您的创作之旅</h2>
									<p className="text-muted-foreground mb-4 max-w-md">
										仅需几步简单操作，即可生成高质量的ASMR音频内容。让AI成为您的创作助手。
									</p>
									<div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
										<Link href="/generate">
											<Button size="lg" className="w-full sm:w-auto">
												<Sparkles className="h-5 w-5 mr-2"/>
												开始创作
											</Button>
										</Link>
										<Link href="/library">
											<Button variant="outline" size="lg" className="w-full sm:w-auto">
												<FileAudio className="h-5 w-5 mr-2"/>
												查看内容库
											</Button>
										</Link>
									</div>
								</div>
								<div className="flex items-center justify-center">
									<div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
										<Sparkles className="h-16 w-16 text-primary"/>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Stats Overview */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<Card>
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">总创作数</p>
										<p className="text-2xl font-bold">12</p>
									</div>
									<FileAudio className="h-8 w-8 text-muted-foreground"/>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">本月创作</p>
										<p className="text-2xl font-bold">5</p>
									</div>
									<TrendingUp className="h-8 w-8 text-muted-foreground"/>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">总时长</p>
										<p className="text-2xl font-bold">2.5小时</p>
									</div>
									<Clock className="h-8 w-8 text-muted-foreground"/>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">生成中</p>
										<p className="text-2xl font-bold">{currentJobs.length}</p>
									</div>
									<Activity className="h-8 w-8 text-muted-foreground"/>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Main Content Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Recent Creations */}
						<Card className="lg:col-span-2">
							<CardHeader>
								<div className="flex items-center justify-between">
									<div>
										<CardTitle>最近创作</CardTitle>
										<CardDescription>您最近生成的ASMR音频内容</CardDescription>
									</div>
									<Link href="/library">
										<Button variant="outline" size="sm">
											查看全部
										</Button>
									</Link>
								</div>
							</CardHeader>
							<CardContent>
								{recentCreations.length === 0 ? (
									<div className="text-center py-12">
										<FileAudio className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
										<h3 className="text-lg font-medium mb-2">暂无创作内容</h3>
										<p className="text-muted-foreground mb-4">
											开始您的第一个ASMR音频创作
										</p>
										<Link href="/generate">
											<Button>
												<Plus className="h-4 w-4 mr-2"/>
												立即创作
											</Button>
										</Link>
									</div>
								) : (
									<div className="space-y-4">
										{recentCreations.map((creation) => (
											<Card key={creation.id} className="hover:shadow-sm transition-shadow">
												<CardContent className="p-4">
													<div className="flex items-center justify-between">
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-3">
																<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
																	<FileAudio className="h-6 w-6 text-primary"/>
																</div>
																<div className="flex-1">
																	<h4 className="font-medium truncate">{creation.title}</h4>
																	<p className="text-sm text-muted-foreground truncate">
																		{creation.description}
																	</p>
																	<div className="flex items-center gap-2 mt-1">
																		<Badge variant="secondary" className="text-xs">
																			{creation.category}
																		</Badge>
																		<span className="text-xs text-muted-foreground">
																			{creation.duration}
																		</span>
																		<span className="text-xs text-muted-foreground">
																			{formatDate(creation.createdAt)}
																		</span>
																	</div>
																</div>
															</div>
														</div>
														<div className="flex items-center gap-2">
															<Button variant="ghost" size="sm">
																<Play className="h-4 w-4"/>
															</Button>
															<Button variant="ghost" size="sm">
																<Download className="h-4 w-4"/>
															</Button>
														</div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Current Jobs & Quick Actions */}
						<div className="space-y-6">
							{/* Current Jobs */}
							<Card>
								<CardHeader>
									<CardTitle>生成进度</CardTitle>
									<CardDescription>当前正在生成的音频任务</CardDescription>
								</CardHeader>
								<CardContent>
									{currentJobs.length === 0 ? (
										<div className="text-center py-8">
											<Activity className="h-8 w-8 text-muted-foreground mx-auto mb-3"/>
											<p className="text-sm text-muted-foreground">暂无正在生成的任务</p>
										</div>
									) : (
										<div className="space-y-4">
											{currentJobs.map((job) => (
												<div key={job.id} className="space-y-2">
													<div className="flex items-center justify-between text-sm">
														<span className="font-medium truncate">{job.title}</span>
														<span className="text-muted-foreground">{job.progress}%</span>
													</div>
													<Progress value={job.progress} className="h-2"/>
													<div className="flex items-center gap-2 text-xs text-muted-foreground">
														<Loader2 className="h-3 w-3 animate-spin"/>
														<span>预计剩余 {job.estimatedTime}</span>
													</div>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>

							{/* Quick Actions */}
							<Card>
								<CardHeader>
									<CardTitle>快速操作</CardTitle>
									<CardDescription>常用功能快捷入口</CardDescription>
								</CardHeader>
								<CardContent className="space-y-2">
									<Link href="/generate">
										<Button variant="outline" className="w-full justify-start">
											<Sparkles className="h-4 w-4 mr-2"/>
											开始创作
										</Button>
									</Link>
									<Link href="/library">
										<Button variant="outline" className="w-full justify-start">
											<FileAudio className="h-4 w-4 mr-2"/>
											内容库
										</Button>
									</Link>
									<Link href="/assets/upload">
										<Button variant="outline" className="w-full justify-start">
											<Plus className="h-4 w-4 mr-2"/>
											上传素材
										</Button>
									</Link>
									<Link href="/prompts">
										<Button variant="outline" className="w-full justify-start">
											<FileAudio className="h-4 w-4 mr-2"/>
											提示词库
										</Button>
									</Link>
									<Button variant="outline" className="w-full justify-start">
										<BarChart3 className="h-4 w-4 mr-2"/>
										使用统计
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</Main>
		</>
	);
}
