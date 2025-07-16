'use client';

import React from 'react';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Settings} from 'lucide-react';
import {AliyunDriveConnector} from '@/components/aliyun-drive/aliyun-drive-connector';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {Header} from '@/components/layout/header';

export default function AliyunDriveSettingsPage() {
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
							<BreadcrumbPage>连接设置</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</Header>

			<div className='p-6'>
				<div className='max-w-7xl mx-auto'>
					<div className='mb-6'>
						<h1 className='text-3xl font-bold text-foreground'>阿里云盘连接设置</h1>
						<p className='text-muted-foreground mt-2'>
							配置阿里云盘WebDAV连接设置
						</p>
					</div>

					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Settings className='w-5 h-5 text-blue-500'/>
								连接设置
							</CardTitle>
							<CardDescription>
								配置阿里云盘WebDAV连接设置
							</CardDescription>
						</CardHeader>
						<CardContent>
							<AliyunDriveConnector/>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
