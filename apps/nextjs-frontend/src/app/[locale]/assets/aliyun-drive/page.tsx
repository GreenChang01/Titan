'use client';

import React, {useEffect} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';

export default function AliyunDrivePage() {
	const searchParams = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		const tabParam = searchParams.get('tab');
		if (tabParam === 'settings') {
			router.replace('/assets/aliyun-drive/settings');
		} else {
			router.replace('/assets/aliyun-drive/browser');
		}
	}, [searchParams, router]);

	return (
		<div className='flex items-center justify-center min-h-screen'>
			<div className='text-center'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'/>
				<p className='text-muted-foreground'>正在跳转...</p>
			</div>
		</div>
	);
}
