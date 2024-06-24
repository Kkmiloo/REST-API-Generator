import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
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

      const api = await this.api.create({
        data: {
          code,
          name: api_name,
          apiData: {
            create: {
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
    const customAPI = await this.api.findUnique({
      where: {
        code: code,
      },
      include: {
        apiData: true,
      },
    });

    if (!customAPI) throw new BadRequestException('Code not found');

    const apiData = customAPI.apiData;

    if (!apiData) throw new BadRequestException('API not found');

    const data = apiData[0].data as RecordDataInterface[];

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

    const parsedData = recordData.result as RecordDataInterface[];

    const result = parsedData.find((item) => item.id == id);

    if (!result) throw new BadRequestException(`Data with id: ${id} not found`);

    return result;
  }

  async createData(code: string, api_name: string, data: any) {
    const customAPI = await this.api.findUnique({
      where: {
        code: code,
        name: api_name,
      },
      include: {
        apiData: true,
      },
    });

    if (!customAPI) throw new BadRequestException('Code not found');

    const apiData = customAPI.apiData[0];

    if (!apiData) throw new BadRequestException('API not found');

    const oldData = apiData.data as RecordDataInterface[];

    if (data.id) {
      const existData = oldData.find((item) => data.id && item.id == data.id);

      if (existData)
        throw new BadRequestException(
          `Data with id: ${data.id} already exists`,
        );
    }

    const sortedData = oldData.sort((a, b) => a.id - b.id)[oldData.length - 1];
    data.id = sortedData.id + 1;
    const newData = [...oldData, data];

    try {
      await this.apiData.update({
        where: {
          id: apiData.id,
        },
        data: {
          data: newData,
        },
      });

      return newData;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(
        'Failed to create data. Please try again later.',
      );
    }
  }

  async updateData(
    code: string,
    api_name: string,
    id: number,
    data: RecordDataInterface,
  ) {
    const api = await this.api.findUnique({
      where: {
        code: code,
        name: api_name,
      },
      include: {
        apiData: true,
      },
    });

    if (!api) throw new BadRequestException('Code or api name not found');

    const recordData = api.apiData[0].data as RecordDataInterface[];

    const dataExists = recordData.find((item) => item.id == id);

    if (!dataExists)
      throw new BadRequestException(`Data with id ${id} not found`);

    const index = recordData.findIndex((item) => item.id == id);

    if (index == -1)
      throw new BadRequestException(`Data with id ${id} not found`);

    recordData[index] = { id: recordData[index].id, ...data };

    try {
      const updatedData = await this.apiData.update({
        where: {
          id: api.apiData[0].id,
        },
        data: {
          data: recordData,
        },
      });

      return updatedData.data[index];
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Failed to update data. Please try again later.',
      );
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

      const existingUrl = await this.api.findUnique({
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
