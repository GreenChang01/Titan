'use client';

import React from 'react';
import {Header} from '@/components/layout/header';
import {
	Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {VirtualizedAIImages} from '@/components/ai-image/virtualized-ai-images';

export default function AIImagesManagePage() {
	return (
		<div className='flex h-screen bg-background'>
			<div className='flex-1 flex flex-col overflow-hidden'>
				<Header>
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink href='/dashboard'>工作台</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink href='/ai-images'>AI图片</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>图片管理</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</Header>
				<main className='flex-1 overflow-y-auto p-6'>
					<div className='container mx-auto space-y-6'>
						<div className='space-y-2'>
							<h1 className='text-3xl font-bold tracking-tight'>AI图片管理</h1>
							<p className='text-muted-foreground'>
								管理和查看生成的AI图片素材
							</p>
						</div>
						<VirtualizedAIImages />
					</div>
				</main>
			</div>
		</div>
	);
}