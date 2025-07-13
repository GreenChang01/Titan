'use client';

import {useState, type JSX} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {type SubmitHandler, useForm} from 'react-hook-form';
import {useLocale, useTranslations} from 'next-intl';
import {type ForgotPasswordFormFields} from './types/forgot-password-form-fields.type.ts';
import {forgotPasswordSchema} from './types/forgot-password.schema.ts';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook.tsx';
import {type ApiError} from '@/utils/api/api-error.ts';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Link} from '@/i18n/navigation.ts';

export default function ForgotPassword(): JSX.Element {
	const t = useTranslations('Page-Forgot-Password');

	const [didSendPasswordReset, setDidSendPasswordReset] = useState(false);

	const {forgotPassword} = useAuthApi();

	const {
		register,
		handleSubmit,
		setError,
		reset,
		formState: {errors, isSubmitting},
	} = useForm<ForgotPasswordFormFields>({resolver: zodResolver(forgotPasswordSchema)});

	const locale = useLocale();

	const onSubmit: SubmitHandler<ForgotPasswordFormFields> = async (data) => {
		await forgotPassword({
			params: {forgotPasswordData: data, language: locale},
			onSuccess() {
				reset();
				setDidSendPasswordReset(true);
			},
			onError(error: ApiError) {
				if (!error.response) {
					setError('root', {message: '网络连接失败，请检查后端服务是否运行'});
					return;
				}

				if (error.response.status === 401 || error.response.status === 403) {
					setError('root', {message: t('error-401-403')});
				} else if (error.response.status === 500) {
					setError('root', {message: t('error-500')});
				} else {
					setError('root', {message: t('error-default')});
				}
			},
		});
	};

	if (didSendPasswordReset) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
				<Card className="w-full max-w-md">
					<CardContent className="p-6">
						<div className="text-center space-y-4">
							<h2 className="text-2xl font-bold text-green-600">{t('success-header')}</h2>
							<p className="text-muted-foreground">{t('success-message')}</p>
							<Link href="/login" className="inline-block">
								<Button>返回登录</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-center text-2xl font-bold">{t('title')}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
						<div className="space-y-2">
							<Label htmlFor="email">{t('email-input-label')}</Label>
							<Input
								id="email"
								type="email"
								placeholder={t('email-input-label')}
								data-testid="forgot-password-email-input"
								{...register('email')}
							/>
							{errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
						</div>

						{errors.root ? <p className="text-sm text-destructive text-center">{errors.root.message}</p> : null}

						<Button
							type="submit"
							className="w-full"
							disabled={isSubmitting}
							data-testid="forgot-password-submit-button"
						>
							{isSubmitting ? t('submit-button-loading-label') : t('submit-button-label')}
						</Button>
					</form>

					<div className="text-center">
						<p className="text-sm text-muted-foreground">
							记起密码了？{' '}
							<Link className="text-primary hover:underline" href="/login">
								返回登录
							</Link>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
