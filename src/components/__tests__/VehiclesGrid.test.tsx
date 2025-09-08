/**
 * @jest-environment jsdom
 */
import VehiclesGrid from '@/components/VehiclesGrid'

describe('VehiclesGrid Component', () => {
  test('should export correctly', () => {
    expect(VehiclesGrid).toBeDefined()
    expect(typeof VehiclesGrid).toBe('function')
  })

  test('should handle empty vehicles array', () => {
    expect(() => VehiclesGrid({ vehicles: [] })).not.toThrow()
  })
})
