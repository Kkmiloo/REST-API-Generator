import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { GenerateApiDto } from './dto/generate-api.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/generate')
  generateApi(@Body() generateApiDto: GenerateApiDto) {
    return this.appService.generateApi(generateApiDto);
  }

  @Get()
  @Render('index')
  root() {
    return { message: 'Hello world222!' };
  }
}
