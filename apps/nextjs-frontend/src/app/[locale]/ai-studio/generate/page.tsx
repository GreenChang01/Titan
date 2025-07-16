'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';

export default function AIStudioGenerateRedirect() {
	const router = useRouter();

	useEffect(() => {
		router.replace('/ai-studio/images?tab=generate');
	}, [router]);

	return null;
}