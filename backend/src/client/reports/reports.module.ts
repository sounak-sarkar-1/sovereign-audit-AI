import { Module } from '@nestjs/common';
import { ClientReportsController } from './reports.controller';
import { ClientReportsService } from './reports.service';

@Module({ controllers: [ClientReportsController], providers: [ClientReportsService], exports: [ClientReportsService] })
export class ClientReportsModule {}