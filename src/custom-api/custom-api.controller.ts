import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CustomApiService } from './custom-api.service';
import { GenerateApiDto } from './dto/generate-api.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('')
export class CustomApiController {
  constructor(private readonly customApiService: CustomApiService) {}

  @Post('/generate')
  generateApi(@Body() generateApiDto: GenerateApiDto) {
    return this.customApiService.generateApi(generateApiDto);
  }

  @Get(':code/:api_name')
  getAllData(
    @Param('code') code: string,
    @Param('api_name') api_name: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.customApiService.getAllData(code, api_name, paginationDto);
  }

  @Get(':code/:api_name/:id')
  getDataById(
    @Param('code') code: string,
    @Param('api_name') api_name: string,
    @Param('id') id: string,
  ) {
    return this.customApiService.getDataById(code, api_name, id);
  }

  @Post(':code/:api_name')
  createData(
    @Param('code') code: string,
    @Param('api_name') api_name: string,
    @Body() data: any,
  ) {
    return this.customApiService.createData(code, api_name, data);
  }
}
