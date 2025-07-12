'use client';

import {useEffect,type JSX} from 'react';
import {useRouter} from '@/i18n/navigation';

export default function Home(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    // 重定向到 dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">正在跳转...</p>
      </div>
    </div>
  );
}
