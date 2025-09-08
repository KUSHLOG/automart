/**
 * Custom image loader for cost-optimized image delivery
 * Generates sizes on demand and caches at edge
 */

interface ImageLoaderProps {
  src: string
  width: number
  quality?: number
}

export default function imageLoader({ src, width, quality = 75 }: ImageLoaderProps): string {
  // For external URLs, return as-is
  if (src.startsWith('http')) {
    return src
  }

  // For local images, add optimization parameters
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: quality.toString(),
  })

  // Add format negotiation based on browser support
  if (typeof window !== 'undefined') {
    // Check if browser supports AVIF
    if (window.navigator?.userAgent?.includes('Chrome')) {
      params.set('f', 'avif')
    } else {
      params.set('f', 'webp')
    }
  }

  return `/_next/image?${params.toString()}`
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(src: string, quality = 75): string {
  const sizes = [640, 750, 828, 1080, 1200, 1920]

  return sizes
    .map(size => {
      const url = imageLoader({ src, width: size, quality })
      return `${url} ${size}w`
    })
    .join(', ')
}

/**
 * Optimized image component props
 */
export function getOptimizedImageProps(src: string, alt: string) {
  return {
    src,
    alt,
    loader: imageLoader,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    quality: 75,
    placeholder: 'blur' as const,
    blurDataURL:
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
  }
}
