'use client';

import {useEffect} from 'react';
import {useRouter} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import {SidebarProvider} from '@/components/ui/sidebar';
import {AppSidebar} from '@/components/layout/app-sidebar';
import {useUserStore} from '@/store/user/user.store';

type Props = {
	readonly children?: React.ReactNode;
};

function AuthLoadingSpinner() {
	return (
		<div className='min-h-screen flex items-center justify-center bg-background'>
			<div className='flex flex-col items-center space-y-4'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'/>
				<p className='text-sm text-muted-foreground'>验证登录状态...</p>
			</div>
		</div>
	);
}

export function AuthenticatedLayout({children}: Props) {
	const {user, loading, error} = useUserStore();
	const router = useRouter();

	useEffect(() => {
		// 只有在明确没有用户且加载完成时才重定向到登录页
		if (!loading && !user && error) {
			router.push('/login');
		}
	}, [user, loading, error, router]);

	// 正在加载用户状态
	if (loading) {
		return <AuthLoadingSpinner/>;
	}

	// 用户已认证或者加载中，显示正常布局
	return (
		<SidebarProvider defaultOpen>
			<AppSidebar/>
			<div
				id='content'
				className={cn(
					'ml-auto w-full max-w-full',
					'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
					'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
					'sm:transition-[width] sm:duration-200 sm:ease-linear',
					'flex h-svh flex-col',
					'group-data-[scroll-locked=1]/body:h-full',
					'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh',
				)}
			>
				{children}
			</div>
		</SidebarProvider>
	);
}
