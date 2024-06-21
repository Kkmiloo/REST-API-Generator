import { IsNumber } from 'class-validator';

export class RecordData {
  @IsNumber()
  id: number;

  [key: string]: any;
}
