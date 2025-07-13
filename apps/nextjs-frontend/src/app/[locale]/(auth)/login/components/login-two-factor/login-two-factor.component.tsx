'use client';

import {type JSX} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm, type SubmitHandler} from 'react-hook-form';
import {useTranslations} from 'next-intl';
import {type LoginTwoFactorFormFields} from './types/login-two-factor-form-fields.type.ts';
import {loginTwoFactorSchema} from './types/login-two-factor.schema.ts';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook.tsx';
import {useToast} from '@/hooks/use-toast/use-toast.hook.tsx';
import {type ApiError} from '@/utils/api/api-error.ts';
import {useRouter} from '@/i18n/navigation.ts';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

export function LoginTwoFactor(): JSX.Element {
	const {showToast} = useToast();

	const t = useTranslations('Component-Login-2FA');

	const router = useRouter();
	const {loginTwoFactor} = useAuthApi();
	const {
		register: register2fa,
		handleSubmit: handleSubmit2fa,
		setError: setError2fa,
		reset: reset2fa,
		formState: {errors: errors2fa, isSubmitting: isSubmitting2fa},
	} = useForm<LoginTwoFactorFormFields>({resolver: zodResolver(loginTwoFactorSchema)});

	const onSubmit2fa: SubmitHandler<LoginTwoFactorFormFields> = async (data) => {
		await loginTwoFactor({
			params: {loginTwoFactorData: data},
			onSuccess() {
				reset2fa();
				showToast({
					severity: 'success',
					summary: t('login-success-toast-summary'),
				});
				router.push('/dashboard');
			},
			onError(error: ApiError) {
				if (error.response.status === 401 || error.response.status === 403) {
					setError2fa('root', {message: t('error-401-403')});
				} else if (error.response.status === 500) {
					setError2fa('root', {message: t('error-500')});
				} else {
					setError2fa('root', {message: t('error-default')});
				}
			},
		});
	};

	return (
		<div className="flex flex-col items-center space-y-6 p-6">
			<div className="text-center space-y-2">
				<h1 className="text-2xl font-bold">{t('title')}</h1>
				<p className="text-muted-foreground">{t('description')}</p>
			</div>

			<form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit2fa(onSubmit2fa)}>
				<div className="space-y-2">
					<Label htmlFor="code">{t('code-input-label')}</Label>
					<Input
						{...register2fa('code')}
						id="code"
						maxLength={6}
						placeholder={t('code-input-label')}
						data-testid="login-2fa"
						className="text-center tracking-widest"
					/>
					{errors2fa.code ? <p className="text-sm text-destructive">{errors2fa.code.message}</p> : null}
				</div>

				<Button type="submit" disabled={isSubmitting2fa} className="w-full" data-testid="login-submit-2fa">
					{isSubmitting2fa ? t('submit-button-loading-label') : t('submit-button-label')}
				</Button>

				{errors2fa.root ? <p className="text-sm text-destructive text-center">{errors2fa.root.message}</p> : null}
			</form>
		</div>
	);
}
