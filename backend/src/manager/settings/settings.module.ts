import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerSettingsController } from './settings.controller';
import { ManagerSettingsService } from './settings.service';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [ManagerSettingsController],
  providers: [ManagerSettingsService],
  exports: [ManagerSettingsService],
})
export class ManagerSettingsModule {}
