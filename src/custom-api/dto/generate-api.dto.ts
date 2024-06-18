import { Transform } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

export class GenerateApiDto {
  @IsArray()
  data: any;

  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  api_name: string;
}
