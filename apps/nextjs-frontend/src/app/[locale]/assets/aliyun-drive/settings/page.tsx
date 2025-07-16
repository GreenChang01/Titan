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
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Settings className='w-5 h-5 text-blue-500'/>
								阿里云盘WebDAV配置
							</CardTitle>
							<CardDescription>
								管理您的阿里云盘WebDAV连接配置，支持文件浏览和上传下载
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
