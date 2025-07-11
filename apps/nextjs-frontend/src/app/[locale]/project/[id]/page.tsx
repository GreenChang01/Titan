import {getTranslations} from 'next-intl/server';
import {type JSX} from 'react';
import {Breadcrumb} from '@/components/breadcrumb/breadcrumb.component';

type ProjectDetailsProps = {
  readonly params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function ProjectDetails({params}: ProjectDetailsProps): Promise<JSX.Element> {
  const {id} = await params;
  const t = await getTranslations('Page-ProjectDetails');

  return (
    <div className="w-full">
      <Breadcrumb />
      {/* 页面头部 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title', {defaultMessage: '项目详情'})}</h1>
            <p className="text-gray-600">{t('subtitle', {defaultMessage: '管理项目素材和配置', projectId: id})}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2"
            >
              <i className="pi pi-cog" />
              {t('settings', {defaultMessage: '设置'})}
            </button>
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <i className="pi pi-plus" />
              {t('add-material', {defaultMessage: '添加素材'})}
            </button>
          </div>
        </div>
      </div>

      {/* 项目信息卡片 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {t('project-name', {defaultMessage: '项目名称'})}
            </h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {t('loading-project-name', {defaultMessage: '加载中...'})}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {t('material-count', {defaultMessage: '素材数量'})}
            </h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">0</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {t('created-date', {defaultMessage: '创建时间'})}
            </h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {t('loading-date', {defaultMessage: '加载中...'})}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {t('description', {defaultMessage: '项目描述'})}
          </h3>
          <p className="mt-1 text-gray-900">{t('loading-description', {defaultMessage: '加载中...'})}</p>
        </div>
      </div>

      {/* 素材列表 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">{t('materials-list', {defaultMessage: '项目素材'})}</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md flex items-center gap-2"
            >
              <i className="pi pi-filter" />
              {t('filter', {defaultMessage: '筛选'})}
            </button>
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <i className="pi pi-cloud" />
              {t('browse-cloud', {defaultMessage: '浏览云盘'})}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* 空状态 */}
          <div className="text-center py-12">
            <i className="pi pi-file-o text-6xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {t('no-materials', {defaultMessage: '暂无素材'})}
            </h3>
            <p className="text-gray-500 mb-6">
              {t('no-materials-description', {defaultMessage: '从您的阿里云盘添加素材到此项目'})}
            </p>
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center gap-2 mx-auto"
            >
              <i className="pi pi-cloud" />
              {t('add-first-material', {defaultMessage: '添加第一个素材'})}
            </button>
          </div>
        </div>
      </div>

      {/* 活动日志 */}
      <div className="bg-white rounded-lg shadow-md mt-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t('activity-log', {defaultMessage: '活动日志'})}</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <i className="pi pi-clock text-4xl text-gray-400 mb-4" />
            <p className="text-gray-500">{t('no-activity', {defaultMessage: '暂无活动记录'})}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
