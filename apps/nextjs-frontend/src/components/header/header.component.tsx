'use client';

import {useMemo, useRef, type JSX} from 'react';
import {Button} from 'primereact/button';
import {Menu} from 'primereact/menu';
import {Menubar} from 'primereact/menubar';
import {type MenuItem} from 'primereact/menuitem';
import {useTranslations} from 'next-intl';
import {useUserStore} from '@/store/user/user.store';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook.tsx';
import {Link, useRouter} from '@/i18n/navigation.ts';

export function Header(): JSX.Element {
  const user = useUserStore(s => s.user);

  const t = useTranslations('Component-Header');

  const endMenuRef = useRef<Menu>(null);

  const router = useRouter();

  const {logout} = useAuthApi();

  const items: MenuItem[] = useMemo(
    () => [
      {
        label: t('dashboard', {defaultMessage: '看板'}),
        icon: 'pi pi-home',
        command(): void {
          router.push('/dashboard');
        },
      },
      {
        label: t('projects', {defaultMessage: '项目'}),
        icon: 'pi pi-folder',
        items: [
          {
            label: t('all-projects', {defaultMessage: '所有项目'}),
            icon: 'pi pi-list',
            command(): void {
              router.push('/dashboard');
            },
          },
          {
            label: t('new-project', {defaultMessage: '新建项目'}),
            icon: 'pi pi-plus',
            command(): void {
              // 添加新建项目功能
            },
          },
        ],
      },
      {
        label: t('settings', {defaultMessage: '设置'}),
        icon: 'pi pi-cog',
        command(): void {
          router.push('/settings');
        },
      },
    ],
    [router, t],
  );

  const endMenuItems: MenuItem[] = useMemo(
    () => [
      {
        label: `${t('greeting', {username: user?.username ?? t('user')})}`,
        items: [
          {
            label: t('profile-button-label'),
            icon: 'pi pi-cog',
            command(): void {
              router.push('/profile');
            },
          },
          {
            label: t('logout-button-label'),
            icon: 'pi pi-sign-out',
            async command(): Promise<void> {
              try {
                await logout({
                  onSuccess() {
                    router.push('/login');
                  },
                });
              } catch {
                // Handle logout error
              }
            },
          },
        ],
      },
    ],
    [logout, router, user?.username, t],
  );

  const signedInItem: JSX.Element = (
    <div className='flex gap-2'>
      <Menu ref={endMenuRef} popup model={endMenuItems} id='end_menu' />
      <Button
        outlined
        aria-haspopup
        size='small'
        icon='pi pi-user'
        className='rounded-full border-2 border-slate-300 text-2xl'
        aria-controls='end_menu'
        data-testid='header-user-menu-button'
        onClick={event => {
          if (endMenuRef?.current) {
            endMenuRef.current.toggle(event);
          }
        }}
      />
    </div>
  );

  const notSignedInItem: JSX.Element = (
    <div className='flex gap-2'>
      <Link href='/login'>
        <Button outlined label={t('login-button-label')} size='small' data-testid='header-login-button' />
      </Link>
      <Link href='/register'>
        <Button label={t('register-button-label')} size='small' />
      </Link>
    </div>
  );

  return (
    <header>
      <Menubar model={items} end={user ? signedInItem : notSignedInItem} />
    </header>
  );
}
