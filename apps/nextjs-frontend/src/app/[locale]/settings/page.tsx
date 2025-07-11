import {getTranslations} from 'next-intl/server';
import {type JSX} from 'react';
import {Breadcrumb} from '@/components/breadcrumb/breadcrumb.component';

export default async function Settings(): Promise<JSX.Element> {
  const t = await getTranslations('Page-Settings');

  return (
    <div className="w-full">
      <Breadcrumb />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title', {defaultMessage: '设置'})}</h1>
        <p className="text-gray-600">{t('subtitle', {defaultMessage: '管理您的账户和应用程序设置'})}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 导航菜单 */}
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-lg shadow-md p-4">
            <ul className="space-y-2">
              <li>
                <a href="#profile" className="block px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
                  <i className="pi pi-user mr-2" />
                  {t('profile-settings', {defaultMessage: '个人资料'})}
                </a>
              </li>
              <li>
                <a
                  href="#aliyun"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <i className="pi pi-cloud mr-2" />
                  {t('aliyun-settings', {defaultMessage: '阿里云盘配置'})}
                </a>
              </li>
              <li>
                <a
                  href="#notifications"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <i className="pi pi-bell mr-2" />
                  {t('notification-settings', {defaultMessage: '通知设置'})}
                </a>
              </li>
              <li>
                <a
                  href="#security"
                  className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <i className="pi pi-shield mr-2" />
                  {t('security-settings', {defaultMessage: '安全设置'})}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* 设置内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 个人资料设置 */}
          <div id="profile" className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('profile-settings', {defaultMessage: '个人资料'})}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('username', {defaultMessage: '用户名'})}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('username-placeholder', {defaultMessage: '请输入用户名'})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email', {defaultMessage: '邮箱地址'})}
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('email-placeholder', {defaultMessage: '请输入邮箱地址'})}
                />
              </div>
              <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                {t('save-profile', {defaultMessage: '保存资料'})}
              </button>
            </div>
          </div>

          {/* 阿里云盘配置 */}
          <div id="aliyun" className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('aliyun-settings', {defaultMessage: '阿里云盘配置'})}
            </h2>

            {/* 配置状态 */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <i className="pi pi-exclamation-triangle text-yellow-600 mr-2" />
                <span className="text-yellow-800">
                  {t('aliyun-not-configured', {defaultMessage: '阿里云盘尚未配置'})}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('webdav-url', {defaultMessage: 'WebDAV 地址'})}
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="http://localhost:5244/dav"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('webdav-username', {defaultMessage: '用户名'})}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('webdav-username-placeholder', {defaultMessage: '请输入WebDAV用户名'})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('webdav-password', {defaultMessage: '密码'})}
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('webdav-password-placeholder', {defaultMessage: '请输入WebDAV密码'})}
                />
              </div>
              <div className="flex gap-2">
                <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                  {t('test-connection', {defaultMessage: '测试连接'})}
                </button>
                <button type="button" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                  {t('save-config', {defaultMessage: '保存配置'})}
                </button>
              </div>
            </div>
          </div>

          {/* 通知设置 */}
          <div id="notifications" className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('notification-settings', {defaultMessage: '通知设置'})}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {t('email-notifications', {defaultMessage: '邮件通知'})}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {t('email-notifications-desc', {defaultMessage: '接收项目更新和素材变动的邮件通知'})}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            </div>
          </div>

          {/* 安全设置 */}
          <div id="security" className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('security-settings', {defaultMessage: '安全设置'})}
            </h2>
            <div className="space-y-4">
              <button type="button" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
                {t('change-password', {defaultMessage: '修改密码'})}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
