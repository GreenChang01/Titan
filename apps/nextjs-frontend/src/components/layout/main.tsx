import React from 'react';
import {cn} from '@/lib/utils';

type MainProps = {
  readonly fixed?: boolean;
  readonly ref?: React.Ref<HTMLElement>;
} & React.HTMLAttributes<HTMLElement>

export function Main({fixed, className, ...props}: MainProps) {
  return (
    <main
      className={cn(
        'peer-[.header-fixed]/header:mt-16',
        'px-4 py-6',
        fixed && 'fixed-main flex grow flex-col overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

Main.displayName = 'Main';
