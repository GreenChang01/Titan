'use client';

import {useState, type JSX} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {type SubmitHandler, useForm} from 'react-hook-form';
import {useLocale, useTranslations} from 'next-intl';
import {type RegisterFormFields} from './types/register-form-fields.type.ts';
import {registerSchema} from './types/register.schema.ts';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook.tsx';
import {type ApiError} from '@/utils/api/api-error.ts';
import {Link} from '@/i18n/navigation.ts';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

export default function Register(): JSX.Element {
	const t = useTranslations('Page-Register');

	const [didRegisterSuccessfully, setDidRegisterSuccessfully] = useState(false);

	const {register: registerFunction} = useAuthApi();

	const {
		register,
		handleSubmit,
		setError,
		reset,
		formState: {errors, isSubmitting},
	} = useForm<RegisterFormFields>({resolver: zodResolver(registerSchema)});

	const locale = useLocale();

	const onSubmit: SubmitHandler<RegisterFormFields> = async (data) => {
		await registerFunction({
			params: {createUserData: data, language: locale},
			onSuccess() {
				reset();
				setDidRegisterSuccessfully(true);
			},
			async onError(error: ApiError) {
				// 网络错误时 error.response 可能为 undefined
				if (!error.response) {
					setError('root', {message: '网络连接失败，请检查后端服务是否运行'});
					return;
				}

				switch (error.response.status) {
					case 400: {
						const errorResponse = (await error.response.json()) as {message?: string[]};
						const message: string = errorResponse?.message
							? errorResponse.message.map((message_) => message_.charAt(0).toUpperCase() + message_.slice(1)).join(', ')
							: t('error-default');
						setError('root', {message});

						break;
					}

					case 409: {
						setError('root', {message: t('error-409')});

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

	if (didRegisterSuccessfully) {
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
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">{t('email-input-label')}</Label>
							<Input
								id="email"
								type="email"
								placeholder={t('email-input-label')}
								data-testid="register-email-input"
								{...register('email')}
							/>
							<p className="text-xs text-muted-foreground">{t('email-input-info')}</p>
							{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="username">{t('username-input-label')}</Label>
							<Input
								id="username"
								type="text"
								placeholder={t('username-input-label')}
								data-testid="register-username-input"
								{...register('username')}
							/>
							<p className="text-xs text-muted-foreground">{t('username-input-info')}</p>
							{errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">{t('password-input-label')}</Label>
							<Input
								id="password"
								type="password"
								placeholder={t('password-input-label')}
								data-testid="register-password-input"
								{...register('password')}
							/>
							{errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
						</div>

						{errors.root && <p className="text-sm text-destructive text-center">{errors.root.message}</p>}

						<Button type="submit" className="w-full" disabled={isSubmitting} data-testid="register-submit-button">
							{isSubmitting ? t('submit-button-loading-label') : t('submit-button-label')}
						</Button>
					</form>

					<div className="text-center space-y-2">
						<p className="text-sm text-muted-foreground">
							{t('login-question')}{' '}
							<Link className="text-primary hover:underline" href="/login">
								{t('login-link')}
							</Link>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
