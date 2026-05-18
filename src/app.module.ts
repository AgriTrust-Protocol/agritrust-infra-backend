import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CertificationsModule } from './resources/certifications/certifications.module';
import { StellarModule } from './stellar/stellar.module';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    StellarModule,
    CertificationsModule,
  ],
})
export class AppModule {}
