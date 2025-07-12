'use client';

import {useState, type JSX} from 'react';
import {CheckCircle, Loader2, AlertCircle} from 'lucide-react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Separator} from '@/components/ui/separator';
import {useASMRStore} from '@/store/asmr/asmr.store';
import {ASMRApiService} from '@/lib/services/asmr-api.service';

export function Step5Review(): JSX.Element {
  const {formData, isSubmitting, setSubmitting, setError, addJob, estimatedCost, setEstimatedCost} = useASMRStore();

  const [jobCreated, setJobCreated] = useState(false);

  const handleEstimateCost = async () => {
    try {
      if (formData.text && formData.voiceSettings && formData.soundscapeConfig && formData.mixingSettings) {
        const cost = await ASMRApiService.estimateCost(formData as any);
        setEstimatedCost(cost);
      }
    } catch (error) {
      console.error('成本估算失败:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!formData.text || !formData.voiceSettings || !formData.soundscapeConfig || !formData.mixingSettings) {
        throw new Error('请完成所有必需的配置');
      }

      const job = await ASMRApiService.createJob(formData as any);
      addJob(job);
      setJobCreated(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : '创建任务失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (jobCreated) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h3 className="text-xl font-semibold">ASMR音频生成任务已创建！</h3>
        <p className="text-muted-foreground">您的音频正在生成中，请前往任务列表查看进度。</p>
        <Button onClick={() => (globalThis.location.href = '/dashboard')}>查看任务进度</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 配置总览 */}
      <Card>
        <CardHeader>
          <CardTitle>配置总览</CardTitle>
          <CardDescription>请确认您的ASMR音频配置设置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 文本内容 */}
          <div>
            <h4 className="font-medium mb-2">文本内容</h4>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm line-clamp-3">{formData.text || '未设置'}</p>
            </div>
            <div className="text-xs text-muted-foreground mt-1">字符数: {formData.text?.length || 0}</div>
          </div>

          <Separator />

          {/* 语音设置 */}
          <div>
            <h4 className="font-medium mb-2">语音设置</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">语音ID:</span>
                <span className="ml-2">{formData.voiceSettings?.voiceId || '未选择'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">稳定性:</span>
                <span className="ml-2">{Math.round((formData.voiceSettings?.stability || 0.85) * 100)}%</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* 音景设置 */}
          <div>
            <h4 className="font-medium mb-2">音景设置</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">时长:</span>
                <span className="ml-2">{formData.soundscapeConfig?.duration || 300}秒</span>
              </div>
              <div>
                <span className="text-muted-foreground">质量:</span>
                <Badge variant="secondary">{formData.soundscapeConfig?.quality || 'high'}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* 质量要求 */}
          <div>
            <h4 className="font-medium mb-2">质量要求</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">最低评分:</span>
                <span className="ml-2">{formData.qualityRequirements?.minimumScore || 6}/10</span>
              </div>
              <div>
                <span className="text-muted-foreground">自动重试:</span>
                <Badge variant={formData.qualityRequirements?.enableAutoRetry ? 'default' : 'secondary'}>
                  {formData.qualityRequirements?.enableAutoRetry ? '启用' : '禁用'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 成本估算 */}
      <Card>
        <CardHeader>
          <CardTitle>成本估算</CardTitle>
          <CardDescription>AI服务使用费用预估</CardDescription>
        </CardHeader>
        <CardContent>
          {estimatedCost ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>语音合成:</span>
                <span>${estimatedCost.voiceCost.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span>音景生成:</span>
                <span>${estimatedCost.soundscapeCost.toFixed(4)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>总计:</span>
                <span>
                  ${estimatedCost.totalCost.toFixed(4)} {estimatedCost.currency}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Button variant="outline" onClick={handleEstimateCost}>
                计算预估费用
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 生产优化提示 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-blue-900">生产就绪确认</h4>
              <p className="text-sm text-blue-800">
                配置已优化为适合中老年听众的专业ASMR内容，包括清晰发音、舒缓节奏和高质量音频输出。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 提交按钮 */}
      <div className="flex justify-end">
        <Button disabled={isSubmitting || !formData.text} size="lg" className="min-w-[140px]" onClick={handleSubmit}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              创建中...
            </>
          ) : (
            '开始生成ASMR音频'
          )}
        </Button>
      </div>
    </div>
  );
}
