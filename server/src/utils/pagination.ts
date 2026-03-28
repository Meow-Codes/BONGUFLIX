import { Request } from "express";
import type { PaginationParams, PaginatedResponse } from "../types/media.types.js";

export const parsePagination = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string || "1", 10));
  let limit = parseInt(req.query.limit as string || "20", 10);
  limit = Math.min(Math.max(1, limit), 100); // safety cap

  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

export const buildPaginatedResponse = <T>(
  items: T[],
  total: number,
  { page, limit }: PaginationParams
): PaginatedResponse<T> => ({
  items,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  },
});