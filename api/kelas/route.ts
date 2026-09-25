import { apiClient } from '../client/route';
import type { ModulSoal } from '../modul/route';

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

export interface ClassProgressItem {
  siswa_id: number;
  nama: string;
  jumlah_soal_dijawab: number;
  jumlah_benar: number;
  skor_persen: number;
}

export interface ClassProgressRingkasan {
  total_siswa: number;
  rata_nilai: number;
  materi_selesai: number;
  perlu_perhatian: number;
}

export interface ClassProgressStudent {
  siswa_id: number;
  nama: string;
  progress_materi: string;
  persen_materi: number;
  materi_selesai: number;
  soal_dikerjakan: number;
  nilai_rata: number;
  aktivitas_terakhir: string;
  status: 'aman' | 'perlu_perhatian' | 'belum_aktif';
}

export interface ClassProgressResponse {
  ringkasan: ClassProgressRingkasan;
  siswa: ClassProgressStudent[];
}

export interface ClassModule {
  id: number;
  guru_id: number;
  nama?: string;
  judul?: string;
  materi?: unknown;
  soal?: ModulSoal[];
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

export const getClassProgress = async (
  classId: number,
  token: string,
  modulId?: number,
  jenis?: string,
): Promise<ClassProgressResponse | ClassProgressItem[]> => {
  const params = new URLSearchParams();
  if (modulId) params.set('modul_id', String(modulId));
  if (jenis) params.set('jenis', jenis);

  const query = params.toString();
  const endpoint = `/api/v1/kelas/${classId}/progress`;

  try {
    const response = await apiClient.get<ClassProgressResponse>(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && Array.isArray(response.data.siswa)) {
      return response.data;
    }
  } catch {
    if (modulId || jenis) {
      const fallbackResponse = await apiClient.get<ClassProgressItem[] | { data?: ClassProgressItem[] }>(`/api/v1/kelas/${classId}/nilai${query ? `?${query}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : fallbackResponse.data?.data;
      return Array.isArray(data) ? data : [];
    }
  }

  const fallbackResponse = await apiClient.get<ClassProgressItem[] | { data?: ClassProgressItem[] }>(`/api/v1/kelas/${classId}/nilai${query ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : fallbackResponse.data?.data;
  return Array.isArray(data) ? data : [];
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