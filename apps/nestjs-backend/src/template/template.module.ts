import {Module} from '@nestjs/common';
import {MikroOrmModule} from '@mikro-orm/nestjs';
import {TemplateController} from './template.controller';
import {TemplateService} from './template.service';
import {ContentTemplate} from './entities/content-template.entity';

@Module({
  imports: [MikroOrmModule.forFeature([ContentTemplate])],
  controllers: [TemplateController],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule {}
