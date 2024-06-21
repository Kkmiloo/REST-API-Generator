import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { GenerateApiDto } from './dto/generate-api.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponseDto } from 'src/common/dto/paginationResponse.dto';
import { RecordDataInterface } from './interfaces/recordData.interface';

@Injectable()
export class CustomApiService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(CustomApiService.name);
  async onModuleInit() {
    await this.$connect();
  }

  async generateApi(generateApiDto: GenerateApiDto) {
    try {
      const { api_name, data } = generateApiDto;
      //Get a unique code
      const code = await this.generateUniqueShortCode();

      const api = await this.customAPI.create({
        data: {
          code,
          records: {
            create: {
              api_name: api_name,
              data: data,
            },
          },
        },
      });

      return { ...api, api_name };
    } catch (error) {
      this.logger.log(error);

      throw new BadRequestException(
        'Failed to create API. Please try again later.',
      );
    }
  }

  async getAllData(
    code: string,
    api_name: string,
    paginationDto?: PaginationDto,
  ): Promise<PaginationResponseDto> {
    const customAPI = await this.customAPI.findUnique({
      where: {
        code: code,
      },
      include: {
        records: true,
      },
    });

    if (!customAPI) throw new BadRequestException('Code not found');

    const recordData = customAPI.records.find(
      (record) => record.api_name == api_name,
    );

    if (!recordData) throw new BadRequestException('API not found');

    const data = JSON.parse(
      JSON.stringify(recordData.data),
    ) as RecordDataInterface[];

    if (paginationDto && paginationDto.limit && paginationDto.page) {
      const { page = 1, limit = 10 } = paginationDto;
      const count = data.length;
      const totalPages = Math.ceil(count / limit);

      return {
        result: data.slice(page * limit - limit, page * limit),
        metadata: {
          count,
          perPage: limit,
          currentPage: page,
          nextPage:
            page < totalPages ? `?page=${page + 1}&limit=${limit}` : null,
          prevPage:
            page > 1 && page <= totalPages
              ? `?page=${page - 1}&limit=${limit}`
              : null,
        },
      };
    }

    return { result: data };
  }

  async getDataById(code: string, api_name: string, id: number) {
    const recordData = await this.getAllData(code, api_name);

    console.log(recordData);

    const parsedData = JSON.parse(
      JSON.stringify(recordData.result),
    ) as RecordDataInterface[];

    const result = parsedData.find((item) => item.id == id);

    if (!result) throw new BadRequestException(`Data with id: ${id} not found`);

    return result;
  }

  async createData(code: string, api_name: string, data: RecordDataInterface) {
    const customAPI = await this.customAPI.findUnique({
      where: {
        code: code,
      },
      include: {
        records: true,
      },
    });

    if (!customAPI) throw new BadRequestException('Code not found');

    const recordData = customAPI.records.find(
      (record) => record.api_name == api_name,
    );

    if (!recordData) throw new BadRequestException('API not found');

    const parsedData = JSON.parse(
      JSON.stringify(recordData.data),
    ) as RecordDataInterface[];

    if (parsedData.find((item) => item.id == data.id)) {
      throw new BadRequestException(`Data with id ${data.id} already exists`);
    }

    parsedData.push(data);
    try {
      await this.dataRecord.update({
        where: {
          id: recordData.id,
        },
        data: {
          data: parsedData,
        },
      });

      return data;
    } catch (error) {
      console.log(error);
    }
  }

  private generateRandomString() {
    const ALPHABET =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const numCharShort = 6;
    let result = '';

    for (let i = 0; i < numCharShort; i++) {
      const randomIndex = Math.floor(Math.random() * (ALPHABET.length - 1));
      result += ALPHABET[randomIndex];
    }

    return result;
  }

  private async generateUniqueShortCode() {
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      code = this.generateRandomString();

      const existingUrl = await this.customAPI.findUnique({
        where: {
          code: code,
        },
      });

      if (!existingUrl) {
        isUnique = true;
      }
    }

    return code;
  }
}
