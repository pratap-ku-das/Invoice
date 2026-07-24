import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Party, PartySchema } from './party.schema';
import { PartiesService } from './parties.service';
import { CustomersController, SuppliersController } from './parties.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Party.name, schema: PartySchema }])],
  controllers: [CustomersController, SuppliersController],
  providers: [PartiesService],
  exports: [PartiesService, MongooseModule],
})
export class PartiesModule {}
