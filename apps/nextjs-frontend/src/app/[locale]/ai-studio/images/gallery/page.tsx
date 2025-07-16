'use client';

import React from 'react';
import {AIImageManager} from '@/components/ai-image/ai-image-manager';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {Header} from '@/components/layout/header';

export default function AIImagesGalleryPage() {
	return (
		<div className="min-h-screen bg-background">
			<Header>
				<div className='flex-1'>
					<h1 className='text-lg font-medium'>AI图片库</h1>
					<p className='text-sm text-muted-foreground'>浏览和管理您的AI生成图片收藏</p>
				</div>
				<div className='flex items-center gap-2'>
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink href="/dashboard">工作台</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>AI图片库</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</Header>
			
			<div className="p-6">
				<div className="max-w-7xl mx-auto">
					<AIImageManager />
				</div>
			</div>
		</div>
	);
}