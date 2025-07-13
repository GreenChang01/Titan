import {Suspense, type JSX} from 'react';
import {Card, CardContent} from '@/components/ui/card';

export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>): JSX.Element {
	return (
		<div className='flex min-h-screen items-center justify-center bg-muted/50 p-4'>
			<Card className='w-full max-w-md'>
				<CardContent className='p-0'>
					<Suspense
						fallback={
							<div className='flex items-center justify-center p-8'>
								<div className='text-muted-foreground'>Loading...</div>
							</div>
						}
					>
						{children}
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
}
