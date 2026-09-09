export interface QuestionItem {
    id: number;
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

export type DashboardTab = 'materi' | 'soal' | 'kelas' | 'progress';
