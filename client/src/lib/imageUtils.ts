import { apiRequest } from './api';

export async function uploadImage(file: File): Promise<{ imageUrl: string }> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiRequest('POST', 'upload-image', formData, true);
    const result = await response.json();
    
    if (!response.ok) {
      // Handle specific error codes
      switch (result.code) {
        case 'MISSING_FILE':
          throw new Error('Please select an image file to upload');
        case 'FILE_TOO_LARGE':
          throw new Error('Image file is too large (max 10MB)');
        default:
          throw new Error(result.message || 'Failed to upload image');
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error uploading image:", error instanceof Error ? error.message : error);
    throw error;
  }
}

// Validate image file before upload
export function validateImageFile(file: File): void {
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('Image must be less than 10MB');
  }
  
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a PNG, JPG or GIF image');
  }
}
