import { Module } from '@nestjs/common';
import { ApiModule } from './modules/api.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ApiModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
