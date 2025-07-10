import {Module} from '@nestjs/common';
import {MikroOrmModule} from '@mikro-orm/nestjs';
import {AliyunDriveConfig} from './entities/aliyun-drive-config.entity';
import {AliyunDriveService} from './aliyun-drive.service';
import {AliyunDriveController} from './aliyun-drive.controller';

@Module({
  imports: [MikroOrmModule.forFeature([AliyunDriveConfig])],
  providers: [AliyunDriveService],
  controllers: [AliyunDriveController],
  exports: [AliyunDriveService],
})
export class AliyunDriveModule {}
