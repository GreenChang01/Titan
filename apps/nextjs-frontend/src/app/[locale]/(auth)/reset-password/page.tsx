'use client';

import {useState, type JSX} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {useSearchParams} from 'next/navigation';
import {type SubmitHandler, useForm} from 'react-hook-form';
import {useLocale, useTranslations} from 'next-intl';
import {type ResetPasswordFormFields} from './types/reset-password-form-fields.type.ts';
import {resetPasswordSchema} from './types/reset-password.schema.ts';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook.tsx';
import {type ApiError} from '@/utils/api/api-error.ts';
import {Link} from '@/i18n/navigation.ts';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
	Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';

export default function ResetPassword(): JSX.Element {
	const t = useTranslations('Page-Reset-Password');

	const [didResetPasswordSuccessfully, setDidResetPasswordSuccessfully] = useState(false);

	const searchParameters = useSearchParams();

	const {
		register,
		handleSubmit,
		setError,
		reset,
		formState: {errors, isSubmitting},
	} = useForm<ResetPasswordFormFields>({resolver: zodResolver(resetPasswordSchema)});

	const {resetPassword} = useAuthApi();

	const locale = useLocale();

	const onSubmit: SubmitHandler<ResetPasswordFormFields> = async data => {
		const token = searchParameters.get('token');

		if (!token) {
			setError('root', {message: t('error-no-token')});
			return;
		}

		await resetPassword({
			params: {
				resetPasswordData: {
					token,
					password: data.password,
				},
				language: locale,
			},
			onSuccess() {
				reset();
				setDidResetPasswordSuccessfully(true);
			},
			onError(error: ApiError) {
				if (!error.response) {
					setError('root', {message: '网络连接失败，请检查后端服务是否运行'});
					return;
				}

				switch (error.response.status) {
					case 410: {
						setError('root', {message: t('error-410')});

						break;
					}

					case 404: {
						setError('root', {message: t('error-404')});

						break;
					}

					case 500: {
						setError('root', {message: t('error-500')});

						break;
					}

					default: {
						setError('root', {message: t('error-default')});
					}
				}
			},
		});
	};

	if (didResetPasswordSuccessfully) {
		return (
			<div className='flex min-h-screen items-center justify-center bg-muted/50 p-4'>
				<Card className='w-full max-w-md'>
					<CardContent className='p-6'>
						<div className='text-center space-y-4'>
							<h2 className='text-2xl font-bold text-green-600'>{t('success-header')}</h2>
							<p className='text-muted-foreground'>{t('success-message')}</p>
							<Link href='/login' className='inline-block'>
								<Button>{t('success-login-link')}</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-muted/50 p-4'>
			<Card className='w-full max-w-md'>
				<CardHeader>
					<CardTitle className='text-center text-2xl font-bold'>{t('title')}</CardTitle>
				</CardHeader>
				<CardContent className='space-y-6'>
					<form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
						<div className='space-y-2'>
							<Label htmlFor='password'>{t('password-input-label')}</Label>
							<Input
								id='password'
								type='password'
								placeholder={t('password-input-label')}
								data-testid='reset-password-password-input'
								{...register('password')}
							/>
							{errors.password ? <p className='text-sm text-destructive'>{errors.password.message}</p> : null}
						</div>

						{errors.root ? <p className='text-sm text-destructive text-center'>{errors.root.message}</p> : null}

						<Button type='submit' className='w-full' disabled={isSubmitting} data-testid='reset-password-submit-button'>
							{isSubmitting ? t('submit-button-loading-label') : t('submit-button-label')}
						</Button>
					</form>

					<div className='text-center'>
						<p className='text-sm text-muted-foreground'>
							记起密码了？{' '}
							<Link className='text-primary hover:underline' href='/login'>
								返回登录
							</Link>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
