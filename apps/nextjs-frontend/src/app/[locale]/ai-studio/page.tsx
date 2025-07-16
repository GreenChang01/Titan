'use client';

import React, {useEffect} from 'react';
import {useRouter} from 'next/navigation';

export default function AIStudioPage() {
	const router = useRouter();

	useEffect(() => {
		// 默认跳转到AI图片库
		router.replace('/ai-studio/images/gallery');
	}, [router]);

	return (
		<div className='flex items-center justify-center min-h-screen'>
			<div className='text-center'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'/>
				<p className='text-muted-foreground'>正在跳转...</p>
			</div>
		</div>
	);
}
