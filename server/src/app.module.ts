import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD } from '@nestjs/core';
import { env } from './config/env';

import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { UsersModule } from './modules/users/users.module';
import { CompanyModule } from './modules/company/company.module';
import { PartiesModule } from './modules/parties/parties.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          env.NODE_ENV === 'production'
            ? undefined
            : { target: 'pino-pretty', options: { singleLine: true } },
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || process.env.MONGO_URI || env.MONGO_URI),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),

    AuthModule,
    UsersModule,
    CompanyModule,
    PartiesModule,
    CatalogModule,
    DocumentsModule,
    PaymentsModule,
    ExpensesModule,
    InventoryModule,
    DashboardModule,
    ReportsModule,
    PdfModule,
    AuditModule,
    NotificationsModule,
    AdminModule,
  ],
  providers: [
    // JWT auth is global; individual routes opt out with @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
