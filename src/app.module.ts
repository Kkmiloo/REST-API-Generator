import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { CommonModule } from './common/common.module';
import { CustomApiModule } from './custom-api/custom-api.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [UserModule, CommonModule, CustomApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: ':code/:api_name/:id', method: RequestMethod.PUT });
  }
}
