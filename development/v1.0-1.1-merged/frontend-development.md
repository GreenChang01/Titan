# Titan 前端开发清单 - 合并版本

**技术栈**: Next.js 15 + TypeScript + shadcn/ui + Tailwind CSS + Zustand
**核心功能**: 项目管理 + 阿里云盘集成 + ASMR音频生成

---

## 🎵 已完成功能 ✅

### ASMR音频生成系统 (完整实现)

- **5步向导**: 文本输入 → 语音配置 → 音景选择 → 高级混音 → 预览确认
- **位置**: `apps/nextjs-frontend/src/app/[locale]/generate/`
- **状态管理**: Zustand完整实现 (`src/store/asmr/asmr.store.ts`)
- **Mock API**: 完整的模拟服务系统 (`src/lib/services/asmr-api.mock.ts`)
- **组件**: 任务监控、音频播放器、Dashboard集成
- **类型定义**: `packages/titan-shared/src/types/asmr.ts`

### 基础UI框架 ✅

- **页面结构**: Dashboard、项目详情、设置页面
- **布局组件**: Header、Main、Breadcrumb
- **UI组件**: Button, Card, Slider, Switch, Tabs等
- **响应式设计**: 移动端适配完成

---

## 🚧 待开发功能 (优先级排序)

### P0 - 核心业务功能

#### 1. API服务层基础设施 ❌

**时间**: 1-2天

```typescript
// 需要创建:
src/lib/api/
├── client.ts          // HTTP客户端封装
├── auth.ts           // 认证API
├── projects.ts       // 项目管理API
├── aliyun-drive.ts   // 阿里云盘API
└── types.ts          // API类型定义
```

#### 2. 项目管理功能完善 ❌

**时间**: 2-3天

- 项目列表真实数据集成
- 项目CRUD操作实现
- 项目详情页面数据绑定
- 项目表单验证和提交

#### 3. 阿里云盘文件浏览器 ❌

**时间**: 3-4天

- WebDAV配置组件
- 文件浏览器模态框
- 文件/目录导航
- 文件选择和添加到项目
- 文件操作(上传、下载、删除)

#### 4. 状态管理完善 ❌

**时间**: 1-2天

- React Query配置和hooks
- 数据缓存策略
- 全局状态管理(Zustand)

### P1 - 用户体验优化

#### 5. 错误处理和加载状态 ❌

- 全局错误边界
- API错误统一处理
- Loading skeleton组件
- Toast消息系统

#### 6. 表单和验证 ❌

- React Hook Form + Zod集成
- 统一表单组件
- 实时验证反馈

### P2 - 增强功能

#### 7. 高级特性 ❌

- 键盘快捷键
- 批量操作
- 搜索和筛选
- 暗色模式

---

## 📁 文件结构规划

```
apps/nextjs-frontend/src/
├── app/[locale]/
│   ├── dashboard/          ✅ 已完成
│   ├── generate/           ✅ ASMR完整实现
│   ├── project/[id]/       🔄 需要API集成
│   └── settings/           🔄 需要阿里云盘配置
├── components/
│   ├── asmr/              ✅ 完整实现
│   ├── aliyun-drive/      ❌ 待开发
│   ├── project/           🔄 部分完成
│   └── ui/                ✅ 基础组件完成
├── lib/
│   ├── api/               ❌ 完全缺失
│   └── services/          🔄 ASMR已完成
├── store/
│   ├── asmr/              ✅ 完整实现
│   ├── project/           ❌ 待开发
│   └── user/              ✅ 基础实现
└── hooks/                 ❌ React Query hooks待开发
```

---

## 🎯 开发计划

### 第1周: API基础设施

- [ ] 创建HTTP客户端和错误处理
- [ ] 实现认证API服务
- [ ] 配置React Query
- [ ] 基础状态管理

### 第2周: 项目管理

- [ ] 项目API集成
- [ ] 项目列表数据绑定
- [ ] 项目详情页面完善
- [ ] 项目CRUD操作

### 第3周: 阿里云盘集成

- [ ] WebDAV配置组件
- [ ] 文件浏览器开发
- [ ] 文件操作功能
- [ ] 素材添加流程

### 第4周: 优化和测试

- [ ] 错误处理完善
- [ ] 性能优化
- [ ] 用户体验改进
- [ ] 整体测试

---

## 🔧 技术要点

### 现有优势

- ASMR功能完整可用作参考
- UI组件库已完善
- 状态管理模式已确立
- TypeScript类型系统已建立

### 关键挑战

- 文件浏览器复杂度高
- 大文件列表性能优化
- WebDAV错误处理
- 前后端数据同步

### 复用策略

- 复用ASMR的API模式
- 复用状态管理架构
- 复用UI组件和布局
- 复用错误处理机制

---

**目标**: 4周内完成完整的项目管理 + 文件管理 + ASMR生成的MVP产品
