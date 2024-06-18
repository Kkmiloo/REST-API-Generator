import { IsArray, IsString } from 'class-validator';

export class GenerateApiDto {
  @IsArray()
  data: any;

  @IsString()
  api_name: string;
}
