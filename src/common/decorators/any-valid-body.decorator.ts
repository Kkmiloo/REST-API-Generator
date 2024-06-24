import { ValidationPipe } from '@nestjs/common';
import { RawBody } from './raw-body.decorator';

export const AnyValidBody = () =>
  RawBody(
    new ValidationPipe({
      validateCustomDecorators: true,
      whitelist: false,
      forbidNonWhitelisted: false,
    }),
  );
