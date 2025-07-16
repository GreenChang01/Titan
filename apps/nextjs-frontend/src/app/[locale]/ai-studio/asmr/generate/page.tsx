'use client';

import React from 'react';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Mic} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {Header} from '@/components/layout/header';

export default function ASMRAudioGeneratePage() {
	return (
		<div className='min-h-screen bg-background'>
			<Header>
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href='/dashboard'>工作台</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator/>
						<BreadcrumbItem>
							<BreadcrumbLink href='/ai-studio'>AI Studio</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator/>
						<BreadcrumbItem>
							<BreadcrumbPage>生成新音频</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</Header>

			<div className='p-6'>
				<div className='max-w-7xl mx-auto'>
					<div className='mb-6'>
						<h1 className='text-3xl font-bold text-foreground'>ASMR音频生成</h1>
						<p className='text-muted-foreground mt-2'>
							使用AI创建沉浸式ASMR音频体验
						</p>
					</div>

					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Mic className='w-5 h-5 text-blue-500'/>
								ASMR音频生成
							</CardTitle>
							<CardDescription>
								使用AI创建沉浸式ASMR音频体验
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='text-center py-12'>
								<Mic className='w-16 h-16 text-gray-400 mx-auto mb-4'/>
								<h3 className='text-lg font-medium text-gray-900 dark:text-gray-100 mb-2'>
									ASMR生成器
								</h3>
								<p className='text-gray-600 dark:text-gray-400 mb-6'>
									即将推出ASMR生成功能，或者跳转到现有的生成页面
								</p>
								<Button
									className='bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
									onClick={() => globalThis.location.href = '/generate'}
								>
									<Mic className='w-4 h-4 mr-2'/>
									前往ASMR生成
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
