import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { GenerateApiDto } from './dto/generate-api.dto';
import { readFileSync, writeFileSync } from 'fs';
import { WriteFile } from 'src/common/interfaces/writeFile.interface';
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
    const { api_name, data } = generateApiDto;
    //Get a unique code
    const code = await this.generateUniqueShortCode();

    try {
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
    paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto> {
    const { limit, page } = paginationDto;

    const customAPI = await this.customAPI.findUnique({
      where: {
        code: code,
      },
      include: {
        records: true,
      },
    });

    if (!customAPI) throw new BadRequestException('Code not found');

    const data = customAPI.records.find(
      (record) => record.api_name === api_name,
    ).data as Prisma.JsonArray;

    if (!data) throw new BadRequestException('API not found');

    if (limit && page) {
      const count = data.length;
      const totalPages = Math.ceil(count / limit);

      console.log(Object.entries(data));
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

  async getDataById(code: string, api_name: string, id: string) {
    const customAPI = await this.customAPI.findUnique({
      where: {
        code: code,
      },
      include: {
        records: true,
      },
    });

    if (!customAPI) throw new BadRequestException('Code not found');

    const data = customAPI.records.find(
      (record) => record.api_name === api_name,
    ).data;

    const parsedData = JSON.parse(
      JSON.stringify(data),
    ) as RecordDataInterface[];

    const result = parsedData.find((item) => item.id == +id);

    if (!result) throw new BadRequestException(`Data with id: ${id} not found`);

    return result;
  }

  async createData(code: string, api_name: string, data: any) {
    const existingUrl = await this.customAPI.findUnique({
      where: {
        code: code,
      },
    });

    if (!existingUrl) throw new BadRequestException('Code not found');

    const oldData: string = JSON.parse(
      readFileSync(`data/${code}.json`, { encoding: 'utf-8' }),
    );

    console.log(typeof data);

    oldData[api_name].data.push(data);
    console.log(oldData);

    this.writeFile({ code, data: JSON.stringify(oldData) });

    return { message: 'Data created successfully' };
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

  private writeFile({ code, data }: WriteFile) {
    try {
      writeFileSync(`data/${code}.json`, data);
    } catch (error) {
      throw new BadRequestException(
        'Failed to write data to file. Please try again later.',
      );
    }
  }
}
