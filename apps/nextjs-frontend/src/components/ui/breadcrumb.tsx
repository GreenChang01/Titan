import * as React from 'react';
import {Slot} from '@radix-ui/react-slot';
import {ChevronRight, MoreHorizontal} from 'lucide-react';
import {cn} from '@/lib/utils';

const Breadcrumb = React.forwardRef<
	HTMLElement,
	React.ComponentPropsWithoutRef<'nav'> & {
		separator?: React.ComponentType<{className?: string}>;
	}
>(({className, children, separator: Separator = ChevronRight, ...props}, ref) => (
	<nav
		ref={ref}
		aria-label="breadcrumb"
		className={cn('flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground', className)}
		{...props}
	>
		<BreadcrumbContext.Provider value={{separator: Separator}}>
			{children}
		</BreadcrumbContext.Provider>
	</nav>
));
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = React.forwardRef<
	HTMLOListElement,
	React.ComponentPropsWithoutRef<'ol'>
>(({className, ...props}, ref) => (
	<ol
		ref={ref}
		className={cn('flex flex-wrap items-center gap-1.5', className)}
		{...props}
	/>
));
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = React.forwardRef<
	HTMLLIElement,
	React.ComponentPropsWithoutRef<'li'>
>(({className, ...props}, ref) => (
	<li
		ref={ref}
		className={cn('flex items-center gap-1.5', className)}
		{...props}
	/>
));
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = React.forwardRef<
	HTMLAnchorElement,
	React.ComponentPropsWithoutRef<'a'> & {
		asChild?: boolean;
	}
>(({asChild, className, ...props}, ref) => {
	const Comp = asChild ? Slot : 'a';

	return (
		<Comp
			ref={ref}
			className={cn('transition-colors hover:text-foreground', className)}
			{...props}
		/>
	);
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = React.forwardRef<
	HTMLSpanElement,
	React.ComponentPropsWithoutRef<'span'>
>(({className, ...props}, ref) => (
	<span
		ref={ref}
		role="link"
		aria-disabled="true"
		aria-current="page"
		className={cn('font-normal text-foreground', className)}
		{...props}
	/>
));
BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator = React.forwardRef<
	HTMLLIElement,
	React.ComponentPropsWithoutRef<'li'> & {
		children?: React.ReactNode;
	}
>(({children, className, ...props}, ref) => {
	const {separator: Separator} = useBreadcrumbContext();

	return (
		<li
			ref={ref}
			role="presentation"
			aria-hidden="true"
			className={cn('[&>svg]:size-3.5', className)}
			{...props}
		>
			{children ?? <Separator />}
		</li>
	);
});
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis = React.forwardRef<
	HTMLSpanElement,
	React.ComponentPropsWithoutRef<'span'>
>(({className, ...props}, ref) => (
	<span
		ref={ref}
		role="presentation"
		aria-hidden="true"
		className={cn('flex h-9 w-9 items-center justify-center', className)}
		{...props}
	>
		<MoreHorizontal className="h-4 w-4" />
		<span className="sr-only">More</span>
	</span>
));
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

// Context
const BreadcrumbContext = React.createContext<{
	separator: React.ComponentType<{className?: string}>;
}>({
	separator: ChevronRight,
});

const useBreadcrumbContext = () => {
	const context = React.useContext(BreadcrumbContext);
	if (!context) {
		throw new Error('useBreadcrumbContext must be used within a BreadcrumbProvider');
	}
	return context;
};

export {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
	BreadcrumbEllipsis,
};