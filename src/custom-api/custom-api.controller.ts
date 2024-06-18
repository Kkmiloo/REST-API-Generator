import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CustomApiService } from './custom-api.service';
import { GenerateApiDto } from './dto/generate-api.dto';

@Controller('')
export class CustomApiController {
  constructor(private readonly customApiService: CustomApiService) {}

  @Post('/generate')
  generateApi(@Body() generateApiDto: GenerateApiDto) {
    return this.customApiService.generateApi(generateApiDto);
  }

  @Get(':code/:api_name')
  getAllData(@Param('code') code: string, @Param('api_name') api_name: string) {
    return this.customApiService.getAllData(code, api_name);
  }
}
