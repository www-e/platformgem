// src/lib/api/query-builders.ts
// Consolidated query building utilities for API routes

import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

/**
 * Common search filters
 */
export interface SearchFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  category?: string;
  includeInactive?: boolean;
}

/**
 * Extract search filters from request
 */
export function extractSearchFilters(request: NextRequest): SearchFilters {
  const { searchParams } = new URL(request.url);
  
  return {
    search: searchParams.get('search') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    status: searchParams.get('status') || undefined,
    category: searchParams.get('category') || undefined,
    includeInactive: searchParams.get('includeInactive') === 'true'
  };
}

/**
 * Build date range filter
 */
export function buildDateRangeFilter(dateFrom?: string, dateTo?: string): Prisma.DateTimeFilter | undefined {
  if (!dateFrom && !dateTo) return undefined;
  
  const filter: Prisma.DateTimeFilter = {};
  
  if (dateFrom) {
    filter.gte = new Date(dateFrom);
  }
  
  if (dateTo) {
    filter.lte = new Date(dateTo + 'T23:59:59.999Z');
  }
  
  return filter;
}

/**
 * Build text search filter for multiple fields
 */
export function buildTextSearchFilter(
  search: string,
  fields: string[]
): any[] {
  return fields.map(field => ({
    [field]: {
      contains: search,
      mode: 'insensitive' as const
    }
  }));
}

/**
 * Build user search where clause
 */
export function buildUserSearchWhere(filters: SearchFilters): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};
  
  if (filters.search) {
    where.OR = buildTextSearchFilter(filters.search, ['name', 'email', 'phone', 'studentId']) as any;
  }
  
  if (!filters.includeInactive) {
    where.isActive = true;
  }
  
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = buildDateRangeFilter(filters.dateFrom, filters.dateTo);
  }
  
  return where;
}

/**
 * Build course search where clause
 */
export function buildCourseSearchWhere(filters: SearchFilters): Prisma.CourseWhereInput {
  const where: Prisma.CourseWhereInput = {};
  
  if (filters.search) {
    where.OR = buildTextSearchFilter(filters.search, ['title', 'description']) as any;
  }
  
  if (filters.category) {
    where.categoryId = filters.category;
  }
  
  if (filters.status === 'published') {
    where.isPublished = true;
  } else if (filters.status === 'draft') {
    where.isPublished = false;
  }
  
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = buildDateRangeFilter(filters.dateFrom, filters.dateTo);
  }
  
  return where;
}

/**
 * Build payment search where clause
 */
export function buildPaymentSearchWhere(filters: SearchFilters): Prisma.PaymentWhereInput {
  const where: Prisma.PaymentWhereInput = {};
  
  if (filters.status && filters.status !== 'all') {
    where.status = filters.status.toUpperCase() as any;
  }
  
  if (filters.search) {
    where.OR = [
      {
        course: {
          title: {
            contains: filters.search,
            mode: 'insensitive'
          }
        }
      },
      {
        user: {
          name: {
            contains: filters.search,
            mode: 'insensitive'
          }
        }
      },
      {
        paymobOrderId: {
          contains: filters.search,
          mode: 'insensitive'
        }
      }
    ];

    // Add transaction ID search if it's a number
    const transactionId = parseInt(filters.search);
    if (!isNaN(transactionId)) {
      where.OR.push({
        paymobTransactionId: BigInt(transactionId)
      });
    }
  }
  
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = buildDateRangeFilter(filters.dateFrom, filters.dateTo);
  }
  
  return where;
}