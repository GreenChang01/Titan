import {Entity, Property, Enum, Index} from '@mikro-orm/core';
import {BaseEntity} from '../../common/entities/base-entity.entity';
import {JobType, JobStatus} from '../../common/enums';

/**
 * 内容生成任务实体
 *
 * 存储ASMR内容生成任务的完整生命周期信息
 * 包括任务配置、执行状态、进度跟踪和结果输出
 *
 * 主要功能：
 * - 任务队列管理和状态跟踪
 * - 输入素材和输出结果的关联
 * - 执行时间和错误信息记录
 * - 支持不同类型的内容生成任务
 *
 * 业务流程：
 * 1. 任务创建时状态为QUEUED
 * 2. 开始处理时更新为PROCESSING，记录startedAt
 * 3. 处理过程中更新progress字段
 * 4. 完成时状态变为COMPLETED或FAILED，记录completedAt
 *
 * @example
 * ```typescript
 * const job = new ContentJob();
 * job.userId = "user-uuid";
 * job.projectId = "project-uuid";
 * job.templateId = "template-uuid";
 * job.jobType = JobType.ASMR_GENERATION;
 * job.inputAssets = [
 *   { assetId: "asset-1", slotName: "voice", parameters: { speed: 1.2 } }
 * ];
 * ```
 */
@Entity()
@Index({properties: ['userId', 'status']}) // 用户任务状态查询优化
@Index({properties: ['status', 'createdAt']}) // 任务队列按时间排序优化
export class ContentJob extends BaseEntity {
	/** 任务所属用户ID，用于权限控制和任务隔离 */
	@Property()
	userId!: string;

	/** 关联的项目ID，可选，用于组织和分类任务 */
	@Property({nullable: true})
	projectId?: string;

	/** 使用的模板ID，定义任务的处理流程和参数 */
	@Property()
	templateId!: string;

	/** 任务类型，支持多种内容生成类型 */
	@Enum(() => JobType)
	jobType!: JobType;

	/**
	 * 任务执行状态
	 * - QUEUED: 已排队等待处理
	 * - PROCESSING: 正在处理中
	 * - COMPLETED: 处理完成
	 * - FAILED: 处理失败
	 * - CANCELLED: 已取消
	 */
	@Enum(() => JobStatus)
	status: JobStatus = JobStatus.QUEUED;

	/**
	 * 输入素材配置数组
	 * 定义任务所需的所有输入资源和参数
	 *
	 * 数组元素结构：
	 * - assetId: 素材的唯一标识符
	 * - slotName: 素材在模板中的插槽名称（如voice、background、effect）
	 * - parameters: 可选的处理参数（如音量、速度、特效设置）
	 */
	@Property({type: 'json'})
	inputAssets: Array<{
		/** 素材唯一标识符 */
		assetId: string;
		/** 模板插槽名称 */
		slotName: string;
		/** 可选处理参数 */
		parameters?: Record<string, any>;
	}> = [];

	/** 任务输出文件路径，处理完成后设置 */
	@Property({nullable: true})
	outputPath?: string;

	/** 任务执行进度，0-100的整数值 */
	@Property({type: 'integer', default: 0})
	progress = 0;

	/** 错误信息，任务失败时记录详细错误描述 */
	@Property({nullable: true})
	errorMessage?: string;

	/** 任务处理总耗时，毫秒数，用于性能分析 */
	@Property({type: 'integer', nullable: true})
	processingTime?: number;

	/** 任务开始处理时间，状态变为PROCESSING时设置 */
	@Property({nullable: true})
	startedAt?: Date;

	/** 任务完成时间，状态变为COMPLETED或FAILED时设置 */
	@Property({nullable: true})
	completedAt?: Date;
}
