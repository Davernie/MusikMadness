import axios from 'axios';
import { Tournament } from '../types';
import { API_BASE_URL, getDefaultHeaders, getMultipartHeaders } from '../utils/apiConfig';

export interface CreateTournamentData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  prizePool: number;
  entryFee: number;
  maxParticipants: number;
  genre: string;
  language: string;
  rules?: string;
  coverImage?: File;
  cardImage?: File;
}

export interface UpdateTournamentData extends Partial<CreateTournamentData> {
  id: string;
}

class TournamentService {
  private baseURL = `${API_BASE_URL}/tournaments`;

  // Create a new tournament with optional image uploads
  async createTournament(data: CreateTournamentData): Promise<Tournament> {
    const formData = new FormData();
    
    // Add all text fields to FormData
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'coverImage' && key !== 'cardImage' && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    
    // Add image files if provided
    if (data.coverImage) {
      formData.append('coverImage', data.coverImage);
    }
    if (data.cardImage) {
      formData.append('cardImage', data.cardImage);
    }    const response = await axios.post(this.baseURL, formData, {
      headers: getMultipartHeaders(),
    });
    
    return response.data;
  }

  // Update an existing tournament with optional image uploads
  async updateTournament(data: UpdateTournamentData): Promise<Tournament> {
    const { id, ...updateData } = data;
    const formData = new FormData();
    
    // Add all text fields to FormData
    Object.entries(updateData).forEach(([key, value]) => {
      if (key !== 'coverImage' && key !== 'cardImage' && value !== undefined) {
        formData.append(key, value.toString());
      }
    });
    
    // Add image files if provided
    if (updateData.coverImage) {
      formData.append('coverImage', updateData.coverImage);
    }
    if (updateData.cardImage) {
      formData.append('cardImage', updateData.cardImage);
    }    const response = await axios.put(`${this.baseURL}/${id}`, formData, {
      headers: getMultipartHeaders(),
    });
    
    return response.data;
  }
  // Get all tournaments
  async getAllTournaments(): Promise<Tournament[]> {
    const response = await axios.get(this.baseURL, {
      headers: getDefaultHeaders(),
    });
    return response.data;
  }

  // Get a single tournament by ID
  async getTournamentById(id: string): Promise<Tournament> {
    const response = await axios.get(`${this.baseURL}/${id}`, {
      headers: getDefaultHeaders(),
    });
    return response.data;
  }

  // Delete a tournament
  async deleteTournament(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`, {
      headers: getDefaultHeaders(),
    });
  }

  // Get cover image URL for a tournament
  getCoverImageUrl(tournamentId: string): string {
    return `${this.baseURL}/${tournamentId}/cover-image`;
  }

  // Get card image URL for a tournament
  getCardImageUrl(tournamentId: string): string {
    return `${this.baseURL}/${tournamentId}/card-image`;
  }
  // Join a tournament
  async joinTournament(tournamentId: string): Promise<Tournament> {
    const response = await axios.post(`${this.baseURL}/${tournamentId}/join`, {}, {
      headers: getDefaultHeaders(),
    });
    return response.data;
  }

  // Leave a tournament
  async leaveTournament(tournamentId: string): Promise<Tournament> {
    const response = await axios.post(`${this.baseURL}/${tournamentId}/leave`, {}, {
      headers: getDefaultHeaders(),
    });
    return response.data;
  }

  // Get tournaments by status
  async getTournamentsByStatus(status: string): Promise<Tournament[]> {
    const response = await axios.get(`${this.baseURL}?status=${status}`, {
      headers: getDefaultHeaders(),
    });
    return response.data;
  }

  // Get tournaments by genre
  async getTournamentsByGenre(genre: string): Promise<Tournament[]> {
    const response = await axios.get(`${this.baseURL}?genre=${genre}`, {
      headers: getDefaultHeaders(),
    });
    return response.data;
  }

  // Search tournaments
  async searchTournaments(query: string): Promise<Tournament[]> {
    const response = await axios.get(`${this.baseURL}/search?q=${encodeURIComponent(query)}`, {
      headers: getDefaultHeaders(),
    });
    return response.data;
  }
}

// Export a singleton instance
export const tournamentService = new TournamentService();
export default tournamentService;