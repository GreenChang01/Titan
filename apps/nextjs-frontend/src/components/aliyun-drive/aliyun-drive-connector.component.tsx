'use client';

import {useState, type JSX} from 'react';
import {Button} from 'primereact/button';
import {InputText} from 'primereact/inputtext';
import {Card} from 'primereact/card';
import {Message} from 'primereact/message';
import {ProgressSpinner} from 'primereact/progressspinner';
import {useTranslations} from 'next-intl';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';

const configSchema = z.object({
  refreshToken: z.string().min(1, 'refresh_token_required'),
});

type ConfigFormData = z.infer<typeof configSchema>;

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

type AliyunDriveConnectorProps = {
  readonly initialStatus?: ConnectionStatus;
  readonly onConfigUpdate?: (config: ConfigFormData) => void;
  readonly onTestConnection?: (config: ConfigFormData) => Promise<boolean>;
};

export function AliyunDriveConnector({
  initialStatus = 'disconnected',
  onConfigUpdate,
  onTestConnection,
}: AliyunDriveConnectorProps): JSX.Element {
  const t = useTranslations('Component-AliyunDriveConnector');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(initialStatus);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
    getValues,
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      refreshToken: '',
    },
  });

  const onSubmit = async (data: ConfigFormData): Promise<void> => {
    try {
      setConnectionStatus('connecting');
      onConfigUpdate?.(data);

      // 模拟保存配置
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1000);
      });

      setConnectionStatus('connected');
    } catch {
      // Handle error silently or use proper error handling
      setConnectionStatus('error');
    }
  };

  const handleTestConnection = async (): Promise<void> => {
    const data = getValues();
    if (!data.refreshToken) {
      return;
    }

    setIsTestingConnection(true);
    try {
      const isSuccess = (await onTestConnection?.(data)) ?? true;
      setConnectionStatus(isSuccess ? 'connected' : 'error');
    } catch {
      // Handle error silently or use proper error handling
      setConnectionStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getStatusMessage = (): JSX.Element | undefined => {
    switch (connectionStatus) {
      case 'connected': {
        return <Message severity="success" text={t('connection-success', {defaultMessage: '阿里云盘连接成功'})} />;
      }

      case 'connecting': {
        return <Message severity="info" text={t('connection-connecting', {defaultMessage: '正在连接阿里云盘...'})} />;
      }

      case 'error': {
        return (
          <Message severity="error" text={t('connection-error', {defaultMessage: '阿里云盘连接失败，请检查配置'})} />
        );
      }

      case 'disconnected': {
        return null;
      }
    }
  };

  const getStatusIcon = (): string => {
    switch (connectionStatus) {
      case 'connected': {
        return 'pi pi-check-circle text-green-500';
      }

      case 'connecting': {
        return 'pi pi-spin pi-spinner text-blue-500';
      }

      case 'error': {
        return 'pi pi-times-circle text-red-500';
      }

      case 'disconnected': {
        return 'pi pi-cloud text-gray-400';
      }
    }
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <i className={getStatusIcon()} />
          <span>{t('title', {defaultMessage: '阿里云盘配置'})}</span>
        </div>
      }
      className="mb-4"
    >
      <div className="space-y-4">
        {getStatusMessage()}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label htmlFor="refreshToken" className="block text-sm font-medium text-gray-700 mb-1">
              {t('refresh-token-label', {defaultMessage: 'Refresh Token'})}
            </label>
            <InputText
              id="refreshToken"
              {...register('refreshToken')}
              className={`w-full ${errors.refreshToken ? 'p-invalid' : ''}`}
              placeholder={t('refresh-token-placeholder', {defaultMessage: '请输入阿里云盘 Refresh Token'})}
              disabled={isSubmitting || connectionStatus === 'connecting'}
            />
            {errors.refreshToken ? (
              <small className="text-red-500 mt-1 block">
                {t('refresh-token-required', {defaultMessage: 'Refresh Token 是必填项'})}
              </small>
            ) : null}
            <small className="text-gray-500 mt-1 block">
              {t('refresh-token-help', {defaultMessage: '可从阿里云盘开发者工具中获取 Refresh Token'})}
            </small>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              label={t('test-connection', {defaultMessage: '测试连接'})}
              icon="pi pi-wifi"
              severity="secondary"
              disabled={isSubmitting || connectionStatus === 'connecting' || isTestingConnection}
              onClick={handleTestConnection}
            />
            <Button
              type="submit"
              label={t('save-config', {defaultMessage: '保存配置'})}
              icon={isSubmitting || connectionStatus === 'connecting' ? 'pi pi-spinner pi-spin' : 'pi pi-save'}
              disabled={isSubmitting || connectionStatus === 'connecting'}
            />
          </div>
        </form>

        {isTestingConnection ? (
          <div className="flex items-center gap-2 text-blue-600">
            <ProgressSpinner style={{width: '20px', height: '20px'}} strokeWidth="4" />
            <span className="text-sm">{t('testing-connection', {defaultMessage: '正在测试连接...'})}</span>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
