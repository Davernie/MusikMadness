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
  onProgress?: (progress: number) => void
): Promise<{ url: string; message?: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const xhr = new XMLHttpRequest();
    
    const uploadPromise = new Promise<{ url: string; message?: string }>((resolve, reject) => {
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
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
    });

    xhr.open('POST', endpoint);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);

    return await uploadPromise;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
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

    if (!response.ok) {
      throw new Error('Failed to cleanup old image');
    }
  } catch (error) {
    console.error('Cleanup error:', error);
    toast.error('Failed to cleanup old image');
  }
};
