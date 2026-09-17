export interface QuestionItem {
    id: number;
    question: string;
    options: string[];
    answer?: string;
    explanation?: string;
}

export type QuestionType = 'harian' | 'uts' | 'uas';

export type DashboardTab = 'materi' | 'soal' | 'buat-kelas' | 'buat-modul' | 'kelola-kelas' | 'progress';
