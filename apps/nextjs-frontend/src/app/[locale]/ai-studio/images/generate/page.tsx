'use client';

import React from 'react';
import {AIStudioGenerator} from '@/components/ai-studio/ai-studio-generator';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {Header} from '@/components/layout/header';

export default function AIImagesGeneratePage() {
	return (
		<div className='min-h-screen bg-background'>
			<Header>
				<div className='flex-1'>
					<h1 className='text-lg font-medium'>AI图片生成</h1>
					<p className='text-sm text-muted-foreground'>使用AI技术创建精美的图片素材</p>
				</div>
				<div className='flex items-center gap-2'>
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink href='/dashboard'>工作台</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator/>
							<BreadcrumbItem>
								<BreadcrumbPage>AI图片生成</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</Header>

			<div className='p-6'>
				<div className='max-w-7xl mx-auto'>
					<AIStudioGenerator/>
				</div>
			</div>
		</div>
	);
}
