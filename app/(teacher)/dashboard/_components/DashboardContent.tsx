'use client';

import type { ClassDetail, ClassSummary, UpdateClassPayload } from '@/api/kelas/route';
import type { ModulMaterial, ModulSummary } from '@/api/modul/route';
import { ClassCreator } from './ClassCreator';
import { ClassList } from './ClassList';
import { MateriGenerator } from './MateriGenerator';
import { ModuleCreator } from './ModuleCreator';
import { SoalGenerator } from './SoalGenerator';
import { StudentProgress } from './StudentProgress';
import type { DashboardTab, QuestionItem, QuestionType } from './types';

export interface DashboardContentProps {
    activeTab: DashboardTab;
    classes: ClassSummary[];
    classDetails: Record<number, ClassDetail>;
    modules: ModulSummary[];
    selectedClassId: number | null;
    classDetail: ClassDetail | null;
    isLoadingClass: boolean;
    isProcessingClass: boolean;
    isCreatingClass: boolean;
    generatedClassCode: string;
    generatedClassName: string;
    generatedSubject: string;
    className: string;
    subject: string;
    moduleClassId: number | null;
    moduleName: string;
    moduleDescription: string;
    materiModuleId: number | null;
    materiPdfFile: File | null;
    isGeneratingMateri: boolean;
    isSavingMateri: boolean;
    generatedMateri: ModulMaterial[];
    materiModuleName: string;
    soalModuleId: number | null;
    soalPdfFile: File | null;
    questionType: QuestionType;
    isGeneratingSoal: boolean;
    generatedQuestions: QuestionItem[];
    onClassChange: (id: number) => void;
    onUpdateClass: (id: number, payload: UpdateClassPayload) => Promise<void>;
    onDeleteClass: (id: number) => Promise<void>;
    onCopyClassCode: (code: string) => void;
    onCreateClass: (event: React.FormEvent) => void;
    onClassNameChange: (value: string) => void;
    onSubjectChange: (value: string) => void;
    onModuleClassChange: (id: number) => void;
    onModuleNameChange: (value: string) => void;
    onModuleDescriptionChange: (value: string) => void;
    onCreateModule: (event: React.FormEvent) => void;
    onUpdateModule: (id: number, payload: { nama?: string; deskripsi?: string }) => Promise<void>;
    onDeleteModule: (id: number) => Promise<void>;
    onMateriFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onMateriFileRemove: () => void;
    onMateriModuleChange: (id: number) => void;
    onGenerateMateri: (event: React.FormEvent) => void;
    onSaveMateri: () => void;
    onSoalFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSoalFileRemove: () => void;
    onQuestionTypeChange: (type: QuestionType) => void;
    onSoalModuleChange: (id: number) => void;
    onGenerateSoal: (event: React.FormEvent) => void;
    onSaveSoal: () => void;
    onDownloadSoal: () => void;
}

export function DashboardContent({
    activeTab,
    classes,
    classDetails,
    modules,
    selectedClassId,
    classDetail,
    isLoadingClass,
    isProcessingClass,
    isCreatingClass,
    generatedClassCode,
    generatedClassName,
    generatedSubject,
    className,
    subject,
    moduleClassId,
    moduleName,
    moduleDescription,
    materiModuleId,
    materiPdfFile,
    isGeneratingMateri,
    isSavingMateri,
    generatedMateri,
    materiModuleName,
    soalModuleId,
    soalPdfFile,
    questionType,
    isGeneratingSoal,
    generatedQuestions,
    onClassChange,
    onUpdateClass,
    onDeleteClass,
    onCopyClassCode,
    onCreateClass,
    onClassNameChange,
    onSubjectChange,
    onModuleClassChange,
    onModuleNameChange,
    onModuleDescriptionChange,
    onCreateModule,
    onUpdateModule,
    onDeleteModule,
    onMateriFileChange,
    onMateriFileRemove,
    onMateriModuleChange,
    onGenerateMateri,
    onSaveMateri,
    onSoalFileChange,
    onSoalFileRemove,
    onQuestionTypeChange,
    onSoalModuleChange,
    onGenerateSoal,
    onSaveSoal,
    onDownloadSoal,
}: DashboardContentProps) {
    const progressData = classDetail ? {
        className: classDetail.nama_kelas,
        period: isLoadingClass ? 'Memuat...' : 'Data kelas terbaru',
        students: (classDetail.siswa ?? []).map((student) => ({
            name: student.nama,
            initials: student.nama.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
            progress: 0,
            score: 0,
            completed: 'Data progress belum tersedia',
            lastActivity: student.created_at ? new Date(student.created_at).toLocaleDateString('id-ID') : '-',
            status: 'Perlu Pendampingan' as const,
        })),
        totalStudents: classDetail.siswa.length,
    } : null;

    if (activeTab === 'materi') {
        return <MateriGenerator modules={modules} moduleId={materiModuleId} moduleName={materiModuleName} file={materiPdfFile} isGenerating={isGeneratingMateri} isSaving={isSavingMateri} generatedMateri={generatedMateri} onFileChange={onMateriFileChange} onFileRemove={onMateriFileRemove} onModuleChange={onMateriModuleChange} onGenerate={onGenerateMateri} onSave={onSaveMateri} />;
    }
    if (activeTab === 'soal') {
        return <SoalGenerator modules={modules} moduleId={soalModuleId} file={soalPdfFile} questionType={questionType} isGenerating={isGeneratingSoal} questions={generatedQuestions} onFileChange={onSoalFileChange} onFileRemove={onSoalFileRemove} onQuestionTypeChange={onQuestionTypeChange} onModuleChange={onSoalModuleChange} onGenerate={onGenerateSoal} onSave={onSaveSoal} onDownload={onDownloadSoal} />;
    }
    if (activeTab === 'buat-kelas') {
        return <ClassCreator classCode={generatedClassCode} className={className} subject={subject} generatedClassName={generatedClassName} generatedSubject={generatedSubject} isCreatingClass={isCreatingClass} onClassNameChange={onClassNameChange} onSubjectChange={onSubjectChange} onCopyCode={() => onCopyClassCode(generatedClassCode)} onCreateClass={onCreateClass} />;
    }
    if (activeTab === 'buat-modul') {
        return <ModuleCreator classes={classes} modules={modules} name={moduleName} description={moduleDescription} classId={moduleClassId} isCreating={isProcessingClass} onNameChange={onModuleNameChange} onDescriptionChange={onModuleDescriptionChange} onClassChange={onModuleClassChange} onCreate={onCreateModule} onUpdate={onUpdateModule} onDelete={onDeleteModule} />;
    }
    if (activeTab === 'kelola-kelas') {
        return <ClassList classes={classes} selectedClassId={selectedClassId} classDetails={classDetails} isLoading={isLoadingClass} onSelect={onClassChange} onUpdate={onUpdateClass} onDelete={onDeleteClass} onUpdateModule={onUpdateModule} onDeleteModule={onDeleteModule} onCopy={onCopyClassCode} />;
    }
    return <StudentProgress classes={classes} selectedClassId={selectedClassId} isLoadingClass={isLoadingClass} onClassChange={onClassChange} data={progressData} />;
}