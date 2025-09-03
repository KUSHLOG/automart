/**
 * Search parameter parsing utilities
 */
export interface SearchFilters {
  make?: string
  model?: string
  year?: number
  type?: 'BUY_NOW' | 'BIDDING'
  sortBy?: 'price' | 'mileage' | 'year' | 'views'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

/**
 * Parse search parameters from URL or form data
 */
export function parseSearchParams(
  searchParams: URLSearchParams | Record<string, string>
): SearchFilters {
  const get = (key: string) =>
    searchParams instanceof URLSearchParams ? searchParams.get(key) : searchParams[key]

  const filters: SearchFilters = {}

  const make = get('make')
  if (make && make.trim()) {
    filters.make = make.trim()
  }

  const model = get('model')
  if (model && model.trim()) {
    filters.model = model.trim()
  }

  const year = get('year')
  if (year && !isNaN(parseInt(year))) {
    const yearNum = parseInt(year)
    if (yearNum >= 1900 && yearNum <= new Date().getFullYear() + 1) {
      filters.year = yearNum
    }
  }

  const type = get('type')
  if (type && ['BUY_NOW', 'BIDDING'].includes(type)) {
    filters.type = type as SearchFilters['type']
  }

  const sortBy = get('sortBy')
  if (sortBy && ['price', 'mileage', 'year', 'views'].includes(sortBy)) {
    filters.sortBy = sortBy as SearchFilters['sortBy']
  }

  const sortOrder = get('sortOrder')
  if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
    filters.sortOrder = sortOrder as SearchFilters['sortOrder']
  }

  const page = get('page')
  if (page && !isNaN(parseInt(page))) {
    const pageNum = parseInt(page)
    if (pageNum >= 1) {
      filters.page = pageNum
    }
  }

  const limit = get('limit')
  if (limit && !isNaN(parseInt(limit))) {
    const limitNum = parseInt(limit)
    if (limitNum >= 1 && limitNum <= 100) {
      filters.limit = limitNum
    }
  }

  return filters
}

/**
 * Calculate pagination boundaries
 */
export interface PaginationResult {
  offset: number
  limit: number
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export function calculatePagination(page = 1, limit = 20, totalCount: number): PaginationResult {
  const currentPage = Math.max(1, page)
  const itemsPerPage = Math.max(1, Math.min(100, limit))
  const offset = (currentPage - 1) * itemsPerPage
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return {
    offset,
    limit: itemsPerPage,
    currentPage,
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  }
}

/**
 * Build sort configuration for Prisma
 */
export function buildSortConfig(sortBy?: string, sortOrder?: string) {
  if (!sortBy) return { createdAt: 'desc' }

  const order = sortOrder === 'asc' ? 'asc' : 'desc'

  switch (sortBy) {
    case 'price':
      return { price: order }
    case 'mileage':
      return { mileage: order }
    case 'year':
      return { year: order }
    case 'views':
      return { views: order }
    default:
      return { createdAt: 'desc' }
  }
}
