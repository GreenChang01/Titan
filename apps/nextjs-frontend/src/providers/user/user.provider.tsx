'use client';

import {useEffect, useCallback, type JSX} from 'react';
import {usePathname} from '@/i18n/navigation';
import {useUserStore} from '@/store/user/user.store';

export function UserProvider({children}: {readonly children: JSX.Element}): JSX.Element {
	const user = useUserStore(s => s.user);
	const loadUser = useUserStore(s => s.loadUser);
	const pathname = usePathname();

	// 使用 useCallback 缓存 loadUser 函数引用，避免无限循环
	const stableLoadUser = useCallback(() => {
		void loadUser();
	}, [loadUser]);

	useEffect(() => {
		const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/confirm'];
		const isAuthPage = authPages.some(authPage => pathname.startsWith(authPage));

		// 只有在非认证页面且用户未加载时才加载用户
		if (!isAuthPage && !user) {
			stableLoadUser();
		}
	}, [stableLoadUser, pathname, user]);

	return children;
}
