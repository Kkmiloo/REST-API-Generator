import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Put,
  Patch,
  Delete,
} from '@nestjs/common';
import { CustomApiService } from './custom-api.service';
import { GenerateApiDto } from './dto/generate-api.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RecordData } from './dto/recordData.dto';

import { AnyValidBody } from 'src/common/decorators/any-valid-body.decorator';

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
  createData(
    @Param('code') code: string,
    @Param('api_name') api_name: string,
    @AnyValidBody()
    data: any,
  ) {
    console.log(data);
    console.log(typeof data);
    return this.customApiService.createData(code, api_name, data);
  }

  @Put(':code/:api_name/:id')
  updateAllData(
    @Param('code') code: string,
    @Param('api_name') api_name: string,
    @Param('id', ParseIntPipe) id: number,
    @AnyValidBody()
    data: any,
  ) {
    if (data.id) delete data.id;
    return this.customApiService.updateAllData(code, api_name, id, data);
  }

  @Patch(':code/:api_name/:id')
  updateData(
    @Param('code') code: string,
    @Param('api_name') api_name: string,
    @Param('id', ParseIntPipe) id: number,
    @AnyValidBody()
    data: any,
  ) {
    if (data.id) delete data.id;
    return this.customApiService.updateData(code, api_name, id, data);
  }

  @Delete(':code/:api_name/:id')
  deleteData(
    @Param('code') code: string,
    @Param('api_name') api_name: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.customApiService.deleteData(code, api_name, id);
  }
}
