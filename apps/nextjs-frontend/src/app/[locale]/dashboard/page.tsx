import {getTranslations} from 'next-intl/server';
import {type JSX} from 'react';
import {Breadcrumb} from '@/components/breadcrumb/breadcrumb.component';

export default async function Dashboard(): Promise<JSX.Element> {
  const t = await getTranslations('Page-Dashboard');

  return (
    <div className="w-full">
      <Breadcrumb />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title', {defaultMessage: '项目看板'})}</h1>
        <p className="text-gray-600">{t('subtitle', {defaultMessage: '管理您的素材协作项目'})}</p>
      </div>

      {/* 项目统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('total-projects', {defaultMessage: '总项目数'})}
              </h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <i className="pi pi-folder text-4xl text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('active-projects', {defaultMessage: '活跃项目'})}
              </h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <i className="pi pi-play text-4xl text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('total-materials', {defaultMessage: '总素材数'})}
              </h3>
              <p className="text-3xl font-bold text-purple-600">0</p>
            </div>
            <i className="pi pi-file text-4xl text-purple-600" />
          </div>
        </div>
      </div>

      {/* 项目列表 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">{t('project-list', {defaultMessage: '项目列表'})}</h2>
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <i className="pi pi-plus" />
            {t('create-project', {defaultMessage: '创建项目'})}
          </button>
        </div>

        <div className="p-6">
          {/* 空状态 */}
          <div className="text-center py-12">
            <i className="pi pi-folder-open text-6xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {t('no-projects', {defaultMessage: '暂无项目'})}
            </h3>
            <p className="text-gray-500 mb-6">
              {t('no-projects-description', {defaultMessage: '创建您的第一个项目来开始管理素材'})}
            </p>
            <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md">
              {t('create-first-project', {defaultMessage: '创建第一个项目'})}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
