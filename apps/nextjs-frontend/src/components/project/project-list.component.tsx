'use client';

import {useState, type JSX} from 'react';
import {DataView} from 'primereact/dataview';
import {Card} from 'primereact/card';
import {Button} from 'primereact/button';
import {InputText} from 'primereact/inputtext';
import {Dropdown} from 'primereact/dropdown';
import {Tag} from 'primereact/tag';
import {ProgressSpinner} from 'primereact/progressspinner';
import {useTranslations} from 'next-intl';
import {useRouter} from '@/i18n/navigation.ts';

type Project = {
  id: string;
  name: string;
  description?: string;
  materialCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'draft';
  owner: {
    id: string;
    name: string;
  };
};

const defaultProjects: Project[] = [];

type ProjectListProps = {
  readonly projects?: Project[];
  readonly isLoading?: boolean;
  readonly onCreateProject?: () => void;
  readonly onProjectClick?: (project: Project) => void;
  readonly onDeleteProject?: (projectId: string) => void;
};

type SortOption = {
  label: string;
  value: string;
};

export function ProjectList({
  projects = defaultProjects,
  isLoading = false,
  onCreateProject,
  onProjectClick,
  onDeleteProject,
}: ProjectListProps): JSX.Element {
  const t = useTranslations('Component-ProjectList');
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('updatedAt');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  // 模拟项目数据
  const mockProjects: Project[] = [
    {
      id: '1',
      name: '品牌设计项目',
      description: '公司品牌视觉设计和VI系统制作',
      materialCount: 25,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      status: 'active',
      owner: {id: '1', name: '张三'},
    },
    {
      id: '2',
      name: '产品宣传片制作',
      description: '新产品上市宣传视频制作和后期处理',
      materialCount: 12,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      status: 'active',
      owner: {id: '2', name: '李四'},
    },
    {
      id: '3',
      name: '官网改版',
      description: '企业官网界面重新设计和开发',
      materialCount: 8,
      createdAt: '2024-01-05',
      updatedAt: '2024-01-15',
      status: 'draft',
      owner: {id: '1', name: '张三'},
    },
  ];

  const displayProjects = projects.length > 0 ? projects : mockProjects;

  const sortOptions: SortOption[] = [
    {label: t('sort-by-updated', {defaultMessage: '按更新时间'}), value: 'updatedAt'},
    {label: t('sort-by-created', {defaultMessage: '按创建时间'}), value: 'createdAt'},
    {label: t('sort-by-name', {defaultMessage: '按名称'}), value: 'name'},
    {label: t('sort-by-materials', {defaultMessage: '按素材数量'}), value: 'materialCount'},
  ];

  const filteredAndSortedProjects = displayProjects
    .filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
			|| project.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortField) {
        case 'name': {
          return a.name.localeCompare(b.name);
        }

        case 'materialCount': {
          return b.materialCount - a.materialCount;
        }

        case 'createdAt': {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        case 'updatedAt': {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }

        default: {
          return 0;
        }
      }
    });

  const handleProjectClick = (project: Project): void => {
    onProjectClick?.(project);
    router.push(`/project/${project.id}`);
  };

  const getStatusSeverity = (status: Project['status']): 'success' | 'warning' | 'info' => {
    switch (status) {
      case 'active': {
        return 'success';
      }

      case 'draft': {
        return 'warning';
      }

      case 'archived': {
        return 'info';
      }
    }
  };

  const getStatusLabel = (status: Project['status']): string => {
    switch (status) {
      case 'active': {
        return t('status-active', {defaultMessage: '进行中'});
      }

      case 'draft': {
        return t('status-draft', {defaultMessage: '草稿'});
      }

      case 'archived': {
        return t('status-archived', {defaultMessage: '已归档'});
      }
    }
  };

  const projectCardTemplate = (project: Project): JSX.Element => {
    if (layout === 'list') {
      return (
        <div className='border rounded-lg p-4 hover:shadow-md transition-shadow duration-200'>
          <div className='flex items-center justify-between'>
            <div className='flex-1'>
              <div className='flex items-center gap-3 mb-2'>
                <h3
                  className='text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600'
                  onClick={() => {
                    handleProjectClick(project);
                  }}
                >
                  {project.name}
                </h3>
                <Tag
                  value={getStatusLabel(project.status)}
                  severity={getStatusSeverity(project.status)}
                  className='text-xs'
                />
              </div>
              <p className='text-gray-600 text-sm mb-2'>{project.description}</p>
              <div className='flex items-center gap-4 text-xs text-gray-500'>
                <span>
                  <i className='pi pi-file mr-1' />
                  {t('material-count', {
                    count: project.materialCount,
                    defaultMessage: `${project.materialCount} 个素材`,
                  })}
                </span>
                <span>
                  <i className='pi pi-user mr-1' />
                  {project.owner.name}
                </span>
                <span>
                  <i className='pi pi-calendar mr-1' />
                  {t('updated-at', {date: project.updatedAt, defaultMessage: `更新于 ${project.updatedAt}`})}
                </span>
              </div>
            </div>
            <div className='flex gap-2 ml-4'>
              <Button
                icon='pi pi-eye'
                size='small'
                severity='info'
                tooltip={t('view-project', {defaultMessage: '查看项目'})}
                onClick={() => {
                  handleProjectClick(project);
                }}
              />
              <Button
                icon='pi pi-trash'
                size='small'
                severity='danger'
                tooltip={t('delete-project', {defaultMessage: '删除项目'})}
                onClick={() => onDeleteProject?.(project.id)}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <Card className='h-full hover:shadow-lg transition-shadow duration-200'>
        <div className='space-y-4'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <h3
                className='text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 mb-1'
                onClick={() => {
                  handleProjectClick(project);
                }}
              >
                {project.name}
              </h3>
              <Tag
                value={getStatusLabel(project.status)}
                severity={getStatusSeverity(project.status)}
                className='text-xs'
              />
            </div>
            <div className='flex gap-1'>
              <Button
                icon='pi pi-eye'
                size='small'
                severity='info'
                tooltip={t('view-project', {defaultMessage: '查看项目'})}
                onClick={() => {
                  handleProjectClick(project);
                }}
              />
              <Button
                icon='pi pi-trash'
                size='small'
                severity='danger'
                tooltip={t('delete-project', {defaultMessage: '删除项目'})}
                onClick={() => onDeleteProject?.(project.id)}
              />
            </div>
          </div>

          <p className='text-gray-600 text-sm line-clamp-2'>
            {project.description ?? t('no-description', {defaultMessage: '暂无描述'})}
          </p>

          <div className='space-y-2'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-gray-500'>
                <i className='pi pi-file mr-1' />
                {t('materials', {defaultMessage: '素材'})}
              </span>
              <span className='font-medium'>{project.materialCount}</span>
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-gray-500'>
                <i className='pi pi-user mr-1' />
                {t('owner', {defaultMessage: '负责人'})}
              </span>
              <span>{project.owner.name}</span>
            </div>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-gray-500'>
                <i className='pi pi-calendar mr-1' />
                {t('updated', {defaultMessage: '更新'})}
              </span>
              <span>{project.updatedAt}</span>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const listHeader = (): JSX.Element => (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <h2 className='text-xl font-semibold text-gray-900'>{t('title', {defaultMessage: '项目列表'})}</h2>
        <Button label={t('create-project', {defaultMessage: '创建项目'})} icon='pi pi-plus' onClick={onCreateProject} />
      </div>

      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='flex-1'>
          <span className='p-input-icon-left w-full'>
            <i className='pi pi-search' />
            <InputText
              value={searchTerm}
              placeholder={t('search-projects', {defaultMessage: '搜索项目...'})}
              className='w-full'
              onChange={event => {
                setSearchTerm(event.target.value);
              }}
            />
          </span>
        </div>

        <div className='flex gap-2'>
          <Dropdown
            value={sortField}
            options={sortOptions}
            optionLabel='label'
            optionValue='value'
            placeholder={t('sort-by', {defaultMessage: '排序方式'})}
            className='w-48'
            onChange={event => {
              setSortField(event.value as string);
            }}
          />

          <div className='flex border rounded-md overflow-hidden'>
            <Button
              icon='pi pi-th-large'
              size='small'
              severity={layout === 'grid' ? 'info' : 'secondary'}
              tooltip={t('grid-view', {defaultMessage: '网格视图'})}
              onClick={() => {
                setLayout('grid');
              }}
            />
            <Button
              icon='pi pi-list'
              size='small'
              severity={layout === 'list' ? 'info' : 'secondary'}
              tooltip={t('list-view', {defaultMessage: '列表视图'})}
              onClick={() => {
                setLayout('list');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <ProgressSpinner />
        <span className='ml-2'>{t('loading', {defaultMessage: '加载中...'})}</span>
      </div>
    );
  }

  if (filteredAndSortedProjects.length === 0) {
    return (
      <div className='space-y-4'>
        {listHeader()}
        <div className='text-center py-12'>
          <i className='pi pi-folder-open text-6xl text-gray-400 mb-4' />
          <h3 className='text-xl font-semibold text-gray-600 mb-2'>
            {searchTerm
              ? t('no-search-results', {defaultMessage: '未找到匹配的项目'})
              : t('no-projects', {defaultMessage: '暂无项目'})}
          </h3>
          <p className='text-gray-500 mb-6'>
            {searchTerm
              ? t('try-different-search', {defaultMessage: '尝试使用不同的搜索词'})
              : t('create-first-project', {defaultMessage: '创建您的第一个项目来开始管理素材'})}
          </p>
          {!searchTerm && (
            <Button
              label={t('create-project', {defaultMessage: '创建项目'})}
              icon='pi pi-plus'
              onClick={onCreateProject}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {listHeader()}
      <DataView
        paginator
        value={filteredAndSortedProjects}
        itemTemplate={projectCardTemplate}
        layout={layout}
        rows={layout === 'grid' ? 6 : 10}
        emptyMessage={t('no-projects', {defaultMessage: '暂无项目'})}
      />
    </div>
  );
}
