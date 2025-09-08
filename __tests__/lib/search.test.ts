import { parseSearchParams, calculatePagination, buildSortConfig } from '../../src/lib/utils/search'

describe('Search Parser', () => {
  describe('parseSearchParams', () => {
    it('should parse basic search parameters', () => {
      const params = new URLSearchParams('make=Toyota&model=Corolla&year=2020')
      const result = parseSearchParams(params)

      expect(result).toEqual({
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
      })
    })

    it('should handle empty and invalid parameters', () => {
      const params = new URLSearchParams('make=&year=invalid&type=INVALID_TYPE')
      const result = parseSearchParams(params)

      expect(result).toEqual({})
    })

    it('should validate year range', () => {
      const params = new URLSearchParams('year=1800')
      const result = parseSearchParams(params)

      expect(result.year).toBeUndefined()

      const params2 = new URLSearchParams('year=2030')
      const result2 = parseSearchParams(params2)

      expect(result2.year).toBeUndefined()

      const params3 = new URLSearchParams('year=2020')
      const result3 = parseSearchParams(params3)

      expect(result3.year).toBe(2020)
    })

    it('should validate vehicle type enum', () => {
      const params = new URLSearchParams('type=BUY_NOW')
      const result = parseSearchParams(params)

      expect(result.type).toBe('BUY_NOW')

      const params2 = new URLSearchParams('type=INVALID')
      const result2 = parseSearchParams(params2)

      expect(result2.type).toBeUndefined()
    })

    it('should handle pagination parameters', () => {
      const params = new URLSearchParams('page=2&limit=10')
      const result = parseSearchParams(params)

      expect(result.page).toBe(2)
      expect(result.limit).toBe(10)
    })

    it('should validate limit bounds', () => {
      const params = new URLSearchParams('limit=0')
      const result = parseSearchParams(params)

      expect(result.limit).toBeUndefined()

      const params2 = new URLSearchParams('limit=150')
      const result2 = parseSearchParams(params2)

      expect(result2.limit).toBeUndefined()

      const params3 = new URLSearchParams('limit=50')
      const result3 = parseSearchParams(params3)

      expect(result3.limit).toBe(50)
    })

    it('should trim whitespace from text fields', () => {
      const params = new URLSearchParams('make=  Toyota  &model=  Corolla  ')
      const result = parseSearchParams(params)

      expect(result.make).toBe('Toyota')
      expect(result.model).toBe('Corolla')
    })

    it('should work with object input', () => {
      const params = {
        make: 'Honda',
        year: '2019',
        type: 'BIDDING',
      }
      const result = parseSearchParams(params)

      expect(result).toEqual({
        make: 'Honda',
        year: 2019,
        type: 'BIDDING',
      })
    })
  })

  describe('calculatePagination', () => {
    it('should calculate pagination for normal cases', () => {
      const result = calculatePagination(2, 10, 45)

      expect(result).toEqual({
        offset: 10,
        limit: 10,
        currentPage: 2,
        totalPages: 5,
        hasNext: true,
        hasPrev: true,
      })
    })

    it('should handle first page', () => {
      const result = calculatePagination(1, 10, 25)

      expect(result.hasPrev).toBe(false)
      expect(result.hasNext).toBe(true)
      expect(result.offset).toBe(0)
    })

    it('should handle last page', () => {
      const result = calculatePagination(3, 10, 25)

      expect(result.hasPrev).toBe(true)
      expect(result.hasNext).toBe(false)
      expect(result.totalPages).toBe(3)
    })

    it('should handle edge cases', () => {
      // Empty results
      const empty = calculatePagination(1, 10, 0)
      expect(empty.totalPages).toBe(0)
      expect(empty.hasNext).toBe(false)

      // Invalid page numbers
      const negative = calculatePagination(-1, 10, 50)
      expect(negative.currentPage).toBe(1)

      // Invalid limit
      const bigLimit = calculatePagination(1, 200, 50)
      expect(bigLimit.limit).toBe(100)
    })

    it('should handle exact page boundaries', () => {
      const result = calculatePagination(2, 10, 20)

      expect(result.totalPages).toBe(2)
      expect(result.hasNext).toBe(false)
      expect(result.offset).toBe(10)
    })
  })

  describe('buildSortConfig', () => {
    it('should default to createdAt desc', () => {
      const result = buildSortConfig()

      expect(result).toEqual({ createdAt: 'desc' })
    })

    it('should build valid sort configs', () => {
      expect(buildSortConfig('price', 'asc')).toEqual({ price: 'asc' })
      expect(buildSortConfig('mileage', 'desc')).toEqual({ mileage: 'desc' })
      expect(buildSortConfig('year')).toEqual({ year: 'desc' })
      expect(buildSortConfig('views', 'asc')).toEqual({ views: 'asc' })
    })

    it('should handle invalid sort fields', () => {
      const result = buildSortConfig('invalid_field', 'asc')

      expect(result).toEqual({ createdAt: 'desc' })
    })

    it('should default to desc for invalid order', () => {
      const result = buildSortConfig('price', 'invalid')

      expect(result).toEqual({ price: 'desc' })
    })
  })
})
