'use client';

import {useState, type JSX} from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Button} from 'primereact/button';
import {InputText} from 'primereact/inputtext';
import {Dropdown} from 'primereact/dropdown';
import {Tag} from 'primereact/tag';
import {ConfirmDialog, confirmDialog} from 'primereact/confirmdialog';
import {Tooltip} from 'primereact/tooltip';
import {useTranslations} from 'next-intl';

type ProjectMaterial = {
  id: string;
  name: string;
  type: string;
  size: number;
  addedAt: string;
  cloudPath: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  status: 'synced' | 'syncing' | 'error';
};

const defaultMaterials: ProjectMaterial[] = [];

type ProjectMaterialsListProps = {
  readonly materials?: ProjectMaterial[];
  readonly isLoading?: boolean;
  readonly onAddMaterials?: () => void;
  readonly onRemoveMaterial?: (materialId: string) => void;
  readonly onDownloadMaterial?: (material: ProjectMaterial) => void;
  readonly onPreviewMaterial?: (material: ProjectMaterial) => void;
  readonly onRefresh?: () => void;
};

type FilterOption = {
  label: string;
  value: string;
};

export function ProjectMaterialsList({
  materials = defaultMaterials,
  isLoading = false,
  onAddMaterials,
  onRemoveMaterial,
  onDownloadMaterial,
  onPreviewMaterial,
  onRefresh,
}: ProjectMaterialsListProps): JSX.Element {
  const t = useTranslations('Component-ProjectMaterialsList');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<ProjectMaterial[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // 模拟素材数据
  const mockMaterials: ProjectMaterial[] = [
    {
      id: '1',
      name: 'brand-logo.png',
      type: 'image',
      size: 1_024_000,
      addedAt: '2024-01-15',
      cloudPath: '/品牌素材/brand-logo.png',
      status: 'synced',
    },
    {
      id: '2',
      name: '产品说明书.pdf',
      type: 'document',
      size: 5_120_000,
      addedAt: '2024-01-14',
      cloudPath: '/文档/产品说明书.pdf',
      status: 'synced',
    },
    {
      id: '3',
      name: '宣传视频.mp4',
      type: 'video',
      size: 102_400_000,
      addedAt: '2024-01-13',
      cloudPath: '/视频/宣传视频.mp4',
      status: 'syncing',
    },
    {
      id: '4',
      name: '音效文件.wav',
      type: 'audio',
      size: 25_600_000,
      addedAt: '2024-01-12',
      cloudPath: '/音频/音效文件.wav',
      status: 'error',
    },
  ];

  const displayMaterials = materials.length > 0 ? materials : mockMaterials;

  const typeOptions: FilterOption[] = [
    {label: t('all-types', {defaultMessage: '全部类型'}), value: 'all'},
    {label: t('type-image', {defaultMessage: '图片'}), value: 'image'},
    {label: t('type-document', {defaultMessage: '文档'}), value: 'document'},
    {label: t('type-video', {defaultMessage: '视频'}), value: 'video'},
    {label: t('type-audio', {defaultMessage: '音频'}), value: 'audio'},
  ];

  const filteredMaterials = displayMaterials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.cloudPath.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || material.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (type: string): string => {
    switch (type) {
      case 'image': {
        return 'pi pi-image text-purple-500';
      }

      case 'document': {
        return 'pi pi-file-pdf text-red-500';
      }

      case 'video': {
        return 'pi pi-video text-pink-500';
      }

      case 'audio': {
        return 'pi pi-volume-up text-yellow-500';
      }

      default: {
        return 'pi pi-file text-gray-500';
      }
    }
  };

  const getStatusSeverity = (status: ProjectMaterial['status']): 'success' | 'warning' | 'danger' => {
    switch (status) {
      case 'synced': {
        return 'success';
      }

      case 'syncing': {
        return 'warning';
      }

      case 'error': {
        return 'danger';
      }
    }
  };

  const getStatusLabel = (status: ProjectMaterial['status']): string => {
    switch (status) {
      case 'synced': {
        return t('status-synced', {defaultMessage: '已同步'});
      }

      case 'syncing': {
        return t('status-syncing', {defaultMessage: '同步中'});
      }

      case 'error': {
        return t('status-error', {defaultMessage: '同步失败'});
      }
    }
  };

  const handleRemoveMaterial = (material: ProjectMaterial): void => {
    confirmDialog({
      message: t('confirm-remove-material', {
        name: material.name,
        defaultMessage: `确定要从项目中移除素材 "${material.name}" 吗？`,
      }),
      header: t('confirm-remove-title', {defaultMessage: '确认移除'}),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: t('confirm', {defaultMessage: '确认'}),
      rejectLabel: t('cancel', {defaultMessage: '取消'}),
      accept() {
        onRemoveMaterial?.(material.id);
      },
    });
  };

  const handleBatchRemove = (): void => {
    if (selectedMaterials.length === 0) return;

    confirmDialog({
      message: t('confirm-batch-remove', {
        count: selectedMaterials.length,
        defaultMessage: `确定要从项目中移除 ${selectedMaterials.length} 个素材吗？`,
      }),
      header: t('confirm-batch-remove-title', {defaultMessage: '批量移除'}),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: t('confirm', {defaultMessage: '确认'}),
      rejectLabel: t('cancel', {defaultMessage: '取消'}),
      accept() {
        for (const material of selectedMaterials) {
          onRemoveMaterial?.(material.id);
        }

        setSelectedMaterials([]);
      },
    });
  };

  const fileIconTemplate = (material: ProjectMaterial): JSX.Element => (
    <i className={`${getFileIcon(material.type)} text-xl`} />
  );

  const fileNameTemplate = (material: ProjectMaterial): JSX.Element => (
    <div className="flex items-center gap-2">
      <span className="font-medium">{material.name}</span>
      {material.status === 'syncing' && <i className="pi pi-spin pi-spinner text-blue-500 text-sm" />}
    </div>
  );

  const fileSizeTemplate = (material: ProjectMaterial): string => formatFileSize(material.size);

  const statusTemplate = (material: ProjectMaterial): JSX.Element => (
    <Tag value={getStatusLabel(material.status)} severity={getStatusSeverity(material.status)} className="text-xs" />
  );

  const cloudPathTemplate = (material: ProjectMaterial): JSX.Element => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 truncate max-w-xs" title={material.cloudPath}>
        {material.cloudPath}
      </span>
      <Button
        icon="pi pi-copy"
        size="small"
        severity="secondary"
        tooltip={t('copy-path', {defaultMessage: '复制路径'})}
        onClick={() => {
          void navigator.clipboard.writeText(material.cloudPath);
        }}
      />
    </div>
  );

  const actionTemplate = (material: ProjectMaterial): JSX.Element => (
    <div className="flex gap-1">
      <Button
        icon="pi pi-eye"
        size="small"
        severity="info"
        tooltip={t('preview', {defaultMessage: '预览'})}
        disabled={material.status !== 'synced'}
        onClick={() => onPreviewMaterial?.(material)}
      />
      <Button
        icon="pi pi-download"
        size="small"
        severity="success"
        tooltip={t('download', {defaultMessage: '下载'})}
        disabled={material.status !== 'synced'}
        onClick={() => onDownloadMaterial?.(material)}
      />
      <Button
        icon="pi pi-trash"
        size="small"
        severity="danger"
        tooltip={t('remove', {defaultMessage: '移除'})}
        onClick={() => {
          handleRemoveMaterial(material);
        }}
      />
    </div>
  );

  const tableHeader = (): JSX.Element => (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('title', {defaultMessage: '项目素材'})}</h3>
        <span className="text-sm text-gray-500">
          {t('total-materials', {
            count: filteredMaterials.length,
            defaultMessage: `共 ${filteredMaterials.length} 个素材`,
          })}
        </span>
      </div>

      <div className="flex gap-2">
        <Button label={t('add-materials', {defaultMessage: '添加素材'})} icon="pi pi-plus" onClick={onAddMaterials} />
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          tooltip={t('refresh', {defaultMessage: '刷新'})}
          onClick={onRefresh}
        />
      </div>
    </div>
  );

  const tableFooter = (): JSX.Element => (
    <div className="flex justify-between items-center">
      <div className="text-sm text-gray-500">
        {selectedMaterials.length > 0 && (
          <span>
            {t('selected-count', {
              count: selectedMaterials.length,
              defaultMessage: `已选择 ${selectedMaterials.length} 个素材`,
            })}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {selectedMaterials.length > 0 && (
          <Button
            label={t('batch-remove', {defaultMessage: '批量移除'})}
            icon="pi pi-trash"
            severity="danger"
            size="small"
            onClick={handleBatchRemove}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <ConfirmDialog />
      <Tooltip target=".p-button" />

      {tableHeader()}

      {/* 搜索和过滤 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <span className="p-input-icon-left w-full">
            <i className="pi pi-search" />
            <InputText
              value={searchTerm}
              placeholder={t('search-materials', {defaultMessage: '搜索素材...'})}
              className="w-full"
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
          </span>
        </div>
        <Dropdown
          value={typeFilter}
          options={typeOptions}
          optionLabel="label"
          optionValue="value"
          placeholder={t('filter-by-type', {defaultMessage: '按类型筛选'})}
          className="w-48"
          onChange={(e) => {
            setTypeFilter(e.value as string);
          }}
        />
      </div>

      {/* 素材列表 */}
      <DataTable
        paginator
        value={filteredMaterials}
        loading={isLoading}
        emptyMessage={t('no-materials', {defaultMessage: '暂无素材'})}
        selectionMode="checkbox"
        selection={selectedMaterials}
        dataKey="id"
        rows={10}
        className="border rounded-lg"
        footer={tableFooter()}
        onSelectionChange={(e) => {
          setSelectedMaterials(e.value);
        }}
      >
        <Column selectionMode="multiple" headerStyle={{width: '3rem'}} />
        <Column header="" body={fileIconTemplate} style={{width: '3rem'}} />
        <Column sortable field="name" header={t('file-name', {defaultMessage: '文件名'})} body={fileNameTemplate} />
        <Column sortable field="type" header={t('type', {defaultMessage: '类型'})} style={{width: '6rem'}} />
        <Column
          sortable
          field="size"
          header={t('size', {defaultMessage: '大小'})}
          body={fileSizeTemplate}
          style={{width: '6rem'}}
        />
        <Column
          sortable
          field="status"
          header={t('status', {defaultMessage: '状态'})}
          body={statusTemplate}
          style={{width: '6rem'}}
        />
        <Column
          field="cloudPath"
          header={t('cloud-path', {defaultMessage: '云盘路径'})}
          body={cloudPathTemplate}
          style={{width: '15rem'}}
        />
        <Column sortable field="addedAt" header={t('added-at', {defaultMessage: '添加时间'})} style={{width: '8rem'}} />
        <Column header={t('actions', {defaultMessage: '操作'})} body={actionTemplate} style={{width: '8rem'}} />
      </DataTable>
    </div>
  );
}
