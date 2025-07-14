# Titan v1.2 前端开发指南

## 概述

Titan v1.2 前端开发基于Next.js 15 + TypeScript + React 19，实现智能提示管理和ASMR素材管理功能，重点优化Step1内容创作和Step3音景选择体验。

## 核心功能架构

### 1. 智能提示管理系统

#### 1.1 提示管理界面

```typescript
// app/[locale]/prompts/page.tsx - 提示库主页面
interface PromptLibraryProps {
  prompts: AIPrompt[];
  categories: PromptCategory[];
  onCreatePrompt: (prompt: CreatePromptDto) => void;
  onEditPrompt: (promptId: string, updates: UpdatePromptDto) => void;
  onDeletePrompt: (promptId: string) => void;
  onOptimizePrompt: (promptId: string, criteria: OptimizationCriteria[]) => void;
}

// 组件结构
const PromptLibrary = () => {
  return (
    <div className="flex h-full">
      <PromptFilterPanel className="w-64" />
      <PromptGrid className="flex-1" />
      <PromptDetailPanel className="w-80" />
    </div>
  );
};
```

#### 1.2 提示编辑器组件

```typescript
// components/prompts/prompt-editor.tsx
interface PromptEditorProps {
  prompt?: AIPrompt;
  mode: 'create' | 'edit';
  onSave: (prompt: AIPrompt) => void;
  onCancel: () => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ prompt, mode, onSave, onCancel }) => {
  const [formData, setFormData] = useState<PromptFormData>({
    name: '',
    content: '',
    category: '',
    tags: [],
    variables: [],
    examples: [],
    aiModel: 'openai',
    temperature: 0.7,
    maxTokens: 1000,
  });

  return (
    <Form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="variables">变量定义</TabsTrigger>
          <TabsTrigger value="examples">使用示例</TabsTrigger>
          <TabsTrigger value="settings">AI设置</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <PromptBasicInfo formData={formData} onChange={setFormData} />
        </TabsContent>

        <TabsContent value="variables">
          <VariableEditor variables={formData.variables} onChange={handleVariablesChange} />
        </TabsContent>

        <TabsContent value="examples">
          <ExampleEditor examples={formData.examples} onChange={handleExamplesChange} />
        </TabsContent>

        <TabsContent value="settings">
          <AISettings settings={formData} onChange={setFormData} />
        </TabsContent>
      </Tabs>
    </Form>
  );
};
```

#### 1.3 AI提示生成器

```typescript
// components/prompts/ai-prompt-generator.tsx
interface AIPromptGeneratorProps {
  onPromptGenerated: (prompt: GeneratedPrompt) => void;
  context?: string;
}

const AIPromptGenerator: React.FC<AIPromptGeneratorProps> = ({ onPromptGenerated, context }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePrompt = async () => {
    setIsGenerating(true);
    try {
      const response = await aiApi.generatePrompt({
        context,
        requirements: prompt,
        tone: 'asmr-friendly',
        targetAudience: 'middle-aged',
      });
      onPromptGenerated(response);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI智能提示生成</CardTitle>
        <CardDescription>让AI帮您创建最适合ASMR内容的提示</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述您希望生成的ASMR内容类型..."
          rows={4}
        />
        <Button onClick={generatePrompt} disabled={!prompt.trim() || isGenerating}>
          {isGenerating ? '生成中...' : '生成提示'}
        </Button>
      </CardContent>
    </Card>
  );
};
```

### 2. ASMR素材管理系统

#### 2.1 素材浏览器

```typescript
// components/assets/asset-browser.tsx
interface AssetBrowserProps {
  assets: ASMRAsset[];
  onAssetSelect: (asset: ASMRAsset) => void;
  onAssetUpload: (files: File[]) => void;
  selectedAssets?: ASMRAsset[];
  viewMode: 'grid' | 'list';
}

const AssetBrowser: React.FC<AssetBrowserProps> = ({
  assets,
  onAssetSelect,
  onAssetUpload,
  selectedAssets = [],
  viewMode,
}) => {
  const [filters, setFilters] = useState<AssetFilters>({
    type: undefined,
    category: undefined,
    tags: [],
    searchTerm: '',
    projectId: undefined,
  });

  return (
    <div className="flex h-full">
      <AssetFilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        className="w-64 border-r"
      />

      <div className="flex-1 flex flex-col">
        <AssetToolbar
          onUpload={onAssetUpload}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedCount={selectedAssets.length}
        />

        <div className="flex-1 overflow-auto">
          {viewMode === 'grid' ? (
            <AssetGrid
              assets={filteredAssets}
              onAssetSelect={onAssetSelect}
              selectedAssets={selectedAssets}
            />
          ) : (
            <AssetList
              assets={filteredAssets}
              onAssetSelect={onAssetSelect}
              selectedAssets={selectedAssets}
            />
          )}
        </div>
      </div>

      <AssetDetailPanel
        asset={selectedAssets[0]}
        className="w-80 border-l"
      />
    </div>
  );
};
```

#### 2.2 WebDAV集成文件管理器

```typescript
// components/assets/webdav-file-manager.tsx
interface WebDAVFileManagerProps {
  config: WebDAVConfig;
  onFileSelect: (file: WebDAVFile) => void;
  onConfigUpdate: (config: WebDAVConfig) => void;
}

const WebDAVFileManager: React.FC<WebDAVFileManagerProps> = ({
  config,
  onFileSelect,
  onConfigUpdate,
}) => {
  const [files, setFiles] = useState<WebDAVFile[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = async (path: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await webdavApi.listFiles({
        config,
        path,
        includeMetadata: true,
      });

      setFiles(response.files);
      setCurrentPath(path);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <WebDAVToolbar
        config={config}
        currentPath={currentPath}
        onPathChange={loadFiles}
        onConfigUpdate={onConfigUpdate}
      />

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <FileListSkeleton />
        ) : error ? (
          <ErrorState error={error} onRetry={() => loadFiles(currentPath)} />
        ) : (
          <FileList
            files={files}
            onFileSelect={onFileSelect}
            onNavigate={loadFiles}
          />
        )}
      </div>
    </div>
  );
};
```

#### 2.3 素材智能分类

```typescript
// components/assets/auto-categorization.tsx
interface AutoCategorizationProps {
  asset: ASMRAsset;
  onCategoryUpdate: (category: string, confidence: number) => void;
}

const AutoCategorization: React.FC<AutoCategorizationProps> = ({
  asset,
  onCategoryUpdate,
}) => {
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeAsset = async () => {
    setIsAnalyzing(true);
    try {
      const response = await aiApi.categorizeAsset({
        filename: asset.name,
        metadata: asset.metadata,
        contentAnalysis: true,
      });

      setSuggestions(response.suggestions);
      if (response.suggestions.length > 0) {
        onCategoryUpdate(
          response.suggestions[0].category,
          response.suggestions[0].confidence
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    analyzeAsset();
  }, [asset.id]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>智能分类</Label>
        {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-2 rounded-md bg-muted"
        >
          <span className="text-sm font-medium">{suggestion.category}</span>
          <Badge variant="outline">{Math.round(suggestion.confidence * 100)}%</Badge>
        </div>
      ))}
    </div>
  );
};
```

### 3. Step1 内容创作增强

#### 3.1 智能提示选择器

```typescript
// components/generate/step1-enhanced.tsx
interface Step1EnhancedProps {
  text: string;
  onTextChange: (text: string) => void;
  onPromptSelect: (prompt: AIPrompt) => void;
  selectedPrompt?: AIPrompt;
}

const Step1Enhanced: React.FC<Step1EnhancedProps> = ({
  text,
  onTextChange,
  onPromptSelect,
  selectedPrompt,
}) => {
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [templates, setTemplates] = useState<ASMRContentTemplate[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <Label>内容创作</Label>
        <p className="text-sm text-muted-foreground">
          使用AI提示或模板快速生成适合中老年听众的ASMR内容
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setShowPromptLibrary(true)}
          className="flex items-center gap-2"
        >
          <BookOpen className="h-4 w-4" />
          提示库
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowGenerator(true)}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          AI生成
        </Button>
      </div>

      {selectedPrompt && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{selectedPrompt.name}</CardTitle>
            <CardDescription>{selectedPrompt.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <VariableInput
              variables={selectedPrompt.variables}
              onValuesChange={handleVariableChange}
            />
          </CardContent>
        </Card>
      )}

      <div>
        <Label>最终文本内容</Label>
        <Textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="输入您的ASMR内容文本，或使用上面的工具生成..."
          rows={8}
          className="font-mono"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-muted-foreground">
            {text.length} 字符
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={optimizeContent}
            disabled={!text.trim()}
          >
            <Wand2 className="h-4 w-4 mr-1" />
            优化文本
          </Button>
        </div>
      </div>

      <PromptLibraryModal
        open={showPromptLibrary}
        onOpenChange={setShowPromptLibrary}
        onPromptSelect={handlePromptSelect}
      />

      <AIGeneratorModal
        open={showGenerator}
        onOpenChange={setShowGenerator}
        onGenerated={handleGeneratedContent}
      />
    </div>
  );
};
```

### 4. Step3 音景选择增强

#### 4.1 素材集成音景选择器

```typescript
// components/generate/step3-enhanced.tsx
interface Step3EnhancedProps {
  soundscape: SoundscapeOptions;
  onSoundscapeChange: (soundscape: SoundscapeOptions) => void;
  projectAssets: ASMRAsset[];
}

const Step3Enhanced: React.FC<Step3EnhancedProps> = ({
  soundscape,
  onSoundscapeChange,
  projectAssets,
}) => {
  const [mode, setMode] = useState<'preset' | 'custom' | 'asset'>('preset');
  const [selectedAsset, setSelectedAsset] = useState<ASMRAsset | null>(null);

  const audioAssets = projectAssets.filter(asset => asset.type === 'audio');

  return (
    <div className="space-y-6">
      <div>
        <Label>音景选择</Label>
        <p className="text-sm text-muted-foreground">
          选择预设音景、自定义生成，或使用项目中的音频素材
        </p>
      </div>

      <Tabs value={mode} onValueChange={(value) => setMode(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preset">预设音景</TabsTrigger>
          <TabsTrigger value="custom">自定义生成</TabsTrigger>
          <TabsTrigger value="asset">项目素材</TabsTrigger>
        </TabsList>

        <TabsContent value="preset">
          <PresetSoundscapeSelector
            selected={soundscape}
            onChange={onSoundscapeChange}
          />
        </TabsContent>

        <TabsContent value="custom">
          <CustomSoundscapeGenerator
            config={soundscape}
            onChange={onSoundscapeChange}
          />
        </TabsContent>

        <TabsContent value="asset">
          <AssetSoundscapeSelector
            assets={audioAssets}
            selectedAsset={selectedAsset}
            onAssetSelect={(asset) => {
              setSelectedAsset(asset);
              onSoundscapeChange({
                ...soundscape,
                prompt: asset.name,
                duration: asset.metadata.duration || 300,
                source: 'asset',
                assetId: asset.id,
              });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

### 5. API Demo验证页面

#### 5.1 智能提示API Demo

```typescript
// app/[locale]/demo/prompts/page.tsx
const PromptAPIDemo: React.FC = () => {
  const [testPrompt, setTestPrompt] = useState('');
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [result, setResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const testPromptAPI = async () => {
    setIsTesting(true);
    try {
      const response = await api.prompts.test({
        prompt: testPrompt,
        variables,
        aiModel: 'openai',
      });
      setResult(response.generatedContent);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>智能提示API测试</CardTitle>
          <CardDescription>
            测试提示生成API的完整功能，包括变量替换和AI响应
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>提示模板</Label>
            <Textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="输入提示模板，使用{{变量名}}格式..."
              rows={4}
            />
          </div>

          <VariableInput
            prompt={testPrompt}
            variables={variables}
            onChange={setVariables}
          />

          <Button onClick={testPromptAPI} disabled={!testPrompt.trim()}>
            {isTesting ? '测试中...' : '测试提示'}
          </Button>

          {result && (
            <div>
              <Label>生成结果</Label>
              <div className="mt-2 p-4 bg-muted rounded-md">
                <pre className="whitespace-pre-wrap">{result}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

#### 5.2 ASMR素材API Demo

```typescript
// app/[locale]/demo/assets/page.tsx
const AssetAPIDemo: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedAsset, setUploadedAsset] = useState<ASMRAsset | null>(null);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'audio');
    formData.append('category', '自然环境');
    formData.append('tags', JSON.stringify(['雨声', '白噪音']));

    try {
      const response = await api.assets.upload(formData, {
        onProgress: (progress) => setUploadProgress(progress),
      });
      setUploadedAsset(response.asset);
    } catch (error) {
      toast.error('上传失败：' + error.message);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ASMR素材API测试</CardTitle>
          <CardDescription>
            测试素材上传、分类、搜索等API功能
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FileUpload
            onFileSelect={handleUpload}
            accept={['audio/*', 'video/*']}
            maxSize={50 * 1024 * 1024}
          />

          {uploadProgress > 0 && (
            <Progress value={uploadProgress} className="mt-4" />
          )}

          {uploadedAsset && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">上传成功</h4>
              <p className="text-sm">文件名: {uploadedAsset.name}</p>
              <p className="text-sm">类型: {uploadedAsset.type}</p>
              <p className="text-sm">大小: {formatFileSize(uploadedAsset.fileSize)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <SearchDemo />
    </div>
  );
};
```

### 6. React 19 + Next.js 15优化

#### 6.1 服务端组件集成

```typescript
// app/[locale]/generate/step1-server.tsx
import { Suspense } from 'react';

export default async function Step1Server() {
  const prompts = await getPrompts();
  const templates = await getContentTemplates();

  return (
    <Suspense fallback={<Step1Skeleton />}>
      <Step1Client prompts={prompts} templates={templates} />
    </Suspense>
  );
}
```

#### 6.2 流式渲染优化

```typescript
// components/streaming/prompt-stream.tsx
import { use } from 'react';

interface PromptStreamProps {
  promptPromise: Promise<AIPrompt[]>;
}

export function PromptStream({ promptPromise }: PromptStreamProps) {
  const prompts = use(promptPromise);

  return (
    <div className="grid gap-4">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}
```

#### 6.3 客户端组件优化

```typescript
// components/optimized/asset-grid.tsx
'use client';

import { useMemo, useCallback } from 'react';
import { FixedSizeGrid } from 'react-window';

interface OptimizedAssetGridProps {
  assets: ASMRAsset[];
  onAssetSelect: (asset: ASMRAsset) => void;
  selectedAssets: ASMRAsset[];
}

export function OptimizedAssetGrid({
  assets,
  onAssetSelect,
  selectedAssets,
}: OptimizedAssetGridProps) {
  const isSelected = useCallback(
    (asset: ASMRAsset) => selectedAssets.some(a => a.id === asset.id),
    [selectedAssets]
  );

  const renderAsset = useCallback(
    ({ index, style }) => {
      const asset = assets[index];
      return (
        <div style={style}>
          <AssetCard
            asset={asset}
            selected={isSelected(asset)}
            onClick={() => onAssetSelect(asset)}
          />
        </div>
      );
    },
    [assets, isSelected, onAssetSelect]
  );

  return (
    <FixedSizeGrid
      columnCount={4}
      columnWidth={200}
      height={600}
      rowCount={Math.ceil(assets.length / 4)}
      rowHeight={250}
      width={800}
    >
      {renderAsset}
    </FixedSizeGrid>
  );
}
```

### 7. 状态管理升级

#### 7.1 Zustand v4集成

```typescript
// store/prompts.store.ts
interface PromptsStore {
	prompts: AIPrompt[];
	categories: PromptCategory[];
	selectedPrompt?: AIPrompt;
	filters: PromptFilters;

	// Actions
	loadPrompts: () => Promise<void>;
	createPrompt: (prompt: CreatePromptDto) => Promise<void>;
	updatePrompt: (id: string, updates: UpdatePromptDto) => Promise<void>;
	deletePrompt: (id: string) => Promise<void>;
	optimizePrompt: (id: string, criteria: OptimizationCriteria[]) => Promise<void>;

	// Selectors
	filteredPrompts: () => AIPrompt[];
	promptsByCategory: (categoryId: string) => AIPrompt[];
	topPrompts: (limit: number) => AIPrompt[];
}

const usePromptsStore = create<PromptsStore>()(
	devtools(
		subscribeWithSelector((set, get) => ({
			prompts: [],
			categories: [],
			filters: {
				category: undefined,
				tags: [],
				searchTerm: '',
			},

			loadPrompts: async () => {
				const prompts = await api.prompts.list();
				set({prompts});
			},

			createPrompt: async (prompt) => {
				const newPrompt = await api.prompts.create(prompt);
				set((state) => ({
					prompts: [...state.prompts, newPrompt],
				}));
			},

			filteredPrompts: () => {
				const {prompts, filters} = get();
				return prompts.filter((prompt) => {
					if (filters.category && prompt.category !== filters.category) return false;
					if (filters.tags.length > 0 && !filters.tags.some((tag) => prompt.tags.includes(tag))) return false;
					if (filters.searchTerm && !prompt.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) return false;
					return true;
				});
			},
		})),
	),
);
```

#### 7.2 React Query集成

```typescript
// hooks/use-prompts.ts
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';

export function usePrompts(filters?: PromptFilters) {
	return useQuery({
		queryKey: ['prompts', filters],
		queryFn: () => api.prompts.list(filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
}

export function useCreatePrompt() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: api.prompts.create,
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['prompts']});
		},
	});
}

export function usePromptOptimization() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({promptId, criteria}: {promptId: string; criteria: OptimizationCriteria[]}) =>
			api.prompts.optimize(promptId, criteria),
		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ['prompts']});
		},
	});
}
```

### 8. 性能优化策略

#### 8.1 图片懒加载

```typescript
// components/lazy-image.tsx
import { useInView } from 'react-intersection-observer';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export function LazyImage({ src, alt, className, placeholder }: LazyImageProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className={className}>
      {inView ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          placeholder={placeholder ? 'blur' : undefined}
          blurDataURL={placeholder}
        />
      ) : (
        <div className="w-full h-full bg-muted animate-pulse" />
      )}
    </div>
  );
}
```

#### 8.2 虚拟化列表

```typescript
// components/virtualized-list.tsx
import { VariableSizeList } from 'react-window';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: (index: number) => number;
  height: number;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  height,
}: VirtualizedListProps<T>) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      {renderItem(items[index], index)}
    </div>
  );

  return (
    <VariableSizeList
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
    >
      {Row}
    </VariableSizeList>
  );
}
```

### 9. 测试策略

#### 9.1 组件测试

```typescript
// __tests__/components/prompt-editor.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PromptEditor } from '@/components/prompts/prompt-editor';

describe('PromptEditor', () => {
  it('should create new prompt', async () => {
    render(
      <PromptEditor
        mode="create"
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    const nameInput = screen.getByLabelText('名称');
    fireEvent.change(nameInput, { target: { value: '测试提示' } });

    const contentInput = screen.getByLabelText('内容');
    fireEvent.change(contentInput, { target: { value: '这是一个测试提示' } });

    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('提示创建成功')).toBeInTheDocument();
    });
  });
});
```

#### 9.2 E2E测试

```typescript
// e2e/prompt-management.spec.ts
import {test, expect} from '@playwright/test';

test.describe('智能提示管理', () => {
	test('完整提示管理流程', async ({page}) => {
		await page.goto('/prompts');

		// 创建新提示
		await page.click('button:has-text("创建提示")');
		await page.fill('[name="name"]', '睡前故事提示');
		await page.fill('[name="content"]', '生成一个关于{{主题}}的睡前故事');
		await page.click('button:has-text("保存")');

		// 验证提示创建
		await expect(page.locator('text=睡前故事提示')).toBeVisible();

		// 测试提示使用
		await page.goto('/generate');
		await page.click('button:has-text("使用提示")');
		await page.click('text=睡前故事提示');
		await page.fill('[placeholder="主题"]', '森林');
		await expect(page.locator('text=生成一个关于森林的睡前故事')).toBeVisible();
	});
});
```

### 10. 部署配置

#### 10.1 Next.js配置优化

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverActions: true,
		optimizeCss: true,
		optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
	},
	images: {
		domains: ['cdn.example.com', 'titan-assets.com'],
		formats: ['image/webp', 'image/avif'],
	},
	env: {
		CUSTOM_KEY: 'my-value',
	},
	webpack: (config, {isServer}) => {
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
			};
		}
		return config;
	},
};

module.exports = nextConfig;
```

### 11. 开发检查清单

#### 11.1 功能完整性检查

- [ ] 智能提示创建/编辑/删除
- [ ] 提示变量动态渲染
- [ ] AI提示生成和优化
- [ ] ASMR素材上传和管理
- [ ] WebDAV文件集成
- [ ] 素材智能分类
- [ ] Step1内容创作增强
- [ ] Step3音景选择增强
- [ ] API Demo验证页面
- [ ] 响应式设计适配

#### 11.2 性能优化检查

- [ ] 虚拟化列表实现
- [ ] 图片懒加载
- [ ] 代码分割
- [ ] 缓存策略配置
- [ ] 防抖/节流处理

#### 11.3 测试覆盖率

- [ ] 单元测试 > 80%
- [ ] 集成测试 > 70%
- [ ] E2E测试关键路径
- [ ] 性能测试通过

#### 11.4 部署准备

- [ ] 环境变量配置
- [ ] CDN配置
- [ ] 监控集成
- [ ] 错误追踪配置
