import { apiClient } from '../client/route';

export interface CreateClassPayload {
  nama: string;
  mata_pelajaran: string;
}

export interface UpdateClassPayload {
  nama?: string;
  mata_pelajaran?: string;
}

export interface UpdateClassResponse {
  message?: string;
  data?: ClassSummary;
}

export interface CreateClassResponse {
  id?: number;
  guru_id?: number;
  kelas_id?: number;
  nama_kelas?: string;
  mata_pelajaran?: string;
  kode_kelas?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface ClassStudent {
  id: number;
  kelas_id: number;
  nama: string;
  created_at: string;
}

export interface ClassModule {
  id: number;
  guru_id: number;
  nama?: string;
  judul?: string;
  [key: string]: unknown;
}

export interface ClassDetail {
  id: number;
  guru_id: number;
  nama_kelas: string;
  kode_kelas: string;
  siswa: ClassStudent[];
  modul: ClassModule[];
  created_at: string;
}

export interface ClassSummary {
  id: number;
  guru_id: number;
  nama_kelas: string;
  kode_kelas: string;
  mata_pelajaran?: string;
  created_at: string;
}

const isUpdateClassResponse = (
  value: ClassSummary | UpdateClassResponse,
): value is UpdateClassResponse => 'data' in value;

export const createClass = async (
  payload: CreateClassPayload,
  token: string,
): Promise<CreateClassResponse> => {
  const response = await apiClient.post<CreateClassResponse>('/api/v1/kelas', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getClassDetail = async (
  classId: number,
  token: string,
): Promise<ClassDetail> => {
  const response = await apiClient.get<ClassDetail>(`/api/v1/kelas/${classId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return {
    ...response.data,
    siswa: Array.isArray(response.data?.siswa) ? response.data.siswa : [],
    modul: Array.isArray(response.data?.modul) ? response.data.modul : [],
  };
};

export const getClasses = async (token: string): Promise<ClassSummary[]> => {
  const response = await apiClient.get<ClassSummary[] | { data: ClassSummary[] }>('/api/v1/kelas', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const classes = Array.isArray(response.data) ? response.data : response.data.data;
  return Array.isArray(classes) ? classes : [];
};

export const updateClass = async (
  classId: number,
  payload: UpdateClassPayload,
  token: string,
): Promise<ClassSummary> => {
  const response = await apiClient.put<ClassSummary | UpdateClassResponse>(`/api/v1/kelas/${classId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = isUpdateClassResponse(response.data) ? response.data.data : response.data;

  return result ?? ({} as ClassSummary);
};

export const deleteClass = async (classId: number, token: string): Promise<void> => {
  await apiClient.delete(`/api/v1/kelas/${classId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const removeModuleFromClass = async (
  classId: number,
  moduleId: number,
  token: string,
): Promise<void> => {
  await apiClient.delete(`/api/v1/kelas/${classId}/modul/${moduleId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};