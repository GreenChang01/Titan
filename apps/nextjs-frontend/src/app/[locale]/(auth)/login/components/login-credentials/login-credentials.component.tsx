'use client';

import {type JSX} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm, type SubmitHandler} from 'react-hook-form';
import {useLocale, useTranslations} from 'next-intl';
import {type LoginCredentialsFormFields} from './types/login-credentials-form-fields.type.ts';
import {type LoginCredentialsProps} from './types/login-credentials-props.type.ts';
import {loginCredentialsSchema} from './types/login-credentials.schema.ts';
import {useAuthApi} from '@/hooks/use-auth-api/use-auth-api.hook.tsx';
import {type ApiError} from '@/utils/api/api-error.ts';
import {Link, useRouter} from '@/i18n/navigation.ts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginCredentials({handleLoginCredentialsSuccess}: LoginCredentialsProps): JSX.Element {
  const {loginCredentials} = useAuthApi();
  const router = useRouter();

  const t = useTranslations('Component-Login-Credentials');

  const {
    register: registerCredentials,
    handleSubmit: handleSubmitCredentials,
    setError: setErrorCredentials,
    reset: resetCredentials,
    formState: {errors: errorsCredentials, isSubmitting: isSubmittingCredentials},
  } = useForm<LoginCredentialsFormFields>({resolver: zodResolver(loginCredentialsSchema)});

  const locale = useLocale();

  const onSubmitCredentials: SubmitHandler<LoginCredentialsFormFields> = async (data) => {
    await loginCredentials({
      params: {loginCredentialsData: data, language: locale},
      onSuccess() {
        resetCredentials();
        handleLoginCredentialsSuccess();
      },
      onError(error: ApiError) {
        if (error.response.status === 401 || error.response.status === 403) {
          setErrorCredentials('root', {message: t('error-401-403')});
        } else if (error.response.status === 500) {
          setErrorCredentials('root', {message: t('error-500')});
        } else {
          setErrorCredentials('root', {message: t('error-default')});
        }
      },
    });
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>
      
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={handleSubmitCredentials(onSubmitCredentials)}
      >
        <div className="space-y-2">
          <Label htmlFor="email">{t('email-input-label')}</Label>
          <Input
            {...registerCredentials('email')}
            id="email"
            type="email"
            placeholder={t('email-input-label')}
            data-testid="login-email"
          />
          {errorsCredentials.email ? <p className="text-sm text-destructive">{errorsCredentials.email.message}</p> : null}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">{t('password-input-label')}</Label>
          <Input
            {...registerCredentials('password')}
            id="password"
            type="password"
            placeholder={t('password-input-label')}
            data-testid="login-password"
          />
          {errorsCredentials.password ? <p className="text-sm text-destructive">{errorsCredentials.password.message}</p> : null}
        </div>

        <Button
          type="submit"
          disabled={isSubmittingCredentials}
          className="w-full"
          data-testid="login-submit"
        >
          {isSubmittingCredentials ? t('submit-button-loading-label') : t('submit-button-label')}
        </Button>
        
        {errorsCredentials.root ? <p className="text-sm text-destructive text-center">{errorsCredentials.root.message}</p> : null}
      </form>
      
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {t('forgot-password-question')}{' '}
          <Link 
            className="text-primary hover:underline" 
            href="/forgot-password" 
            data-testid="login-forgot-password"
          >
            {t('forgot-password-link-label')}
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">
          {t('register-question')}{' '}
          <Link className="text-primary hover:underline" href="/register">
            {t('register-link-label')}
          </Link>
        </p>
      </div>
    </div>
  );
}
