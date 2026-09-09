'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { ClassCreator } from './_components/ClassCreator';
import { DashboardTabs } from './_components/DashboardTabs';
import { MateriGenerator } from './_components/MateriGenerator';
import { SoalGenerator } from './_components/SoalGenerator';
import { StudentProgress } from './_components/StudentProgress';
import type { DashboardTab, QuestionItem } from './_components/types';

export default function DashboardGuruPage() {
    const [activeTab, setActiveTab] = useState<DashboardTab>('materi');
    const [classCode, setClassCode] = useState('MOMO-8A92');
    const [className, setClassName] = useState('');
    const [subject, setSubject] = useState('');
    const [materiPdfFile, setMateriPdfFile] = useState<File | null>(null);
    const [materiGrade, setMateriGrade] = useState('Pilih Kelas');
    const [isGeneratingMateri, setIsGeneratingMateri] = useState(false);
    const [generatedMateri, setGeneratedMateri] = useState('');
    const [soalPdfFile, setSoalPdfFile] = useState<File | null>(null);
    const [questionCount, setQuestionCount] = useState(5);
    const [isGeneratingSoal, setIsGeneratingSoal] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState<QuestionItem[]>([]);

    const generateClassCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const suffix = Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        setClassCode(`MOMO-${suffix}`);
        toast.success('Kode kelas unik baru berhasil dibuat!');
    };

    const copyClassCode = () => {
        navigator.clipboard.writeText(classCode);
        toast.success('Kode kelas disalin ke clipboard!');
    };

    const handleCreateClass = (event: React.FormEvent) => {
        event.preventDefault();
        if (!className || !subject) {
            toast.error('Mohon isi nama kelas dan mata pelajaran!');
            return;
        }
        toast.success(`Kelas "${className}" (${classCode}) berhasil dibuat!`);
        setClassName('');
        setSubject('');
        generateClassCode();
    };

    const validatePdf = (event: React.ChangeEvent<HTMLInputElement>, onValidFile: (file: File) => void) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            toast.error('Harap unggah berkas berformat PDF!');
            return;
        }
        onValidFile(file);
        toast.success(`PDF "${file.name}" berhasil diunggah!`);
    };

    const handleMateriPdfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        validatePdf(event, setMateriPdfFile);
    };

    const handleSoalPdfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        validatePdf(event, setSoalPdfFile);
    };

    const handleGenerateMateri = (event: React.FormEvent) => {
        event.preventDefault();
        if (!materiPdfFile) {
            toast.error('Harap unggah dokumen PDF materi terlebih dahulu!');
            return;
        }

        setIsGeneratingMateri(true);
        setGeneratedMateri('');
        setTimeout(() => {
            const fileName = materiPdfFile.name.replace(/\.[^/.]+$/, '');
            const sampleMateri = `
# RANGKUMAN MATERI PEMBELAJARAN (Sintesis dari PDF)
**Sumber Dokumen:** ${materiPdfFile.name}
**Tingkat Target:** ${materiGrade}

---

### 1. Ringkasan Eksekutif Dokumen
Berdasarkan dokumen PDF yang diunggah, materi utama berfokus pada pembahasan komprehensif mengenai topik **${fileName}**.

### 2. Poin-Poin Utama Terkstrak
- **Konsep Inti:** Pembahasan mendasar mengenai definisi dan cakupan ${fileName}.
- **Analisis Tematik:** Dokumen menekankan pentingnya pemahaman struktur dasar serta implikasi praktisnya.
- **Penerapan Kunci:** Implementasi nyata dari topik yang dibahas dalam konteks pembelajaran sehari-hari.

### 3. Modul Kesimpulan & Evaluasi Ringkas
Siswa diharapkan mampu menganalisis konsep-konsep kunci di atas untuk meningkatkan pemahaman holistik sesuai standar kurikulum.
`;
            setGeneratedMateri(sampleMateri.trim());
            setIsGeneratingMateri(false);
            toast.success('Draf materi berhasil digenerate dari dokumen PDF!');
        }, 2500);
    };

    const handleGenerateSoal = (event: React.FormEvent) => {
        event.preventDefault();
        if (!soalPdfFile) {
            toast.error('Harap unggah dokumen PDF sumber soal!');
            return;
        }

        setIsGeneratingSoal(true);
        setGeneratedQuestions([]);
        setTimeout(() => {
            const fileName = soalPdfFile.name.replace(/\.[^/.]+$/, '');
            const questions: QuestionItem[] = Array.from({ length: questionCount }, (_, index) => ({
                id: index + 1,
                question: `[Pertanyaan dari PDF ${fileName}] Soal nomor ${index + 1}: Konsep manakah yang paling sesuai dengan bahasan dalam dokumen?`,
                options: [
                    'A. Prinsip utama bab kesatuan dan fungsi',
                    'B. Analisis komponen sekunder pada modul',
                    'C. Struktur pendukung variabel eksternal',
                    'D. Pembahasan elemen dasar non-esensial'
                ],
                answer: 'A. Prinsip utama bab kesatuan dan fungsi',
                explanation: `Pembahasan: Berdasarkan isi dokumen PDF (${soalPdfFile.name}), jawaban A adalah yang paling relevan dengan materi utama.`
            }));
            setGeneratedQuestions(questions);
            setIsGeneratingSoal(false);
            toast.success(`${questionCount} Soal & Kunci Jawaban berhasil digenerate dari PDF!`);
        }, 3000);
    };

    return (
        <div className="min-h-[calc(100dvh-5rem)] bg-slate-900 text-slate-100 flex flex-col font-[family-name:var(--font-poppins)]">
            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 p-3 sm:gap-6 sm:p-6 lg:p-8">
                <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
                {activeTab === 'materi' && <MateriGenerator file={materiPdfFile} grade={materiGrade} isGenerating={isGeneratingMateri} generatedMateri={generatedMateri} onFileChange={handleMateriPdfChange} onFileRemove={() => setMateriPdfFile(null)} onGradeChange={setMateriGrade} onGenerate={handleGenerateMateri} />}
                {activeTab === 'soal' && <SoalGenerator file={soalPdfFile} questionCount={questionCount} isGenerating={isGeneratingSoal} questions={generatedQuestions} onFileChange={handleSoalPdfChange} onFileRemove={() => setSoalPdfFile(null)} onQuestionCountChange={setQuestionCount} onGenerate={handleGenerateSoal} />}
                {activeTab === 'kelas' && <ClassCreator classCode={classCode} className={className} subject={subject} onClassNameChange={setClassName} onSubjectChange={setSubject} onGenerateCode={generateClassCode} onCopyCode={copyClassCode} onCreateClass={handleCreateClass} />}
                {activeTab === 'progress' && <StudentProgress data={null} />}
            </div>
        </div>
    );
}
