import { apiClient } from '../client/route';

export interface HealthResponse {
  status: string;
  message: string;
}

export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};