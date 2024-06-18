import { Module } from '@nestjs/common';
import { CustomApiService } from './custom-api.service';
import { CustomApiController } from './custom-api.controller';

@Module({
  controllers: [CustomApiController],
  providers: [CustomApiService],
})
export class CustomApiModule {}
