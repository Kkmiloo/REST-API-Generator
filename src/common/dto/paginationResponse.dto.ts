import { RecordDataInterface } from 'src/custom-api/interfaces/recordData.interface';

export class PaginationResponseDto {
  result: RecordDataInterface[];
  metadata?: PaginationMetadata;
}

interface PaginationMetadata {
  count: number;
  perPage: number;
  currentPage: number;
  nextPage: string | null;
  prevPage: string | null;
}
