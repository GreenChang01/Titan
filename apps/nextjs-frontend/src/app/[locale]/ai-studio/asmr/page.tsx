'use client';

import React, {useEffect} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';

export default function ASMRAudioPage() {
	const searchParams = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		const tabParam = searchParams.get('tab');
		if (tabParam === 'generate') {
			router.replace('/ai-studio/asmr/generate');
		} else {
			router.replace('/ai-studio/asmr/gallery');
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
