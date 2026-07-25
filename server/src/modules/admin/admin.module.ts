import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Company, CompanySchema } from '../company/company.schema';
import { User, UserSchema } from '../users/user.schema';
import { BusinessDocument, BusinessDocumentSchema } from '../documents/document.schema';
import { Payment, PaymentSchema } from '../payments/payment.schema';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: User.name, schema: UserSchema },
      { name: BusinessDocument.name, schema: BusinessDocumentSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
