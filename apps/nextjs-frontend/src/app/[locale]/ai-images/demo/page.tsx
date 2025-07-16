'use client';

import React from 'react';
import {Header} from '@/components/layout/header';
import {
	Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';

export default function AIImagesDemoPage() {
	return (
		<div className='flex h-screen bg-background'>
			<div className='flex-1 flex flex-col overflow-hidden'>
				<Header>
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink href='/dashboard'>工作台</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator/>
							<BreadcrumbItem>
								<BreadcrumbLink href='/ai-images'>AI图片</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator/>
							<BreadcrumbItem>
								<BreadcrumbPage>功能演示</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</Header>
				<main className='flex-1 overflow-y-auto p-6'>
					<div className='container mx-auto space-y-6'>
						<div className='space-y-2'>
							<h1 className='text-3xl font-bold tracking-tight'>AI图片功能演示</h1>
							<p className='text-muted-foreground'>
								了解AI图片生成功能的特点和使用方法
							</p>
						</div>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<Card>
								<CardHeader>
									<CardTitle>功能特点</CardTitle>
									<CardDescription>
										AI图片生成功能的主要特点和优势
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='space-y-3'>
										<div className='flex items-start gap-3'>
											<div className='w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5'>
												<span className='text-green-600 text-sm font-bold'>✓</span>
											</div>
											<div>
												<h4 className='font-medium'>免费AI服务</h4>
												<p className='text-sm text-muted-foreground'>
													使用Pollinations.AI免费生成服务，无需API密钥
												</p>
											</div>
										</div>

										<div className='flex items-start gap-3'>
											<div className='w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5'>
												<span className='text-blue-600 text-sm font-bold'>✓</span>
											</div>
											<div>
												<h4 className='font-medium'>ASMR场景模板</h4>
												<p className='text-sm text-muted-foreground'>
													预设自然、温馨、抽象、禅意等多种ASMR场景模板
												</p>
											</div>
										</div>

										<div className='flex items-start gap-3'>
											<div className='w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5'>
												<span className='text-purple-600 text-sm font-bold'>✓</span>
											</div>
											<div>
												<h4 className='font-medium'>素材管理集成</h4>
												<p className='text-sm text-muted-foreground'>
													生成的图片自动保存到素材库，支持分类和标签管理
												</p>
											</div>
										</div>

										<div className='flex items-start gap-3'>
											<div className='w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5'>
												<span className='text-orange-600 text-sm font-bold'>✓</span>
											</div>
											<div>
												<h4 className='font-medium'>智能标签系统</h4>
												<p className='text-sm text-muted-foreground'>
													根据提示词自动生成相关标签，便于搜索和分类
												</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>使用指南</CardTitle>
									<CardDescription>
										如何有效使用AI图片生成功能
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='space-y-3'>
										<div>
											<h4 className='font-medium'>1. 选择场景模板</h4>
											<p className='text-sm text-muted-foreground'>
												从自然景观、温馨环境、抽象艺术、禅意空间中选择合适的模板作为起点
											</p>
										</div>

										<div>
											<h4 className='font-medium'>2. 编写提示词</h4>
											<p className='text-sm text-muted-foreground'>
												使用详细的英文描述，包含场景、情绪、色彩等关键信息
											</p>
										</div>

										<div>
											<h4 className='font-medium'>3. 生成和调整</h4>
											<p className='text-sm text-muted-foreground'>
												点击生成按钮，如果不满意可以使用重新生成功能获得不同的结果
											</p>
										</div>

										<div>
											<h4 className='font-medium'>4. 管理素材</h4>
											<p className='text-sm text-muted-foreground'>
												在图片管理页面查看、搜索、下载或删除生成的图片
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className='md:col-span-2'>
								<CardHeader>
									<CardTitle>示例提示词</CardTitle>
									<CardDescription>
										一些效果良好的提示词示例，可以直接使用或作为参考
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div className='space-y-2'>
											<h4 className='font-medium text-green-600'>自然场景</h4>
											<div className='space-y-1 text-sm'>
												<p className='p-2 bg-muted rounded text-xs'>
													"peaceful forest stream with soft sunlight filtering through green leaves"
												</p>
												<p className='p-2 bg-muted rounded text-xs'>
													"tranquil mountain lake reflecting clouds at golden sunset"
												</p>
												<p className='p-2 bg-muted rounded text-xs'>
													"gentle rainfall on moss-covered rocks in a serene garden"
												</p>
											</div>
										</div>

										<div className='space-y-2'>
											<h4 className='font-medium text-blue-600'>温馨环境</h4>
											<div className='space-y-1 text-sm'>
												<p className='p-2 bg-muted rounded text-xs'>
													"warm fireplace with soft candlelight in a cozy living room"
												</p>
												<p className='p-2 bg-muted rounded text-xs'>
													"comfortable reading nook with soft blankets and dim lighting"
												</p>
												<p className='p-2 bg-muted rounded text-xs'>
													"peaceful bedroom with soft morning light through sheer curtains"
												</p>
											</div>
										</div>

										<div className='space-y-2'>
											<h4 className='font-medium text-purple-600'>抽象艺术</h4>
											<div className='space-y-1 text-sm'>
												<p className='p-2 bg-muted rounded text-xs'>
													"soft flowing waves in calming blue and lavender tones"
												</p>
												<p className='p-2 bg-muted rounded text-xs'>
													"gentle abstract patterns in warm earth colors and gold accents"
												</p>
												<p className='p-2 bg-muted rounded text-xs'>
													"dreamy watercolor textures in pastel pink and blue"
												</p>
											</div>
										</div>

										<div className='space-y-2'>
											<h4 className='font-medium text-orange-600'>禅意空间</h4>
											<div className='space-y-1 text-sm'>
												<p className='p-2 bg-muted rounded text-xs'>
													"minimalist zen garden with carefully arranged stones and sand"
												</p>
												<p className='p-2 bg-muted rounded text-xs'>
													"simple meditation space with soft cushions and gentle lighting"
												</p>
												<p className='p-2 bg-muted rounded text-xs'>
													"serene spa environment with candles and natural elements"
												</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
