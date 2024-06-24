import { Transform } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';
import { RecordData } from './recordData.dto';

export class GenerateApiDto {
  @IsArray()
  data: RecordData[];

  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  api_name: string;
}
