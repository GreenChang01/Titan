import {getTranslations} from 'next-intl/server';
import {type JSX} from 'react';
import {
	UserIcon, CloudIcon, BellIcon, ShieldIcon, CheckIcon, AlertTriangleIcon,
} from 'lucide-react';
import {Breadcrumb} from '@/components/breadcrumb/breadcrumb.component';
import {Button} from '@/components/ui/button';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {
	Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {Header} from '@/components/layout/header';
import {Main} from '@/components/layout/main';

export default async function Settings(): Promise<JSX.Element> {
	const t = await getTranslations('Page-Settings');

	return (
		<>
			<Header>
				<Breadcrumb />
			</Header>

			<Main>
				<div className='space-y-6'>
					<div>
						<h1 className='text-3xl font-bold tracking-tight'>{t('title', {defaultMessage: '设置'})}</h1>
						<p className='text-muted-foreground'>{t('subtitle', {defaultMessage: '管理您的账户和应用程序设置'})}</p>
					</div>

					<Tabs defaultValue='profile' className='space-y-4'>
						<TabsList className='grid w-full grid-cols-4'>
							<TabsTrigger value='profile' className='flex items-center gap-2'>
								<UserIcon className='h-4 w-4' />
								{t('profile-settings', {defaultMessage: '个人资料'})}
							</TabsTrigger>
							<TabsTrigger value='aliyun' className='flex items-center gap-2'>
								<CloudIcon className='h-4 w-4' />
								{t('aliyun-settings', {defaultMessage: '阿里云盘'})}
							</TabsTrigger>
							<TabsTrigger value='notifications' className='flex items-center gap-2'>
								<BellIcon className='h-4 w-4' />
								{t('notification-settings', {defaultMessage: '通知'})}
							</TabsTrigger>
							<TabsTrigger value='security' className='flex items-center gap-2'>
								<ShieldIcon className='h-4 w-4' />
								{t('security-settings', {defaultMessage: '安全'})}
							</TabsTrigger>
						</TabsList>

						<TabsContent value='profile' className='space-y-4'>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<UserIcon className='h-5 w-5' />
										{t('profile-settings', {defaultMessage: '个人资料'})}
									</CardTitle>
									<CardDescription>更新您的个人信息和账户详情</CardDescription>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='space-y-2'>
										<Label htmlFor='username'>{t('username', {defaultMessage: '用户名'})}</Label>
										<Input
											id='username'
											type='text'
											placeholder={t('username-placeholder', {defaultMessage: '请输入用户名'})}
										/>
									</div>
									<div className='space-y-2'>
										<Label htmlFor='email'>{t('email', {defaultMessage: '邮箱地址'})}</Label>
										<Input
											id='email'
											type='email'
											placeholder={t('email-placeholder', {defaultMessage: '请输入邮箱地址'})}
										/>
									</div>
									<Button>{t('save-profile', {defaultMessage: '保存资料'})}</Button>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value='aliyun' className='space-y-4'>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<CloudIcon className='h-5 w-5' />
										{t('aliyun-settings', {defaultMessage: '阿里云盘配置'})}
									</CardTitle>
									<CardDescription>配置阿里云盘WebDAV连接以管理您的文件</CardDescription>
								</CardHeader>
								<CardContent className='space-y-4'>
									{/* 配置状态 */}
									<div className='p-4 border rounded-lg bg-amber-50 border-amber-200'>
										<div className='flex items-center gap-2'>
											<AlertTriangleIcon className='h-4 w-4 text-amber-600' />
											<span className='text-amber-800 text-sm'>
												{t('aliyun-not-configured', {defaultMessage: '阿里云盘尚未配置'})}
											</span>
										</div>
									</div>

									<div className='space-y-4'>
										<div className='space-y-2'>
											<Label htmlFor='webdav-url'>{t('webdav-url', {defaultMessage: 'WebDAV 地址'})}</Label>
											<Input id='webdav-url' type='url' placeholder='http://localhost:5244/dav' />
										</div>
										<div className='space-y-2'>
											<Label htmlFor='webdav-username'>{t('webdav-username', {defaultMessage: '用户名'})}</Label>
											<Input
												id='webdav-username'
												type='text'
												placeholder={t('webdav-username-placeholder', {defaultMessage: '请输入WebDAV用户名'})}
											/>
										</div>
										<div className='space-y-2'>
											<Label htmlFor='webdav-password'>{t('webdav-password', {defaultMessage: '密码'})}</Label>
											<Input
												id='webdav-password'
												type='password'
												placeholder={t('webdav-password-placeholder', {defaultMessage: '请输入WebDAV密码'})}
											/>
										</div>
										<div className='flex gap-2'>
											<Button variant='outline'>{t('test-connection', {defaultMessage: '测试连接'})}</Button>
											<Button>{t('save-config', {defaultMessage: '保存配置'})}</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value='notifications' className='space-y-4'>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<BellIcon className='h-5 w-5' />
										{t('notification-settings', {defaultMessage: '通知设置'})}
									</CardTitle>
									<CardDescription>配置您希望接收的通知类型</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='flex items-center justify-between p-4 border rounded-lg'>
										<div className='space-y-1'>
											<h3 className='font-medium'>{t('email-notifications', {defaultMessage: '邮件通知'})}</h3>
											<p className='text-sm text-muted-foreground'>
												{t('email-notifications-desc', {defaultMessage: '接收项目更新和素材变动的邮件通知'})}
											</p>
										</div>
										<Button variant='outline' size='sm'>
											启用
										</Button>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value='security' className='space-y-4'>
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<ShieldIcon className='h-5 w-5' />
										{t('security-settings', {defaultMessage: '安全设置'})}
									</CardTitle>
									<CardDescription>管理您的账户安全选项</CardDescription>
								</CardHeader>
								<CardContent>
									<Button variant='destructive'>{t('change-password', {defaultMessage: '修改密码'})}</Button>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</Main>
		</>
	);
}
