'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';

export default function AIStudioManageRedirect() {
	const router = useRouter();

	useEffect(() => {
		router.replace('/ai-studio/images');
	}, [router]);

	return null;
}