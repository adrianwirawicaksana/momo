'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import { createClass, deleteClass, getClassDetail, getClasses, removeModuleFromClass, updateClass, type ClassDetail, type ClassSummary, type UpdateClassPayload } from '@/api/kelas/route';
import { assignModuleToClass, createModule, deleteModule, getModuleDetail, getModules, updateModule, uploadModuleMaterial, uploadModuleQuestions, type ModulMaterial, type ModulSoal, type ModulSummary } from '@/api/modul/route';
import { DashboardTabs } from './_components/DashboardTabs';
import { DashboardContent } from './_components/DashboardContent';
import { GlobalLoading } from '@/components/shared/GlobalLoading';
import type { QuestionItem, DashboardTab } from './_components/types';

export default function DashboardGuruPage() {
    const pathname = usePathname();
    const activeTab: DashboardTab = pathname.endsWith('/generate-soal')
        ? 'soal'
        : pathname.endsWith('/buat-kelas')
            ? 'buat-kelas'
            : pathname.endsWith('/buat-modul')
                ? 'buat-modul'
                : pathname.endsWith('/kelola-kelas')
                    ? 'kelola-kelas'
                    : pathname.endsWith('/progress-siswa')
                        ? 'progress'
                        : 'materi';
    const [generatedClassCode, setGeneratedClassCode] = useState('');
    const [generatedClassName, setGeneratedClassName] = useState('');
    const [generatedSubject, setGeneratedSubject] = useState('');
    const [className, setClassName] = useState('');
    const [subject, setSubject] = useState('');
    const [classId, setClassId] = useState<number | null>(null);
    const [availableClasses, setAvailableClasses] = useState<ClassSummary[]>([]);
    const [availableModules, setAvailableModules] = useState<ModulSummary[]>([]);
    const [moduleClassId, setModuleClassId] = useState<number | null>(null);
    const [moduleName, setModuleName] = useState('');
    const [moduleDescription, setModuleDescription] = useState('');
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
    const [classDetails, setClassDetails] = useState<Record<number, ClassDetail>>({});
    const [isLoadingClass, setIsLoadingClass] = useState(false);
    const [isProcessingClass, setIsProcessingClass] = useState(false);
    const [isCreatingClass, setIsCreatingClass] = useState(false);
    const [materiPdfFile, setMateriPdfFile] = useState<File | null>(null);
    const [materiModuleId, setMateriModuleId] = useState<number | null>(null);
    const [isGeneratingMateri, setIsGeneratingMateri] = useState(false);
    const [isSavingMateri, setIsSavingMateri] = useState(false);
    const [generatedMateri, setGeneratedMateri] = useState<ModulMaterial[]>([]);
    const [soalPdfFile, setSoalPdfFile] = useState<File | null>(null);
    const [questionCount, setQuestionCount] = useState(5);
    const [soalModuleId, setSoalModuleId] = useState<number | null>(null);
    const [isGeneratingSoal, setIsGeneratingSoal] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState<QuestionItem[]>([]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            const token = window.localStorage.getItem('auth_token');
            if (!token) {
                setIsLoadingClasses(false);
                return;
            }

            void Promise.all([getClasses(token), getModules(token)]).then(([classes, modules]) => {
                setAvailableClasses(classes);
                setAvailableModules(modules);
                setMateriModuleId(modules[0]?.id ?? null);
                setSoalModuleId(modules[0]?.id ?? null);
                if (classes.length === 0) return;

                const storedClassId = Number(window.localStorage.getItem('active_class_id'));
                const selectedClass = classes.find((item) => item.id === storedClassId) ?? classes[classes.length - 1];
                setClassId(selectedClass.id);
                setModuleClassId(selectedClass.id);
                window.localStorage.setItem('active_class_id', String(selectedClass.id));
            }).catch(() => {
                toast.error('Daftar kelas guru gagal dimuat.');
            }).finally(() => {
                setIsLoadingClasses(false);
            });
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, []);

    const fetchClassDetail = useCallback(async (id: number, token: string): Promise<ClassDetail> => {
        const detail = await getClassDetail(id, token);
        const modules = await Promise.all(detail.modul.map(async (module) => {
            try {
                const moduleDetail = await getModuleDetail(module.id, token);
                return { ...module, ...moduleDetail };
            } catch {
                return module;
            }
        }));
        return { ...detail, modul: modules };
    }, []);

    const loadClassDetail = useCallback(async (id: number) => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        setIsLoadingClass(true);
        try {
            const detail = await fetchClassDetail(id, token);
            setClassDetail(detail);
            setClassDetails((current) => ({ ...current, [detail.id]: detail }));
            setClassId(detail.id);
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.response?.data?.error
                : undefined;
            toast.error(message || 'Detail kelas gagal dimuat.');
        } finally {
            setIsLoadingClass(false);
        }
    }, [fetchClassDetail]);

    const loadAllClassDetails = useCallback(async (classes: ClassSummary[]) => {
        const token = localStorage.getItem('auth_token');
        if (!token || classes.length === 0) return;

        setIsLoadingClass(true);
        const details = await Promise.all(classes.map(async (item) => {
            try {
                return await fetchClassDetail(item.id, token);
            } catch {
                return null;
            }
        }));
        setClassDetails(Object.fromEntries(details.filter((detail): detail is ClassDetail => detail !== null).map((detail) => [detail.id, detail])));
        setIsLoadingClass(false);
    }, [fetchClassDetail]);

    useEffect(() => {
        if (activeTab !== 'progress' || !classId) return;
        const timeoutId = window.setTimeout(() => {
            void loadClassDetail(classId);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [activeTab, classId, loadClassDetail]);

    useEffect(() => {
        if (activeTab !== 'kelola-kelas' || availableClasses.length === 0) return;
        const timeoutId = window.setTimeout(() => {
            void loadAllClassDetails(availableClasses);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [activeTab, availableClasses, loadAllClassDetails]);

    const copyClassCode = (code: string) => {
        if (!code) {
            toast.error('Kode kelas belum tersedia. Buat kelas terlebih dahulu!');
            return;
        }
        navigator.clipboard.writeText(code);
        toast.success('Kode kelas disalin ke clipboard!');
    };

    const handleClassChange = (id: number) => {
        setClassId(id);
        setClassDetail(null);
        window.localStorage.setItem('active_class_id', String(id));
    };

    const refreshClasses = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return [];
        const classes = await getClasses(token);
        setAvailableClasses(classes);
        return classes;
    };

    const handleUpdateClass = async (id: number, payload: UpdateClassPayload) => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error('Sesi login tidak ditemukan.');
            return;
        }
        setIsProcessingClass(true);
        try {
            await updateClass(id, payload, token);
            await refreshClasses();
            if (classId === id) await loadClassDetail(id);
            toast.success('Data kelas berhasil diperbarui.');
        } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.message || error.response?.data?.error : undefined;
            toast.error(message || 'Data kelas gagal diperbarui.');
            throw error;
        } finally {
            setIsProcessingClass(false);
        }
    };

    const handleDeleteClass = async (id: number) => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error('Sesi login tidak ditemukan.');
            return;
        }
        setIsProcessingClass(true);
        try {
            const detail = await getClassDetail(id, token);
            await Promise.all(detail.modul.map((module) => removeModuleFromClass(id, module.id, token)));
            await deleteClass(id, token);
            const classes = await refreshClasses();
            if (classId === id) {
                const nextClass = classes[0];
                setClassId(nextClass?.id ?? null);
                setClassDetail(null);
                if (nextClass) window.localStorage.setItem('active_class_id', String(nextClass.id));
                else window.localStorage.removeItem('active_class_id');
            }
            toast.success('Kelas berhasil dihapus.');
        } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.message || error.response?.data?.error : undefined;
            toast.error(message || 'Kelas gagal dihapus.');
            throw error;
        } finally {
            setIsProcessingClass(false);
        }
    };

    const handleCreateClass = async (event: React.FormEvent) => {
        event.preventDefault();
        if (isCreatingClass) return;

        if (!className || !subject) {
            toast.error('Mohon isi nama kelas dan mata pelajaran!');
            return;
        }

        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error('Sesi login tidak ditemukan. Silakan masuk kembali.');
            return;
        }

        setIsCreatingClass(true);
        setGeneratedClassCode('');
        setGeneratedClassName('');
        setGeneratedSubject('');
        try {
            const response = await createClass({
                nama: className.trim(),
                mata_pelajaran: subject.trim(),
            }, token);
            const createdClassId = response.id ?? response.kelas_id;
            const generatedCode = response.kode_kelas;
            if (createdClassId) {
                setClassId(createdClassId);
                window.localStorage.setItem('active_class_id', String(createdClassId));
                await loadClassDetail(createdClassId);
            }
            const refreshedClasses = await getClasses(token).catch(() => null);
            if (refreshedClasses) {
                setAvailableClasses(refreshedClasses);
            }
            setGeneratedClassCode(generatedCode ?? '');
            setGeneratedClassName(className.trim());
            setGeneratedSubject(subject.trim());
            toast.success(generatedCode
                ? `Kelas "${className}" (${generatedCode}) berhasil dibuat!`
                : `Kelas "${className}" berhasil dibuat!`);
            setClassName('');
            setSubject('');
        } catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.response?.data?.error
                : undefined;
            toast.error(message || 'Kelas gagal dibuat. Silakan coba lagi.');
        } finally {
            setIsCreatingClass(false);
        }
    };

    const handleCreateModule = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!moduleClassId) {
            toast.error('Pilih kelas tujuan terlebih dahulu.');
            return;
        }

        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error('Sesi login tidak ditemukan.');
            return;
        }

        setIsProcessingClass(true);
        try {
            const createdModule = await createModule({
                nama: moduleName.trim(),
                deskripsi: moduleDescription.trim() || undefined,
            }, token);
            await assignModuleToClass(moduleClassId, createdModule.id, token);
            const modules = await getModules(token);
            setAvailableModules(modules);
            setMateriModuleId(createdModule.id);
            setSoalModuleId(createdModule.id);
            setModuleName('');
            setModuleDescription('');
            toast.success(`Modul berhasil dibuat dan ditautkan ke kelas.`);
        } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.message || error.response?.data?.error : undefined;
            toast.error(message || 'Modul gagal dibuat atau ditautkan.');
        } finally {
            setIsProcessingClass(false);
        }
    };

    const handleUpdateModule = async (id: number, payload: { nama?: string; deskripsi?: string }) => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error('Sesi login tidak ditemukan.');
            return;
        }

        setIsProcessingClass(true);
        try {
            await updateModule(id, payload, token);
            const modules = await getModules(token);
            setAvailableModules(modules);
            if (classId) await loadClassDetail(classId);
            toast.success('Modul berhasil diperbarui.');
        } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.message || error.response?.data?.error : undefined;
            toast.error(message || 'Modul gagal diperbarui.');
            throw error;
        } finally {
            setIsProcessingClass(false);
        }
    };

    const handleDeleteModule = async (id: number) => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error('Sesi login tidak ditemukan.');
            return;
        }

        setIsProcessingClass(true);
        try {
            await deleteModule(id, token);
            const modules = await getModules(token);
            setAvailableModules(modules);
            setMateriModuleId((current) => current === id ? modules[0]?.id ?? null : current);
            setSoalModuleId((current) => current === id ? modules[0]?.id ?? null : current);
            if (classId) await loadClassDetail(classId);
            toast.success('Modul dan seluruh isinya berhasil dihapus.');
        } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.message || error.response?.data?.error : undefined;
            toast.error(message || 'Modul gagal dihapus.');
            throw error;
        } finally {
            setIsProcessingClass(false);
        }
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
        const file = event.target.files?.[0];
        if (file && file.size > 25 * 1024 * 1024) {
            toast.error('Ukuran PDF materi terlalu besar. Maksimal 25 MB.');
            return;
        }
        validatePdf(event, setMateriPdfFile);
    };

    const handleSoalPdfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        validatePdf(event, setSoalPdfFile);
    };

    const handleGenerateMateri = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!materiPdfFile) {
            toast.error('Harap unggah dokumen PDF materi terlebih dahulu!');
            return;
        }
        if (!materiModuleId) {
            toast.error('Pilih modul tujuan terlebih dahulu.');
            return;
        }
        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error('Sesi login tidak ditemukan.');
            return;
        }
        setIsGeneratingMateri(true);
        setGeneratedMateri([]);
        try {
            const response = await uploadModuleMaterial(materiModuleId, materiPdfFile, token);
            setGeneratedMateri(response.data);
            toast.success(`${response.jumlah} bagian materi berhasil diproses dan disimpan.`);
        } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.message || error.response?.data?.error : undefined;
            toast.error(message || 'Materi gagal diproses.');
        } finally {
            setIsGeneratingMateri(false);
        }
    };

    const handleSaveMateri = async () => {
        if (!materiModuleId || generatedMateri.length === 0) {
            toast.error('Generate materi terlebih dahulu sebelum menyimpan.');
            return;
        }

        if (!classId) {
            toast.error('Pilih kelas tujuan terlebih dahulu.');
            return;
        }

        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error('Sesi login tidak ditemukan.');
            return;
        }

        setIsSavingMateri(true);
        try {
            const detail = await getClassDetail(classId, token);
            const isModuleAssigned = detail.modul.some((module) => module.id === materiModuleId);
            if (!isModuleAssigned) {
                await assignModuleToClass(classId, materiModuleId, token);
            }
            await loadClassDetail(classId);
            toast.success(isModuleAssigned
                ? 'Materi sudah tersedia di kelas.'
                : 'Modul dan materi berhasil ditambahkan ke kelas.');
        } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.message || error.response?.data?.error : undefined;
            toast.error(message || 'Materi gagal disimpan ke modul.');
        } finally {
            setIsSavingMateri(false);
        }
    };

    const handleGenerateSoal = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!soalPdfFile) {
            toast.error('Harap unggah dokumen PDF sumber soal!');
            return;
        }
        if (!soalModuleId) {
            toast.error('Pilih modul tujuan terlebih dahulu.');
            return;
        }
        const token = localStorage.getItem('auth_token');
        if (!token) {
            toast.error('Sesi login tidak ditemukan.');
            return;
        }
        setIsGeneratingSoal(true);
        setGeneratedQuestions([]);
        try {
            const response = await uploadModuleQuestions(soalModuleId, soalPdfFile, 'uts', token);
            const items: ModulSoal[] = Array.isArray(response) ? response : response.data ?? [];
            setGeneratedQuestions(items.map((item) => ({
                id: item.id,
                question: item.pertanyaan,
                options: [item.pilihan_a, item.pilihan_b, item.pilihan_c, item.pilihan_d],
            })));
            toast.success(`${items.length} soal berhasil diproses dan disimpan ke modul!`);
        } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.message || error.response?.data?.error : undefined;
            toast.error(message || 'Soal gagal diproses.');
        } finally {
            setIsGeneratingSoal(false);
        }
    };

    return (
        <div className="min-h-[calc(100dvh-5rem)] bg-slate-900 text-slate-100 flex flex-col font-(family-name:--font-poppins)">
            <div className="flex w-full flex-1 flex-col gap-5 p-3 sm:gap-6 sm:p-6 lg:flex-row lg:items-start lg:gap-0 lg:p-0">
                <DashboardTabs activeTab={activeTab} />
                <main className="min-w-0 flex-1 lg:p-8">
                    {(isLoadingClasses || isLoadingClass || isProcessingClass || isCreatingClass || isGeneratingMateri || isSavingMateri || isGeneratingSoal) && <GlobalLoading label="MoMo sedang memproses..." />}
                    <DashboardContent
                        activeTab={activeTab}
                        classes={availableClasses}
                        classDetails={classDetails}
                        modules={availableModules}
                        selectedClassId={classId}
                        classDetail={classDetail}
                        isLoadingClass={isLoadingClass}
                        isProcessingClass={isProcessingClass}
                        isCreatingClass={isCreatingClass}
                        generatedClassCode={generatedClassCode}
                        generatedClassName={generatedClassName}
                        generatedSubject={generatedSubject}
                        className={className}
                        subject={subject}
                        moduleClassId={moduleClassId}
                        moduleName={moduleName}
                        moduleDescription={moduleDescription}
                        materiModuleId={materiModuleId}
                        materiPdfFile={materiPdfFile}
                        isGeneratingMateri={isGeneratingMateri}
                        isSavingMateri={isSavingMateri}
                        generatedMateri={generatedMateri}
                        soalModuleId={soalModuleId}
                        soalPdfFile={soalPdfFile}
                        questionCount={questionCount}
                        isGeneratingSoal={isGeneratingSoal}
                        generatedQuestions={generatedQuestions}
                        onClassChange={handleClassChange}
                        onUpdateClass={handleUpdateClass}
                        onDeleteClass={handleDeleteClass}
                        onCopyClassCode={copyClassCode}
                        onCreateClass={handleCreateClass}
                        onClassNameChange={setClassName}
                        onSubjectChange={setSubject}
                        onModuleClassChange={setModuleClassId}
                        onModuleNameChange={setModuleName}
                        onModuleDescriptionChange={setModuleDescription}
                        onCreateModule={handleCreateModule}
                        onUpdateModule={handleUpdateModule}
                        onDeleteModule={handleDeleteModule}
                        onMateriFileChange={handleMateriPdfChange}
                        onMateriFileRemove={() => setMateriPdfFile(null)}
                        onMateriModuleChange={setMateriModuleId}
                        onGenerateMateri={handleGenerateMateri}
                        onSaveMateri={handleSaveMateri}
                        onSoalFileChange={handleSoalPdfChange}
                        onSoalFileRemove={() => setSoalPdfFile(null)}
                        onQuestionCountChange={setQuestionCount}
                        onSoalModuleChange={setSoalModuleId}
                        onGenerateSoal={handleGenerateSoal}
                    />
                </main>
            </div>
        </div>
    );
}
