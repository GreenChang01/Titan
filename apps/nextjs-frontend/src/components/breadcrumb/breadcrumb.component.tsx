'use client';

import {type JSX} from 'react';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '@/i18n/navigation.ts';

type BreadcrumbItem = {
  label: string;
  href?: string;
  isActive?: boolean;
};

type BreadcrumbProps = {
  readonly items?: BreadcrumbItem[];
};

export function Breadcrumb({items}: BreadcrumbProps): JSX.Element {
  const t = useTranslations('Component-Breadcrumb');
  const pathname = usePathname();

  // 如果没有提供items，则根据当前路径自动生成
  const breadcrumbItems: BreadcrumbItem[] = items ?? generateBreadcrumbItems(pathname, t);

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        {breadcrumbItems.map((item, index) => (
          <li key={`breadcrumb-${item.href ?? item.label}`} className="flex items-center">
            {index > 0 && <i className="pi pi-chevron-right text-xs text-gray-400 mx-2" aria-hidden="true" />}
            {item.href && !item.isActive ? (
              <Link href={item.href} className="hover:text-blue-600 transition-colors duration-200">
                {item.label}
              </Link>
            ) : (
              <span
                className={item.isActive ? 'text-gray-900 font-medium' : 'text-gray-500'}
                aria-current={item.isActive ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// 根据路径自动生成面包屑项目
function generateBreadcrumbItems(
  pathname: string,
  t: (key: string, options?: {defaultMessage: string}) => string,
): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // 首页
  items.push({
    label: t('home', {defaultMessage: '首页'}),
    href: '/',
  });

  // 根据路径段生成面包屑
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const isLast = i === segments.length - 1;
    const href = `/${segments.slice(0, i + 1).join('/')}`;

    if (!segment) {
      continue;
    }

    let label = segment;

    // 根据路径段翻译标签
    switch (segment) {
      case 'dashboard': {
        label = t('dashboard', {defaultMessage: '看板'});
        break;
      }

      case 'project': {
        label = t('project', {defaultMessage: '项目'});
        break;
      }

      case 'settings': {
        label = t('settings', {defaultMessage: '设置'});
        break;
      }

      case 'profile': {
        label = t('profile', {defaultMessage: '个人资料'});
        break;
      }

      case undefined: {
        label = '';
        break;
      }

      default: {
        // 如果是项目ID（通常是数字或UUID），显示为"项目详情"
        label =
          segments[i - 1] === 'project' && /^[\d\w-]+$/.test(segment)
            ? t('project-details', {defaultMessage: '项目详情'})
            : segment.charAt(0).toUpperCase() + segment.slice(1);
      }
    }

    items.push({
      label,
      href: isLast ? undefined : href,
      isActive: isLast,
    });
  }

  return items;
}
