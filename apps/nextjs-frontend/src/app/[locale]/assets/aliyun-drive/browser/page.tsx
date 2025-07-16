'use client';

import React from 'react';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Cloud} from 'lucide-react';
import {AliyunDriveBrowser} from '@/components/aliyun-drive/aliyun-drive-browser';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {Header} from '@/components/layout/header';

export default function AliyunDriveBrowserPage() {
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
							<BreadcrumbLink href='/assets'>资产管理</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator/>
						<BreadcrumbItem>
							<BreadcrumbPage>文件浏览器</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</Header>

			<div className='p-6'>
				<div className='max-w-7xl mx-auto'>
					<div className='mb-6'>
						<h1 className='text-3xl font-bold text-foreground'>阿里云盘文件浏览器</h1>
						<p className='text-muted-foreground mt-2'>
							浏览、上传和管理您的阿里云盘文件
						</p>
					</div>

					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Cloud className='w-5 h-5 text-blue-500'/>
								文件浏览器
							</CardTitle>
							<CardDescription>
								浏览、上传和管理您的阿里云盘文件
							</CardDescription>
						</CardHeader>
						<CardContent>
							<AliyunDriveBrowser/>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
