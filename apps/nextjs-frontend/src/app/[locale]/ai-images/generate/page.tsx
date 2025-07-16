'use client';

import React from 'react';
import {Header} from '@/components/layout/header';
import {
	Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {AIImageGenerator} from '@/components/ai-image/ai-image-generator';

export default function AIImagesGeneratePage() {
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
								<BreadcrumbPage>生成图片</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</Header>
				<main className='flex-1 overflow-y-auto p-6'>
					<div className='container mx-auto space-y-6'>
						<div className='space-y-2'>
							<h1 className='text-3xl font-bold tracking-tight'>AI图片生成</h1>
							<p className='text-muted-foreground'>
								使用AI技术生成ASMR场景相关的图片素材
							</p>
						</div>
						<AIImageGenerator
							onGenerated={(imageUrl, prompt) => {
								console.log('图片生成成功:', {imageUrl, prompt});
							}}
						/>
					</div>
				</main>
			</div>
		</div>
	);
}
