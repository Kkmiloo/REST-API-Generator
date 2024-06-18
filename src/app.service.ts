import { Injectable, OnModuleInit } from '@nestjs/common';
import { GenerateApiDto } from './dto/generate-api.dto';
import { PrismaClient } from '@prisma/client';
import { write, writeFileSync } from 'fs';

@Injectable()
export class AppService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  getHello(): string {
    return 'Hello World!';
  }

  async generateApi(generateApiDto: GenerateApiDto) {
    const code = await this.generateUniqueShortCode();

    const data = {
      code,
      data: generateApiDto.data,
    };
    this.writeFile({ code, data });
    return { generateApiDto };
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

  private writeFile({ code, data }) {
    writeFileSync('test.txt', 'Hello World');
  }
}
