/**
 * Image Processing Utilities
 * Client-side image downscaling and optimization before upload
 */

/**
 * Downscale image if needed
 * - Max edge: 2048px
 * - Output format: WebP
 * - Quality: 0.9
 * 
 * @param {File} file - Original image file
 * @returns {Promise<File>} - Processed image file
 */
export async function downscaleIfNeeded(file) {
  const MAX_EDGE = 2048;
  const QUALITY = 0.9;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // Check if downscaling is needed
      const maxDim = Math.max(width, height);
      if (maxDim <= MAX_EDGE) {
        // No downscaling needed, but still convert to WebP for consistency
        canvas.width = width;
        canvas.height = height;
      } else {
        // Scale down proportionally
        const scale = MAX_EDGE / maxDim;
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
      }

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert to WebP blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to process image'));
            return;
          }

          // Create new File from blob
          const processedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
            type: 'image/webp',
            lastModified: Date.now()
          });

          resolve(processedFile);
        },
        'image/webp',
        QUALITY
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Create object URL for local preview
 * @param {File} file - Image file
 * @returns {string} - Object URL
 */
export function createPreviewURL(file) {
  return URL.createObjectURL(file);
}

/**
 * Revoke object URL to free memory
 * @param {string} url - Object URL to revoke
 */
export function revokePreviewURL(url) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
