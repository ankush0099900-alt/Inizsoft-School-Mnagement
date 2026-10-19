export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
  maxLimit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const getPagination = (params: PaginationParams = {}): PaginationResult => {
  const page = Math.max(1, Number(params.page) || 1);
  const maxLimit = params.maxLimit || 100;
  const limit = Math.min(maxLimit, Math.max(1, Number(params.limit) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const createPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
};
