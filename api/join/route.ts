import { apiClient } from '../client/route';

// Interface Request Body
export interface JoinClassPayload {
  kode_kelas: string;
  nama: string;
}

// Interface Response Sukses (Token langsung di root object)
export interface JoinClassSuccessResponse {
  siswa_id: number;
  kelas_id: number;
  nama: string;
  token: string;
}

// Interface Response Error dari Backend
export interface JoinClassErrorResponse {
  error: string;
}

export const joinClass = async (payload: JoinClassPayload): Promise<JoinClassSuccessResponse> => {
  const response = await apiClient.post<JoinClassSuccessResponse>('/api/v1/join', payload);
  return response.data;
};