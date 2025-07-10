import {Module} from '@nestjs/common';
import {MikroOrmModule} from '@mikro-orm/nestjs';
import {Project} from './entities/project.entity';
import {ProjectMaterial} from '../project-material/entities/project-material.entity';
import {ProjectService} from './project.service';
import {ProjectController} from './project.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Project, ProjectMaterial])],
  providers: [ProjectService],
  controllers: [ProjectController],
  exports: [ProjectService],
})
export class ProjectModule {}
