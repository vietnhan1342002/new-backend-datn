import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { mongooseConfig } from './config/mongoose.config';
import { ApiModule } from './modules/api.module';

@Module({
  imports: [
    // Cấu hình chung
    ConfigModule.forRoot({ isGlobal: true }),

    // Kết nối MongoDB
    MongooseModule.forRootAsync({
      useFactory: mongooseConfig,
      inject: [ConfigService],
    }),

    ApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
