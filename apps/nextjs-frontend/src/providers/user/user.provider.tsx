'use client';

import {useEffect, type JSX} from 'react';
import {usePathname} from '@/i18n/navigation';
import {useUserStore} from '@/store/user/user.store';

export function UserProvider({children}: {readonly children: JSX.Element}): JSX.Element {
	const loadUser = useUserStore(s => s.loadUser);
	const pathname = usePathname();

	useEffect(() => {
		const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/confirm'];
		const isAuthPage = authPages.some(authPage => pathname.startsWith(authPage));

		if (!isAuthPage) {
			void loadUser();
		}
	}, [loadUser, pathname]);

	return children;
}
