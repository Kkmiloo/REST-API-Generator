import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { GenerateApiDto } from './dto/generate-api.dto';
import { readFileSync, writeFileSync } from 'fs';
import { WriteFile } from 'src/common/interfaces/writeFile.interface';

@Injectable()
export class CustomApiService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  getHello(): string {
    return 'Hello World!';
  }

  async generateApi(generateApiDto: GenerateApiDto) {
    const { api_name, data } = generateApiDto;
    const code = await this.generateUniqueShortCode();
    const dataJson = JSON.stringify(data);
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

  async getAllData(code: string, api_name: string) {
    const existingUrl = await this.customAPI.findUnique({
      where: {
        code: code,
      },
    });

    console.log(existingUrl);

    if (!existingUrl) throw new BadRequestException('Code not found');

    const data = JSON.parse(
      readFileSync(`data/${code}.json`, { encoding: 'utf-8' }),
    );

    return data;
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
    } catch (error) {}
  }
}
