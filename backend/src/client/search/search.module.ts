import { Module } from '@nestjs/common';
import { ClientSearchController } from './search.controller';
import { ClientSearchService } from './search.service';

@Module({ controllers: [ClientSearchController], providers: [ClientSearchService], exports: [ClientSearchService] })
export class ClientSearchModule {}