import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CronModule } from './cron/cron.module';
import { AuthModule } from './auth/auth.module';
import { OperationsModule } from './operations/operations.module';
import { LocationsModule } from './locations/locations.module';
import { UsersModule } from './users/users.module';
import { IntegrationJobsModule } from './integration-jobs/integration-jobs.module';
import { CompaniesModule } from './companies/companies.module';
import { AccountsModule } from './accounts/accounts.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { FileStorageService } from './common/services/file-storage.service';
import { MinioStorageService } from './common/services/minio-storage.service';
import { VercelStorageService } from './common/services/vercel-storage.service';
import { PaginationService } from './common/services/pagination.service';
import { envValidationSchema } from './config/env.validation';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      load: [configuration],
    }),
    DatabaseModule,
    CronModule,
    AuthModule,
    OperationsModule,
    LocationsModule,
    UsersModule,
    IntegrationJobsModule,
    CompaniesModule,
    AccountsModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    FileStorageService,
    MinioStorageService,
    VercelStorageService,
    PaginationService,
  ],
})
export class AppModule {}
