import { 
  CreatorApplicationData, 
  CreatorEligibilityResponse, 
  CreatorApplicationStatus, 
  CreatorApplicationResponse 
} from '../types/Creator';
import { API_BASE_URL, getDefaultHeaders } from '../utils/apiConfig';

export const creatorService = {
  // Check if user is eligible to apply for creator status
  checkEligibility: async (): Promise<CreatorEligibilityResponse> => {
    const response = await fetch(`${API_BASE_URL}/creator/check-eligibility`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to check eligibility');
    }

    return response.json();
  },

  // Submit creator application
  submitApplication: async (applicationData: CreatorApplicationData): Promise<CreatorApplicationResponse> => {
    const response = await fetch(`${API_BASE_URL}/creator/apply`, {
      method: 'POST',
      headers: getDefaultHeaders(),
      body: JSON.stringify(applicationData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.errors && Array.isArray(errorData.errors)) {
        // Extract validation error messages
        const messages = errorData.errors.map((error: any) => error.msg).join(', ');
        throw new Error(messages);
      }
      throw new Error(errorData.message || 'Failed to submit application');
    }

    return response.json();
  },

  // Get application status
  getApplicationStatus: async (): Promise<CreatorApplicationStatus> => {
    const response = await fetch(`${API_BASE_URL}/creator/application/status`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get application status');
    }

    return response.json();
  },
}; 