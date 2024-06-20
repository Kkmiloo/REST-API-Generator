export class PaginationResponseDto {
  result: any[];
  metadata?: PaginationMetadata;
}

interface PaginationMetadata {
  count: number;
  perPage: number;
  currentPage: number;
  nextPage: string | null;
  prevPage: string | null;
}
