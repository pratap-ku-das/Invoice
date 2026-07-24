import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './company.schema';
import { NumberSequence, NumberSequenceSchema } from './number-sequence.schema';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { NumberSequenceService } from './number-sequence.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: NumberSequence.name, schema: NumberSequenceSchema },
    ]),
  ],
  controllers: [CompanyController],
  providers: [CompanyService, NumberSequenceService],
  exports: [CompanyService, NumberSequenceService, MongooseModule],
})
export class CompanyModule {}
