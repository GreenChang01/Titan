import {Module} from '@nestjs/common';
import {MikroOrmModule} from '@mikro-orm/nestjs';
import {AIPrompt} from './entities/prompt.entity';
import {PromptTag} from './entities/prompt-tag.entity';
import {AIPromptService} from './services/ai-prompt.service';
import {AIPromptController} from './controllers/ai-prompt.controller';

/**
 * AI提示词管理模块
 * 包含提示词和标签的管理功能
 */
@Module({
	imports: [
		MikroOrmModule.forFeature([AIPrompt, PromptTag]),
	],
	controllers: [AIPromptController],
	providers: [AIPromptService],
	exports: [AIPromptService],
})
export class PromptsModule {}
