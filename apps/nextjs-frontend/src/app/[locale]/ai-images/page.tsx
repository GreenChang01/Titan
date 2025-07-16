'use client';

import {useEffect} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';

export default function AIImagesRedirect() {
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const tabParam = searchParams.get('tab');
		if (tabParam === 'manage') {
			router.replace('/ai-images/manage');
		} else if (tabParam === 'demo') {
			router.replace('/ai-images/demo');
		} else {
			router.replace('/ai-images/generate');
		}
	}, [router, searchParams]);

	return (
		<div className='flex items-center justify-center min-h-screen'>
			<div className='text-center'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'/>
				<p className='text-muted-foreground'>正在跳转...</p>
			</div>
		</div>
	);
}
