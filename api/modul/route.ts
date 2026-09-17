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

export type ModulQuestionType = 'harian' | 'uts' | 'uas';

export interface ModulSoal {
  id: number;
  modul_id: number;
  jenis: ModulQuestionType;
  pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_d: string;
}

export interface ModulQuestionMutationResponse {
  message: string;
  data: ModulSoal;
}

export interface ModulUploadResponse {
  data?: ModulSoal[];
  jenis?: ModulSoal['jenis'];
  jumlah?: number;
  message?: string;
}

export interface ModulQuestionsResponse {
  jenis: ModulSoal['jenis'];
  jumlah: number;
  data: ModulSoal[];
}

export const getModuleQuestionList = async (
  moduleId: number,
  jenis?: ModulSoal['jenis'],
  token?: string,
): Promise<ModulSoal[]> => {
  const query = jenis ? `?jenis=${encodeURIComponent(jenis)}` : '';
  const response = await apiClient.get<{ jumlah?: number; data?: ModulSoal[] } | ModulSoal[]>(`/api/v1/modul/${moduleId}/soal/list${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  const payload = Array.isArray(response.data) ? response.data : response.data.data;
  return Array.isArray(payload) ? payload : [];
};

export const createManualQuestion = async (
  moduleId: number,
  payload: {
    jenis: ModulSoal['jenis'];
    pertanyaan: string;
    pilihan_a: string;
    pilihan_b: string;
    pilihan_c: string;
    pilihan_d: string;
    kunci_jawaban: 'A' | 'B' | 'C' | 'D';
  },
  token: string,
): Promise<ModulSoal> => {
  const response = await apiClient.post<ModulQuestionMutationResponse>(`/api/v1/modul/${moduleId}/soal/manual`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.data;
};

export const updateQuestion = async (
  questionId: number,
  payload: {
    pertanyaan: string;
    pilihan_a: string;
    pilihan_b: string;
    pilihan_c: string;
    pilihan_d: string;
    kunci_jawaban: 'A' | 'B' | 'C' | 'D';
    jenis?: ModulSoal['jenis'];
  },
  token: string,
): Promise<ModulSoal> => {
  const response = await apiClient.put<ModulQuestionMutationResponse>(`/api/v1/soal/${questionId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.data;
};

export const deleteQuestion = async (questionId: number, token: string): Promise<void> => {
  await apiClient.delete(`/api/v1/soal/${questionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

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
  formData.append('file', file, file.name);

  const response = await apiClient.post<ModulUploadResponse>(
    `/api/v1/modul/${moduleId}/soal?jenis=${encodeURIComponent(jenis)}`,
    formData,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

export const getModuleQuestions = async (
  moduleId: number,
  jenis: ModulSoal['jenis'],
  token: string,
): Promise<ModulSoal[]> => {
  const response = await apiClient.get<ModulDetail>(`/api/v1/modul/${moduleId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return Array.isArray(response.data.soal)
    ? response.data.soal.filter((item) => item.jenis === jenis)
    : [];
};
