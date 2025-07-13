import {Module} from '@nestjs/common';
import {MikroOrmModule} from '@mikro-orm/nestjs';
import {ProjectMaterial} from '../project-material/entities/project-material.entity';
import {Asset} from '../asset/entities/asset.entity';
import {ProjectAsset} from '../asset/entities/project-asset.entity';
import {Project} from './entities/project.entity';
import {ProjectService} from './project.service';
import {ProjectController} from './project.controller';

@Module({
	imports: [MikroOrmModule.forFeature([Project, ProjectMaterial, Asset, ProjectAsset])],
	providers: [ProjectService],
	controllers: [ProjectController],
	exports: [ProjectService],
})
export class ProjectModule {}
