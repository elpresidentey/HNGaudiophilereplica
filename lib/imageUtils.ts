/**
 * Utility function to convert relative image paths to absolute paths
 * Removes the "./" prefix and ensures paths work with Next.js Image component
 */
export function getImagePath(relativePath: string): string {
  // If path already starts with "/", return as is
  if (relativePath.startsWith('/')) {
    return relativePath
  }
  
  // Remove leading "./" if present
  const cleanPath = relativePath.startsWith('./') 
    ? relativePath.slice(2) 
    : relativePath

  // Ensure path starts with "/" for Next.js
  return `/${cleanPath}`
}

/**
 * Get the best available image from a responsive image object
 */
export function getBestImage(
  imageObj: {
    mobile?: string
    tablet?: string
    desktop?: string
  },
  preference: 'desktop' | 'tablet' | 'mobile' = 'desktop'
): string {
  const path = imageObj[preference] || imageObj.desktop || imageObj.tablet || imageObj.mobile || ''
  return getImagePath(path)
}


