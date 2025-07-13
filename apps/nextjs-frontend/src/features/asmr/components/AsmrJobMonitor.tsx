'use client';

import React, {type JSX} from 'react';
import {
	CheckCircle, Clock, AlertCircle, Loader2, RefreshCw, Play, Download,
} from 'lucide-react';
import type {Job, JobStatus} from '@titan/shared';
import {useAsmrJobs, useAsmrJobProgress, useRetryAsmrJob} from '../hooks/useAsmr';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';
import {AudioPlayer} from '@/components/audio/audio-player';
import {cn} from '@/lib/utils';

type JobProgressMonitorProps = {
	readonly jobId: string;
	readonly onJobComplete?: (job: Job) => void;
	readonly className?: string;
};

export function JobProgressMonitor({jobId, onJobComplete, className}: JobProgressMonitorProps): JSX.Element {
	const {
		data: progress,
		error,
		refetch,
	} = useAsmrJobProgress(jobId, {
		onJobComplete, // Pass the callback directly to the hook
	});
	const retryMutation = useRetryAsmrJob({
		onSuccess() {
			void refetch(); // Refresh progress after retry
		},
	});

	const handleRetry = async () => {
		try {
			await retryMutation.mutateAsync(jobId);
		} catch (error) {
			console.error('重试失败:', error);
		}
	};

	const getStatusIcon = (status: JobStatus) => {
		switch (status) {
			case 'completed': {
				return <CheckCircle className='h-4 w-4 text-green-600'/>;
			}

			case 'failed': {
				return <AlertCircle className='h-4 w-4 text-red-600'/>;
			}

			case 'processing': {
				return <Loader2 className='h-4 w-4 text-blue-600 animate-spin'/>;
			}

			case 'queued':
			case 'pending': {
				return <Clock className='h-4 w-4 text-yellow-600'/>;
			}

			default: {
				return <Clock className='h-4 w-4 text-gray-600'/>;
			}
		}
	};

	const getStatusText = (status: JobStatus) => {
		switch (status) {
			case 'completed': {
				return '已完成';
			}

			case 'failed': {
				return '失败';
			}

			case 'processing': {
				return '处理中';
			}

			case 'queued': {
				return '队列中';
			}

			case 'pending': {
				return '等待中';
			}

			default: {
				return '未知状态';
			}
		}
	};

	const getStatusColor = (status: JobStatus) => {
		switch (status) {
			case 'completed': {
				return 'bg-green-100 text-green-800 border-green-200';
			}

			case 'failed': {
				return 'bg-red-100 text-red-800 border-red-200';
			}

			case 'processing': {
				return 'bg-blue-100 text-blue-800 border-blue-200';
			}

			case 'queued':
			case 'pending': {
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			}

			default: {
				return 'bg-gray-100 text-gray-800 border-gray-200';
			}
		}
	};

	if (error) {
		return (
			<Card className={cn('w-full', className)}>
				<CardContent className='p-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2 text-destructive'>
							<AlertCircle className='h-4 w-4'/>
							<span className='text-sm'>加载任务进度失败</span>
						</div>
						<Button variant='outline' size='sm' onClick={async () => refetch()}>
							<RefreshCw className='h-4 w-4 mr-2'/>
							重新加载
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!progress) {
		return (
			<Card className={cn('w-full', className)}>
				<CardContent className='p-4'>
					<div className='flex items-center justify-center'>
						<Loader2 className='h-4 w-4 animate-spin mr-2'/>
						<span className='text-sm text-muted-foreground'>加载中...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={cn('w-full', className)}>
			<CardHeader className='pb-4'>
				<div className='flex items-center justify-between'>
					<div className='space-y-1'>
						<CardTitle className='text-base flex items-center gap-2'>
							{getStatusIcon(progress.status)}
							ASMR音频生成任务
						</CardTitle>
						<CardDescription>任务ID: {progress.jobId}</CardDescription>
					</div>
					<Badge className={getStatusColor(progress.status)}>{getStatusText(progress.status)}</Badge>
				</div>
			</CardHeader>

			<CardContent className='space-y-4'>
				{/* Progress Bar */}
				{(progress.status === 'processing' || progress.status === 'queued') && (
					<div className='space-y-2'>
						<div className='flex justify-between text-sm'>
							<span>进度</span>
							<span>{progress.progress}%</span>
						</div>
						<Progress value={progress.progress} className='w-full'/>
						{progress.currentStep
							? (
								<p className='text-xs text-muted-foreground'>当前步骤: {progress.currentStep}</p>
							)
							: null}
						{progress.estimatedTimeRemaining
							? (
								<p className='text-xs text-muted-foreground'>
									预计剩余时间: {Math.round(progress.estimatedTimeRemaining / 60)} 分钟
								</p>
							)
							: null}
					</div>
				)}

				{/* Error Message */}
				{progress.status === 'failed' && progress.error
					? (
						<div className='p-3 bg-red-50 border border-red-200 rounded-md'>
							<div className='flex items-start gap-2'>
								<AlertCircle className='h-4 w-4 text-red-600 mt-0.5'/>
								<div className='space-y-1'>
									<p className='text-sm font-medium text-red-800'>错误信息</p>
									<p className='text-xs text-red-700'>{progress.error}</p>
								</div>
							</div>
						</div>
					)
					: null}

				{/* Completed Status with Audio Player */}
				{progress.status === 'completed' && (
					<div className='space-y-3'>
						<div className='p-3 bg-green-50 border border-green-200 rounded-md'>
							<div className='flex items-center gap-2'>
								<CheckCircle className='h-4 w-4 text-green-600'/>
								<p className='text-sm font-medium text-green-800'>ASMR音频生成完成！</p>
							</div>
						</div>

						{/* Audio Player - placeholder for now */}
						<div className='p-4 bg-muted/50 rounded-md'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<Play className='h-4 w-4 text-muted-foreground'/>
									<span className='text-sm text-muted-foreground'>音频文件已生成</span>
								</div>
								<Button variant='outline' size='sm'>
									<Download className='h-4 w-4 mr-2'/>
									下载
								</Button>
							</div>
						</div>
					</div>
				)}

				{/* Action Buttons */}
				<div className='flex justify-end gap-2'>
					{progress.status === 'failed' && (
						<Button variant='outline' size='sm' disabled={retryMutation.isPending} onClick={handleRetry}>
							{retryMutation.isPending
								? (
									<Loader2 className='h-4 w-4 mr-2 animate-spin'/>
								)
								: (
									<RefreshCw className='h-4 w-4 mr-2'/>
								)}
							重试
						</Button>
					)}
					<Button variant='ghost' size='sm' onClick={async () => refetch()}>
						<RefreshCw className='h-4 w-4 mr-2'/>
						刷新
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

// Job List Component
type JobListProps = {
	readonly className?: string;
};

export function JobList({className}: JobListProps): JSX.Element {
	const {data: jobsData, error, refetch} = useAsmrJobs({limit: 10});

	if (error) {
		return (
			<Card className={cn('w-full', className)}>
				<CardHeader>
					<CardTitle>任务列表</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex items-center justify-center py-8'>
						<div className='text-center space-y-2'>
							<AlertCircle className='h-8 w-8 text-muted-foreground mx-auto'/>
							<p className='text-sm text-muted-foreground'>加载任务列表失败</p>
							<Button variant='outline' size='sm' onClick={async () => refetch()}>
								重新加载
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!jobsData) {
		return (
			<Card className={cn('w-full', className)}>
				<CardHeader>
					<CardTitle>任务列表</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex items-center justify-center py-8'>
						<Loader2 className='h-4 w-4 animate-spin mr-2'/>
						<span className='text-sm text-muted-foreground'>加载中...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	const {jobs = []} = jobsData;

	return (
		<Card className={cn('w-full', className)}>
			<CardHeader>
				<CardTitle>最近的ASMR任务</CardTitle>
				<CardDescription>您的音频生成任务历史</CardDescription>
			</CardHeader>
			<CardContent>
				{jobs.length === 0 ? (
					<div className='text-center py-8'>
						<Clock className='h-8 w-8 text-muted-foreground mx-auto mb-2'/>
						<p className='text-sm text-muted-foreground'>暂无任务</p>
					</div>
				) : (
					<div className='space-y-4'>
						{jobs.map(job => (
							<JobProgressMonitor
								key={job.id}
								jobId={job.id}
								onJobComplete={completedJob => {
									console.log('任务完成:', completedJob);
									void refetch(); // 刷新任务列表
								}}
							/>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
