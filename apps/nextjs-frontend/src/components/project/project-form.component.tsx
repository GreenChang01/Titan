'use client';

import {type JSX} from 'react';
import {Dialog} from 'primereact/dialog';
import {Button} from 'primereact/button';
import {InputText} from 'primereact/inputtext';
import {InputTextarea} from 'primereact/inputtextarea';
import {Dropdown} from 'primereact/dropdown';
import {useTranslations} from 'next-intl';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';

const projectSchema = z.object({
	name: z.string().min(1, 'project_name_required').max(100, 'project_name_too_long'),
	description: z.string().optional(),
	status: z.enum(['active', 'draft', 'archived']),
	priority: z.enum(['low', 'medium', 'high']),
});

type ProjectFormData = z.infer<typeof projectSchema>;

type Project = {
	id: string;
	name: string;
	description?: string;
	status: 'active' | 'draft' | 'archived';
	priority: 'low' | 'medium' | 'high';
	materialCount: number;
	createdAt: string;
	updatedAt: string;
	owner: {
		id: string;
		name: string;
	};
};

type ProjectFormProps = {
	readonly isVisible: boolean;
	readonly onHide: () => void;
	readonly onSubmit: (data: ProjectFormData) => Promise<void>;
	readonly project?: Project;
	readonly mode?: 'create' | 'edit';
};

export function ProjectForm({isVisible, onHide, onSubmit, project, mode = 'create'}: ProjectFormProps): JSX.Element {
	const t = useTranslations('Component-ProjectForm');

	const {
		control,
		handleSubmit,
		formState: {errors, isSubmitting},
		reset,
	} = useForm<ProjectFormData>({
		resolver: zodResolver(projectSchema),
		defaultValues: {
			name: project?.name ?? '',
			description: project?.description ?? '',
			status: project?.status ?? 'draft',
			priority: project?.priority ?? 'medium',
		},
	});

	const statusOptions = [
		{
			label: t('status-draft', {defaultMessage: '草稿'}),
			value: 'draft',
		},
		{
			label: t('status-active', {defaultMessage: '进行中'}),
			value: 'active',
		},
		{
			label: t('status-archived', {defaultMessage: '已归档'}),
			value: 'archived',
		},
	];

	const priorityOptions = [
		{
			label: t('priority-low', {defaultMessage: '低'}),
			value: 'low',
		},
		{
			label: t('priority-medium', {defaultMessage: '中'}),
			value: 'medium',
		},
		{
			label: t('priority-high', {defaultMessage: '高'}),
			value: 'high',
		},
	];

	const handleFormSubmit = async (data: ProjectFormData): Promise<void> => {
		try {
			await onSubmit(data);
			reset();
			onHide();
		} catch {
			// Handle error silently or use proper error handling
		}
	};

	const handleCancel = (): void => {
		reset();
		onHide();
	};

	const getErrorMessage = (fieldName: keyof ProjectFormData): string => {
		const error = errors[fieldName];
		if (!error) {
			return '';
		}

		const errorMessage = error.message ?? '';
		switch (errorMessage) {
			case 'project_name_required': {
				return t('project-name-required', {defaultMessage: '项目名称是必填项'});
			}

			case 'project_name_too_long': {
				return t('project-name-too-long', {defaultMessage: '项目名称不能超过100个字符'});
			}

			default: {
				return error.message ?? '';
			}
		}
	};

	const dialogFooter = (
		<div className='flex justify-end gap-2'>
			<Button
				label={t('cancel', {defaultMessage: '取消'})}
				severity='secondary'
				disabled={isSubmitting}
				onClick={handleCancel}
			/>
			<Button
				label={
					mode === 'create'
						? t('create-project', {defaultMessage: '创建项目'})
						: t('update-project', {defaultMessage: '更新项目'})
				}
				icon={isSubmitting ? 'pi pi-spinner pi-spin' : 'pi pi-check'}
				disabled={isSubmitting}
				onClick={handleSubmit(handleFormSubmit)}
			/>
		</div>
	);

	return (
		<Dialog
			modal
			header={
				mode === 'create'
					? t('create-project-title', {defaultMessage: '创建新项目'})
					: t('edit-project-title', {defaultMessage: '编辑项目'})
			}
			visible={isVisible}
			footer={dialogFooter}
			style={{width: '600px'}}
			className='p-fluid'
			onHide={handleCancel}
		>
			<form className='space-y-6' onSubmit={handleSubmit(handleFormSubmit)}>
				{/* 项目名称 */}
				<div className='field'>
					<label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-2'>
						{t('project-name', {defaultMessage: '项目名称'})}
						<span className='text-red-500 ml-1'>*</span>
					</label>
					<Controller
						name='name'
						control={control}
						render={({field}) => (
							<InputText
								{...field}
								autoFocus
								id='name'
								placeholder={t('project-name-placeholder', {defaultMessage: '请输入项目名称'})}
								className={errors.name ? 'p-invalid' : ''}
							/>
						)}
					/>
					{errors.name ? <small className='text-red-500 mt-1 block'>{getErrorMessage('name')}</small> : null}
				</div>

				{/* 项目描述 */}
				<div className='field'>
					<label htmlFor='description' className='block text-sm font-medium text-gray-700 mb-2'>
						{t('project-description', {defaultMessage: '项目描述'})}
					</label>
					<Controller
						name='description'
						control={control}
						render={({field}) => (
							<InputTextarea
								{...field}
								id='description'
								placeholder={t('project-description-placeholder', {defaultMessage: '请输入项目描述（可选）'})}
								rows={4}
								className={errors.description ? 'p-invalid' : ''}
							/>
						)}
					/>
					{errors.description ? (
						<small className='text-red-500 mt-1 block'>{getErrorMessage('description')}</small>
					) : null}
				</div>

				{/* 项目状态 */}
				<div className='field'>
					<label htmlFor='status' className='block text-sm font-medium text-gray-700 mb-2'>
						{t('project-status', {defaultMessage: '项目状态'})}
					</label>
					<Controller
						name='status'
						control={control}
						render={({field}) => (
							<Dropdown
								{...field}
								id='status'
								options={statusOptions}
								optionLabel='label'
								optionValue='value'
								placeholder={t('select-status', {defaultMessage: '选择状态'})}
								className={errors.status ? 'p-invalid' : ''}
							/>
						)}
					/>
					{errors.status ? <small className='text-red-500 mt-1 block'>{getErrorMessage('status')}</small> : null}
				</div>

				{/* 项目优先级 */}
				<div className='field'>
					<label htmlFor='priority' className='block text-sm font-medium text-gray-700 mb-2'>
						{t('project-priority', {defaultMessage: '项目优先级'})}
					</label>
					<Controller
						name='priority'
						control={control}
						render={({field}) => (
							<Dropdown
								{...field}
								id='priority'
								options={priorityOptions}
								optionLabel='label'
								optionValue='value'
								placeholder={t('select-priority', {defaultMessage: '选择优先级'})}
								className={errors.priority ? 'p-invalid' : ''}
							/>
						)}
					/>
					{errors.priority ? <small className='text-red-500 mt-1 block'>{getErrorMessage('priority')}</small> : null}
				</div>

				{/* 表单说明 */}
				<div className='bg-blue-50 border border-blue-200 rounded-md p-4'>
					<div className='flex items-start gap-2'>
						<i className='pi pi-info-circle text-blue-600 mt-0.5'/>
						<div className='text-sm text-blue-800'>
							<p className='font-medium mb-1'>{t('form-tips-title', {defaultMessage: '创建提示'})}</p>
							<ul className='space-y-1 text-sm'>
								<li>• {t('tip-name', {defaultMessage: '项目名称将作为主要标识符显示'})}</li>
								<li>• {t('tip-description', {defaultMessage: '详细描述有助于团队成员理解项目目标'})}</li>
								<li>• {t('tip-status', {defaultMessage: '草稿状态的项目可以稍后激活'})}</li>
								<li>• {t('tip-materials', {defaultMessage: '创建后可以添加阿里云盘中的素材'})}</li>
							</ul>
						</div>
					</div>
				</div>

				{/* 如果是编辑模式，显示项目统计信息 */}
				{mode === 'edit' && project ? (
					<div className='bg-gray-50 border border-gray-200 rounded-md p-4'>
						<h4 className='font-medium text-gray-900 mb-3'>{t('project-statistics', {defaultMessage: '项目统计'})}</h4>
						<div className='grid grid-cols-2 gap-4 text-sm'>
							<div>
								<span className='text-gray-500'>{t('material-count', {defaultMessage: '素材数量'})}:</span>
								<span className='ml-2 font-medium'>{project.materialCount}</span>
							</div>
							<div>
								<span className='text-gray-500'>{t('created-at', {defaultMessage: '创建时间'})}:</span>
								<span className='ml-2 font-medium'>{project.createdAt}</span>
							</div>
							<div>
								<span className='text-gray-500'>{t('updated-at', {defaultMessage: '更新时间'})}:</span>
								<span className='ml-2 font-medium'>{project.updatedAt}</span>
							</div>
							<div>
								<span className='text-gray-500'>{t('owner', {defaultMessage: '负责人'})}:</span>
								<span className='ml-2 font-medium'>{project.owner.name}</span>
							</div>
						</div>
					</div>
				) : null}
			</form>
		</Dialog>
	);
}
