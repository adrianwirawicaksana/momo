import { apiClient } from '../client/route';

export interface ModulSummary {
  id: number;
  guru_id?: number;
  nama: string;
  deskripsi?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ModulDetail extends ModulSummary {
  judul?: string;
  materi?: unknown;
  soal?: ModulSoal[];
}

export interface UpdateModulResponse {
  message: string;
  data: ModulSummary;
}

export interface ModulMaterial {
  id: number;
  modul_id: number;
  urutan: number;
  judul: string;
  konten: string;
  created_at?: string;
  updated_at?: string;
}

export interface ModulMaterialResponse {
  message: string;
  jumlah: number;
  data: ModulMaterial[];
}

export interface ModulMaterialsResponse {
  jumlah: number;
  data: ModulMaterial[];
}

export interface ModulMaterialMutationResponse {
  message: string;
  data: ModulMaterial;
}

export interface ModulSoal {
  id: number;
  modul_id: number;
  jenis: 'harian' | 'uts' | 'uas';
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
}

export interface ModulUploadResponse {
  data?: ModulSoal[];
  jenis?: ModulSoal['jenis'];
  jumlah?: number;
  message?: string;
}

export const getModules = async (token: string): Promise<ModulSummary[]> => {
  const response = await apiClient.get<ModulSummary[] | { data: ModulSummary[] }>('/api/v1/modul', {
    headers: { Authorization: `Bearer ${token}` },
  });

  const modules = Array.isArray(response.data) ? response.data : response.data.data;
  return Array.isArray(modules) ? modules : [];
};

export const createModule = async (
  payload: { nama: string; deskripsi?: string },
  token: string,
): Promise<ModulSummary> => {
  const response = await apiClient.post<ModulSummary>('/api/v1/modul', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const updateModule = async (
  moduleId: number,
  payload: { nama?: string; deskripsi?: string },
  token: string,
): Promise<ModulSummary> => {
  const response = await apiClient.put<UpdateModulResponse>(`/api/v1/modul/${moduleId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.data;
};

export const deleteModule = async (moduleId: number, token: string): Promise<void> => {
  await apiClient.delete(`/api/v1/modul/${moduleId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getModuleDetail = async (
  moduleId: number,
  token: string,
): Promise<ModulDetail> => {
  const response = await apiClient.get<ModulDetail>(`/api/v1/modul/${moduleId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const assignModuleToClass = async (
  classId: number,
  moduleId: number,
  token: string,
): Promise<void> => {
  await apiClient.post(`/api/v1/kelas/${classId}/modul`, { modul_id: moduleId }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const uploadModuleMaterial = async (
  moduleId: number,
  file: File,
  token: string,
): Promise<ModulMaterialResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ModulMaterialResponse>(`/api/v1/modul/${moduleId}/materi`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getModuleMaterials = async (
  moduleId: number,
  token: string,
): Promise<ModulMaterial[]> => {
  const response = await apiClient.get<ModulMaterialsResponse>(`/api/v1/modul/${moduleId}/materi`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return Array.isArray(response.data.data) ? response.data.data : [];
};

export const createManualMaterial = async (
  moduleId: number,
  payload: { judul: string; konten: string; urutan?: number },
  token: string,
): Promise<ModulMaterial> => {
  const response = await apiClient.post<ModulMaterialMutationResponse>(
    `/api/v1/modul/${moduleId}/materi/manual`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return response.data.data;
};

export const updateMaterial = async (
  materialId: number,
  payload: { judul: string; konten: string; urutan?: number },
  token: string,
): Promise<ModulMaterial> => {
  const response = await apiClient.put<ModulMaterialMutationResponse>(`/api/v1/materi/${materialId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.data;
};

export const deleteMaterial = async (materialId: number, token: string): Promise<void> => {
  await apiClient.delete(`/api/v1/materi/${materialId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const uploadModuleQuestions = async (
  moduleId: number,
  file: File,
  jenis: ModulSoal['jenis'],
  token: string,
): Promise<ModulUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ModulUploadResponse>(
    `/api/v1/modul/${moduleId}/soal`,
    formData,
    {
      params: { jenis },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
};
