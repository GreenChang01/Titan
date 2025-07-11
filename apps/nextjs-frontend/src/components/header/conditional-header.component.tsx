'use client';

import {usePathname} from 'next/navigation';
import {type JSX} from 'react';
import {Header} from './header.component';

export function ConditionalHeader(): JSX.Element | undefined {
  const pathname = usePathname();

  // 定义不需要显示Header的路径
  const authPaths = ['login', 'register', 'forgot-password', 'reset-password', 'confirm'];

  // 检查当前路径是否为认证相关页面
  const isAuthPage = authPaths.some((authPath) => pathname.includes(`/${authPath}`));

  // 如果是认证页面，不显示Header
  if (isAuthPage) {
    return null;
  }

  // 否则显示Header
  return <Header />;
}
