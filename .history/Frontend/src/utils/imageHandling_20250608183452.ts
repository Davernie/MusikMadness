import { toast } from 'react-toastify';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  file?: File;
  preview?: string;
}

export const validateImage = async (file: File): Promise<ImageValidationResult> => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'Image size must be less than 5MB'
    };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only JPEG, PNG and WebP images are allowed'
    };
  }

  // Create preview
  const preview = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

  return {
    isValid: true,
    file,
    preview
  };
};

export const uploadImage = async (
  file: File,
  endpoint: string,
  token: string,
  fieldName: string,
  onProgress?: (progress: number) => void
): Promise<any> => { // Changed return type to Promise<any>
  const formData = new FormData();
  formData.append(fieldName, file);

  try {
    const xhr = new XMLHttpRequest();
    
    const uploadPromise = new Promise<any>((resolve, reject) => { // Changed Promise type to any
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          let errorMessage = `Upload failed with status: ${xhr.status}`;
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            if (errorResponse && errorResponse.message) {
              errorMessage = errorResponse.message;
            }
          } catch (parseError) {
            // Ignore parse error, use default message if JSON parsing of error fails
          }
          reject(new Error(errorMessage));
        }
      };

      xhr.onerror = () => {
        console.error("XHR onerror triggered for image upload", { endpoint, fieldName });
        reject(new Error('Network error during image upload. Please check your connection.'));
      };

      xhr.open('POST', endpoint);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });

    return await uploadPromise;
  } catch (error) {
    // Ensure error is an instance of Error for consistent handling
    const err = error instanceof Error ? error : new Error(String(error || 'Unknown upload error'));
    console.error(`Upload error in utility function for endpoint ${endpoint}, field ${fieldName}:`, err.message);
    throw err; // Re-throw the potentially wrapped error
  }
};

export const cleanupOldImage = async (
  endpoint: string,
  token: string
): Promise<void> => {
  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // 404 is expected when trying to delete images that don't exist
    if (!response.ok && response.status !== 404) {
      throw new Error('Failed to cleanup old image');
    }
    
    // Log for debugging, but don't show error to user for 404s
    if (response.status === 404) {
      console.log('Image cleanup: No existing image to delete (404), which is expected');
    } else if (response.ok) {
      console.log('Image cleanup: Successfully deleted old image');
    }
  } catch (error) {
    console.error('Cleanup error:', error);
    // Only show error toast for non-404 errors
    if (error instanceof Error && !error.message.includes('404')) {
      toast.error('Failed to cleanup old image');
    }
  }
};
