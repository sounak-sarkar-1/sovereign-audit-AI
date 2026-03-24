import { Module } from '@nestjs/common';
import { ClientInsightsController } from './insights.controller';
import { ClientInsightsService } from './insights.service';

@Module({ controllers: [ClientInsightsController], providers: [ClientInsightsService], exports: [ClientInsightsService] })
export class ClientInsightsModule {}