import { Module } from '@nestjs/common';
import { ClientAuditsController } from './audits.controller';
import { ClientAuditsService } from './audits.service';

@Module({ controllers: [ClientAuditsController], providers: [ClientAuditsService], exports: [ClientAuditsService] })
export class ClientAuditsModule {}