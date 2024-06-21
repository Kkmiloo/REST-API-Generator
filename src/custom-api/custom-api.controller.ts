import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { CustomApiService } from './custom-api.service';
import { GenerateApiDto } from './dto/generate-api.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RecordData } from './dto/recordData.dto';

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
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.customApiService.getDataById(code, api_name, id);
  }

  @Post(':code/:api_name')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      forbidUnknownValues: false,
    }),
  )
  createData(
    @Param('code') code: string,
    @Param('api_name') api_name: string,
    @Body()
    data: RecordData,
  ) {
    return this.customApiService.createData(code, api_name, data);
  }
}
