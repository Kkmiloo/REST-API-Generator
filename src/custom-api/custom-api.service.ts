import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { GenerateApiDto } from './dto/generate-api.dto';
import { readFileSync, writeFileSync } from 'fs';
import { WriteFile } from 'src/common/interfaces/writeFile.interface';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CustomApiService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async generateApi(generateApiDto: GenerateApiDto) {
    const { api_name, data } = generateApiDto;
    //Get a unique code
    const code = await this.generateUniqueShortCode();
    //transform the data into an JSON
    const dataJson = JSON.stringify({ [api_name]: data });
    //Saving the data in local
    this.writeFile({ code, data: dataJson });

    try {
      const api = await this.customAPI.create({
        data: {
          api_name: api_name,
          code,
        },
      });
      return { api };
    } catch (error) {
      throw new BadRequestException(
        'Failed to create API. Please try again later.',
      );
    }
  }

  async getAllData(
    code: string,
    api_name: string,
    paginationDto: PaginationDto,
  ) {
    const { limit, page } = paginationDto;

    const existingUrl = await this.customAPI.findUnique({
      where: {
        code: code,
      },
    });

    if (!existingUrl) throw new BadRequestException('Code not found');

    const data = JSON.parse(
      readFileSync(`data/${code}.json`, { encoding: 'utf-8' }),
    );

    if (!data[api_name]) throw new BadRequestException('API not found');

    if (limit && page) {
      const totalEntries = data[api_name].length;
      const totalPages = Math.ceil(data[api_name].length / limit);
      const lastPage = totalPages;

      return {
        data: data[api_name].slice(page * limit - limit, page * limit),
        metadata: {
          totalEntries,
          perPage: limit,
          currentPage: page,
          lastPage,
          nextPage: page < lastPage ? `?page=${page + 1}&limit=${limit}` : null,
          prevPage: page > 1 ? `?page=${page + 1}&limit=${limit}` : null,
        },
      };
    }

    return data[api_name];
  }

  async getDataById(code: string, api_name: string, id: string) {
    const existingUrl = await this.customAPI.findUnique({
      where: {
        code: code,
      },
    });

    if (!existingUrl) throw new BadRequestException('Code not found');

    const data = JSON.parse(
      readFileSync(`data/${code}.json`, { encoding: 'utf-8' }),
    );

    console.log(data);

    const result = data[api_name].find((item) => item.id === +id);

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
