import {type JSX} from 'react';
import type {Metadata} from 'next';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {headers} from 'next/headers';
// eslint-disable-next-line import-x/order
import './globals.css';
import {ReactQueryProvider} from '@/providers/react-query/react-query.provider';
import {ToastProvider} from '@/providers/toast/toast.provider';
import {UserProvider} from '@/providers/user/user.provider';
import {routing} from '@/i18n/routing.ts';
import {ZodErrorProvider} from '@/providers/zod-error/zod-error.provider';
import {AuthenticatedLayout} from '@/components/layout/authenticated-layout';

export const metadata: Metadata = {
  title: 'Next.js Frontend',
  description: 'Frontend powered by Next.js',
};

export default async function Layout({
  children,
  params,
}: {
  readonly children: React.ReactNode;
  readonly params: Promise<{locale: string}>;
}): Promise<JSX.Element> {
  // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Get the current pathname to determine if this is an auth page
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/auth');

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body className="min-h-screen bg-background text-foreground" suppressHydrationWarning={true}>
        <NextIntlClientProvider>
          <ZodErrorProvider>
            <ToastProvider>
              <UserProvider>
                <ReactQueryProvider>
                  {isAuthPage ? (
                    // Auth pages - simple centered layout
                    <div className="min-h-screen flex items-center justify-center bg-background">
                      {children}
                    </div>
                  ) : (
                    // Dashboard pages - use shadcn-admin layout
                    <AuthenticatedLayout>
                      {children}
                    </AuthenticatedLayout>
                  )}
                </ReactQueryProvider>
              </UserProvider>
            </ToastProvider>
          </ZodErrorProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
