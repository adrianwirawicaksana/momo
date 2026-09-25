'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { createClass, deleteClass, getClassDetail, getClassProgress, getClasses, removeModuleFromClass, updateClass, type ClassDetail, type ClassProgressItem, type ClassSummary, type UpdateClassPayload } from '@/api/kelas/route';
import { assignModuleToClass, createModule, deleteModule, getModuleDetail, getModuleQuestions, getModules, updateModule, uploadModuleMaterial, uploadModuleQuestions, type ModulMaterial, type ModulSoal, type ModulSummary } from '@/api/modul/route';
import type { DashboardContentProps } from '../_components/DashboardContent';
import type { DashboardTab, QuestionItem, QuestionType } from '../_components/types';

type ControllerProps = Omit<DashboardContentProps, 'activeTab'>;

export function useDashboardController(activeTab: DashboardTab) {
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
    const [studentProgress, setStudentProgress] = useState<ClassProgressItem[]>([]);
    const [progressSummary, setProgressSummary] = useState<{ totalStudents: number; averageScore: number; materiSelesai: number; studentsNeedingAttention: number; } | null>(null);
    const [isProcessingClass, setIsProcessingClass] = useState(false);
    const [isCreatingClass, setIsCreatingClass] = useState(false);
    const [materiPdfFile, setMateriPdfFile] = useState<File | null>(null);
    const [materiModuleId, setMateriModuleId] = useState<number | null>(null);
    const [isGeneratingMateri, setIsGeneratingMateri] = useState(false);
    const [isSavingMateri, setIsSavingMateri] = useState(false);
    const [generatedMateri, setGeneratedMateri] = useState<ModulMaterial[]>([]);
    const [soalPdfFile, setSoalPdfFile] = useState<File | null>(null);
    const [questionType, setQuestionType] = useState<QuestionType>('uts');
    const [soalModuleId, setSoalModuleId] = useState<number | null>(null);
    const [isGeneratingSoal, setIsGeneratingSoal] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState<QuestionItem[]>([]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            const token = window.localStorage.getItem('auth_token');
            if (!token) { setIsLoadingClasses(false); return; }
            void Promise.all([getClasses(token), getModules(token)]).then(([classes, modules]) => {
                setAvailableClasses(classes); setAvailableModules(modules);
                setMateriModuleId(modules[0]?.id ?? null); setSoalModuleId(modules[0]?.id ?? null);
                if (classes.length === 0) return;
                const storedClassId = Number(window.localStorage.getItem('active_class_id'));
                const selectedClass = classes.find((item) => item.id === storedClassId) ?? classes[classes.length - 1];
                setClassId(selectedClass.id); setModuleClassId(selectedClass.id);
                window.localStorage.setItem('active_class_id', String(selectedClass.id));
            }).catch(() => toast.error('Daftar kelas guru gagal dimuat.')).finally(() => setIsLoadingClasses(false));
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, []);

    const fetchClassDetail = useCallback(async (id: number, token: string): Promise<ClassDetail> => {
        const detail = await getClassDetail(id, token);
        const modules = await Promise.all(detail.modul.map(async (module) => {
            try { return { ...module, ...await getModuleDetail(module.id, token) }; } catch { return module; }
        }));
        return { ...detail, modul: modules };
    }, []);

    const loadClassDetail = useCallback(async (id: number) => {
        const token = localStorage.getItem('auth_token'); if (!token) return;
        setIsLoadingClass(true);
        try {
            const detail = await fetchClassDetail(id, token);
            const progressResponse = await getClassProgress(id, token);

            const normalizedProgress = Array.isArray(progressResponse)
                ? progressResponse
                : progressResponse.siswa.map((student) => ({
                    siswa_id: student.siswa_id,
                    nama: student.nama,
                    jumlah_soal_dijawab: student.soal_dikerjakan,
                    jumlah_benar: Math.round((student.soal_dikerjakan * student.nilai_rata) / 100),
                    skor_persen: Number(student.nilai_rata ?? 0),
                }));

            const summary = Array.isArray(progressResponse)
                ? null
                : {
                    totalStudents: progressResponse.ringkasan.total_siswa,
                    averageScore: progressResponse.ringkasan.rata_nilai,
                    materiSelesai: progressResponse.ringkasan.materi_selesai,
                    studentsNeedingAttention: progressResponse.ringkasan.perlu_perhatian,
                };

            setClassDetail(detail);
            setClassDetails((current) => ({ ...current, [detail.id]: detail }));
            setClassId(detail.id);
            setStudentProgress(normalizedProgress);
            setProgressSummary(summary);
        } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.message || error.response?.data?.error : undefined;
            toast.error(message || 'Detail kelas gagal dimuat.');
            setStudentProgress([]);
            setProgressSummary(null);
        } finally { setIsLoadingClass(false); }
    }, [fetchClassDetail]);

    const loadAllClassDetails = useCallback(async (classes: ClassSummary[]) => {
        const token = localStorage.getItem('auth_token'); if (!token || classes.length === 0) return;
        setIsLoadingClass(true);
        const details = await Promise.all(classes.map(async (item) => { try { return await fetchClassDetail(item.id, token); } catch { return null; } }));
        setClassDetails(Object.fromEntries(details.filter((detail): detail is ClassDetail => detail !== null).map((detail) => [detail.id, detail])));
        setIsLoadingClass(false);
    }, [fetchClassDetail]);

    const refreshClasses = async () => {
        const token = localStorage.getItem('auth_token'); if (!token) return [];
        const classes = await getClasses(token); setAvailableClasses(classes); return classes;
    };
    const copyClassCode = (code: string) => {
        if (!code) { toast.error('Kode kelas belum tersedia. Buat kelas terlebih dahulu!'); return; }
        navigator.clipboard.writeText(code); toast.success('Kode kelas disalin ke clipboard!');
    };
    const handleClassChange = (id: number) => {
        setClassId(id); setClassDetail(null); setStudentProgress([]); setProgressSummary(null); window.localStorage.setItem('active_class_id', String(id));
    };
    const getErrorMessage = (error: unknown) => axios.isAxiosError(error) ? error.response?.data?.message || error.response?.data?.error : undefined;

    const handleUpdateClass = async (id: number, payload: UpdateClassPayload) => {
        const token = localStorage.getItem('auth_token'); if (!token) { toast.error('Sesi login tidak ditemukan.'); return; }
        setIsProcessingClass(true);
        try { await updateClass(id, payload, token); await refreshClasses(); if (classId === id) await loadClassDetail(id); toast.success('Data kelas berhasil diperbarui.'); }
        catch (error) { toast.error(getErrorMessage(error) || 'Data kelas gagal diperbarui.'); throw error; }
        finally { setIsProcessingClass(false); }
    };
    const handleDeleteClass = async (id: number) => {
        const token = localStorage.getItem('auth_token'); if (!token) { toast.error('Sesi login tidak ditemukan.'); return; }
        setIsProcessingClass(true);
        try {
            const detail = await getClassDetail(id, token); await Promise.all(detail.modul.map((module) => removeModuleFromClass(id, module.id, token))); await deleteClass(id, token);
            const classes = await refreshClasses();
            if (classId === id) { const nextClass = classes[0]; setClassId(nextClass?.id ?? null); setClassDetail(null); if (nextClass) window.localStorage.setItem('active_class_id', String(nextClass.id)); else window.localStorage.removeItem('active_class_id'); }
            toast.success('Kelas berhasil dihapus.');
        } catch (error) { toast.error(getErrorMessage(error) || 'Kelas gagal dihapus.'); throw error; }
        finally { setIsProcessingClass(false); }
    };
    const handleCreateClass = async (event: React.FormEvent) => {
        event.preventDefault(); if (isCreatingClass) return;
        if (!className || !subject) { toast.error('Mohon isi nama kelas dan mata pelajaran!'); return; }
        const token = localStorage.getItem('auth_token'); if (!token) { toast.error('Sesi login tidak ditemukan. Silakan masuk kembali.'); return; }
        setIsCreatingClass(true); setGeneratedClassCode(''); setGeneratedClassName(''); setGeneratedSubject('');
        try {
            const response = await createClass({ nama: className.trim(), mata_pelajaran: subject.trim() }, token); const createdClassId = response.id ?? response.kelas_id; const generatedCode = response.kode_kelas;
            if (createdClassId) { setClassId(createdClassId); window.localStorage.setItem('active_class_id', String(createdClassId)); await loadClassDetail(createdClassId); }
            const refreshedClasses = await getClasses(token).catch(() => null); if (refreshedClasses) setAvailableClasses(refreshedClasses);
            setGeneratedClassCode(generatedCode ?? ''); setGeneratedClassName(className.trim()); setGeneratedSubject(subject.trim());
            toast.success(generatedCode ? `Kelas "${className}" (${generatedCode}) berhasil dibuat!` : `Kelas "${className}" berhasil dibuat!`); setClassName(''); setSubject('');
        } catch (error) { toast.error(getErrorMessage(error) || 'Kelas gagal dibuat. Silakan coba lagi.'); }
        finally { setIsCreatingClass(false); }
    };
    const handleCreateModule = async (event: React.FormEvent) => {
        event.preventDefault(); if (!moduleClassId) { toast.error('Pilih kelas tujuan terlebih dahulu.'); return; }
        const token = localStorage.getItem('auth_token'); if (!token) { toast.error('Sesi login tidak ditemukan.'); return; }
        setIsProcessingClass(true);
        try { const createdModule = await createModule({ nama: moduleName.trim(), deskripsi: moduleDescription.trim() || undefined }, token); await assignModuleToClass(moduleClassId, createdModule.id, token); setAvailableModules(await getModules(token)); setMateriModuleId(createdModule.id); setSoalModuleId(createdModule.id); setModuleName(''); setModuleDescription(''); toast.success('Modul berhasil dibuat dan ditautkan ke kelas.'); }
        catch (error) { toast.error(getErrorMessage(error) || 'Modul gagal dibuat atau ditautkan.'); }
        finally { setIsProcessingClass(false); }
    };
    const handleUpdateModule = async (id: number, payload: { nama?: string; deskripsi?: string }) => {
        const token = localStorage.getItem('auth_token'); if (!token) { toast.error('Sesi login tidak ditemukan.'); return; }
        setIsProcessingClass(true);
        try { await updateModule(id, payload, token); setAvailableModules(await getModules(token)); if (classId) await loadClassDetail(classId); toast.success('Modul berhasil diperbarui.'); }
        catch (error) { toast.error(getErrorMessage(error) || 'Modul gagal diperbarui.'); throw error; }
        finally { setIsProcessingClass(false); }
    };
    const handleDeleteModule = async (id: number) => {
        const token = localStorage.getItem('auth_token'); if (!token) { toast.error('Sesi login tidak ditemukan.'); return; }
        setIsProcessingClass(true);
        try {
            const classes = await getClasses(token); const details = await Promise.all(classes.map(async (item) => { try { return await getClassDetail(item.id, token); } catch { return null; } }));
            const assignedClassIds = details.filter((detail): detail is ClassDetail => detail !== null).filter((detail) => detail.modul.some((module) => module.id === id)).map((detail) => detail.id);
            await Promise.all(assignedClassIds.map((assignedClassId) => removeModuleFromClass(assignedClassId, id, token))); await deleteModule(id, token);
            const modules = await getModules(token); setAvailableModules(modules); setMateriModuleId((current) => current === id ? modules[0]?.id ?? null : current); setSoalModuleId((current) => current === id ? modules[0]?.id ?? null : current); if (classId) await loadClassDetail(classId); toast.success('Modul dan seluruh isinya berhasil dihapus.');
        } catch (error) { toast.error(getErrorMessage(error) || 'Modul gagal dihapus.'); throw error; }
        finally { setIsProcessingClass(false); }
    };

    const validatePdf = (event: React.ChangeEvent<HTMLInputElement>, onValidFile: (file: File) => void) => {
        const file = event.target.files?.[0]; if (!file) return;
        if (file.type !== 'application/pdf') { toast.error('Harap unggah berkas berformat PDF!'); return; }
        onValidFile(file); toast.success(`PDF "${file.name}" berhasil diunggah!`);
    };
    const handleMateriPdfChange = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file && file.size > 25 * 1024 * 1024) { toast.error('Ukuran PDF materi terlalu besar. Maksimal 25 MB.'); return; } validatePdf(event, setMateriPdfFile); };
    const handleSoalPdfChange = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file && file.size > 5 * 1024 * 1024) { toast.error('Ukuran PDF soal terlalu besar. Maksimal 5 MB.'); return; } validatePdf(event, setSoalPdfFile); };
    const handleGenerateMateri = async (event: React.FormEvent) => {
        event.preventDefault(); if (!materiPdfFile) { toast.error('Harap unggah dokumen PDF materi terlebih dahulu!'); return; } if (!materiModuleId) { toast.error('Pilih modul tujuan terlebih dahulu.'); return; }
        const token = localStorage.getItem('auth_token'); if (!token) { toast.error('Sesi login tidak ditemukan.'); return; }
        setIsGeneratingMateri(true); setGeneratedMateri([]);
        try { const response = await uploadModuleMaterial(materiModuleId, materiPdfFile, token); setGeneratedMateri(response.data); toast.success(`${response.jumlah} bagian materi berhasil diproses dan disimpan.`); }
        catch (error) { toast.error(getErrorMessage(error) || 'Materi gagal diproses.'); } finally { setIsGeneratingMateri(false); }
    };
    const handleSaveMateri = async () => {
        if (!materiModuleId || generatedMateri.length === 0) { toast.error('Generate materi terlebih dahulu sebelum menyimpan.'); return; } if (!classId) { toast.error('Pilih kelas tujuan terlebih dahulu.'); return; }
        const token = localStorage.getItem('auth_token'); if (!token) { toast.error('Sesi login tidak ditemukan.'); return; } setIsSavingMateri(true);
        try { const detail = await getClassDetail(classId, token); const isModuleAssigned = detail.modul.some((module) => module.id === materiModuleId); if (!isModuleAssigned) await assignModuleToClass(classId, materiModuleId, token); await loadClassDetail(classId); toast.success(isModuleAssigned ? 'Materi sudah tersedia di kelas.' : 'Modul dan materi berhasil ditambahkan ke kelas.'); }
        catch (error) { toast.error(getErrorMessage(error) || 'Materi gagal disimpan ke modul.'); } finally { setIsSavingMateri(false); }
    };
    const handleGenerateSoal = async (event: React.FormEvent) => {
        event.preventDefault(); if (!soalPdfFile) { toast.error('Harap unggah dokumen PDF sumber soal!'); return; } if (!soalModuleId) { toast.error('Pilih modul tujuan terlebih dahulu.'); return; } if (!classId) { toast.error('Pilih kelas aktif terlebih dahulu sebelum membuat soal.'); return; }
        const token = localStorage.getItem('auth_token'); if (!token) { toast.error('Sesi login tidak ditemukan.'); return; } setIsGeneratingSoal(true); setGeneratedQuestions([]);
        try {
            const generationStartedAt = Date.now();
            const previousItems = await getModuleQuestions(soalModuleId, questionType, token);
            const previousIds = new Set(previousItems.map((item) => item.id));
            const detail = await getClassDetail(classId, token); if (!detail.modul.some((module) => module.id === soalModuleId)) await assignModuleToClass(classId, soalModuleId, token); await uploadModuleQuestions(soalModuleId, soalPdfFile, questionType, token);
            let items: ModulSoal[] = []; const maxPollingAttempts = 60;
            for (let attempt = 0; attempt < maxPollingAttempts; attempt += 1) { await new Promise((resolve) => window.setTimeout(resolve, attempt === 0 ? 1500 : 5000)); try { const currentItems = await getModuleQuestions(soalModuleId, questionType, token); items = currentItems.filter((item) => !previousIds.has(item.id)); if (items.length > 0) break; } catch (error) { if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error; } }
            if (items.length === 0) throw new Error(`Soal belum selesai diproses setelah ${Math.round((Date.now() - generationStartedAt) / 1000)} detik. Silakan cek kembali beberapa saat lagi.`);
            setGeneratedQuestions(items.map((item, index) => ({ id: index + 1, question: item.pertanyaan, options: [item.pilihan_a, item.pilihan_b, item.pilihan_c, item.pilihan_d] }))); toast.success(`${items.length} soal ${questionType.toUpperCase()} berhasil diproses dan disimpan ke modul!`);
        } catch (error) { const message = axios.isAxiosError(error) ? error.response?.data?.message || error.response?.data?.error || (error.response?.status === 403 ? 'Akses ditolak. Pastikan modul yang dipilih milik akun guru yang sedang login.' : undefined) : undefined; toast.error(message || (error instanceof Error ? error.message : 'Soal gagal diproses.')); }
        finally { setIsGeneratingSoal(false); }
    };
    const handleSaveSoal = async () => {
        if (generatedQuestions.length === 0) { toast.error('Generate soal terlebih dahulu sebelum menyimpan.'); return; }
        if (!soalModuleId || !classId) { toast.error('Pilih modul dan kelas tujuan terlebih dahulu.'); return; }
        const token = localStorage.getItem('auth_token'); if (!token) { toast.error('Sesi login tidak ditemukan.'); return; }
        try {
            const detail = await getClassDetail(classId, token);
            if (!detail.modul.some((module) => module.id === soalModuleId)) await assignModuleToClass(classId, soalModuleId, token);
            await loadClassDetail(classId);
            toast.success('Soal berhasil disimpan ke kelas.');
        } catch (error) { toast.error(getErrorMessage(error) || 'Soal gagal disimpan ke kelas.'); }
    };
    const handleDownloadSoal = () => {
        if (generatedQuestions.length === 0) return;
        const moduleName = availableModules.find((module) => module.id === soalModuleId)?.nama || 'Modul'; const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const content = generatedQuestions.map((question) => `<article><h2>${question.id}. ${escapeHtml(question.question)}</h2><ul>${question.options.map((option, index) => `<li><strong>${String.fromCharCode(65 + index)}.</strong> ${escapeHtml(option)}</li>`).join('')}</ul>${question.answer ? `<p><strong>Kunci jawaban:</strong> ${escapeHtml(question.answer)}</p>` : ''}${question.explanation ? `<p>${escapeHtml(question.explanation)}</p>` : ''}</article>`).join('');
        const printWindow = window.open('', '_blank', 'width=900,height=700'); if (!printWindow) { toast.error('Popup diblokir browser. Izinkan popup untuk mengunduh PDF.'); return; }
        printWindow.document.write(`<!doctype html><html><head><title>Soal - ${escapeHtml(moduleName)}</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#172033;padding:40px}h1{font-size:24px;border-bottom:1px solid #cbd5e1;padding-bottom:12px}h2{font-size:18px;margin-top:24px}li{margin:6px 0}@media print{body{padding:0}}</style></head><body><h1>Soal - ${escapeHtml(moduleName)}</h1><p>Jenis: ${questionType.toUpperCase()}</p>${content}</body></html>`); printWindow.document.close(); printWindow.focus(); printWindow.print();
    };

    useEffect(() => { if (activeTab !== 'progress' || !classId) return; const timeoutId = window.setTimeout(() => void loadClassDetail(classId), 0); return () => window.clearTimeout(timeoutId); }, [activeTab, classId, loadClassDetail]);
    useEffect(() => { if (activeTab !== 'kelola-kelas' || availableClasses.length === 0) return; const timeoutId = window.setTimeout(() => void loadAllClassDetails(availableClasses), 0); return () => window.clearTimeout(timeoutId); }, [activeTab, availableClasses, loadAllClassDetails]);

    const contentProps: ControllerProps = {
        classes: availableClasses, classDetails, modules: availableModules, selectedClassId: classId, classDetail, studentProgress, progressSummary, isLoadingClass, isProcessingClass, isCreatingClass,
        generatedClassCode, generatedClassName, generatedSubject, className, subject, moduleClassId, moduleName, moduleDescription, materiModuleId, materiPdfFile,
        isGeneratingMateri, isSavingMateri, generatedMateri, materiModuleName: availableModules.find((module) => module.id === materiModuleId)?.nama || 'Modul', soalModuleId, soalPdfFile,
        questionType, isGeneratingSoal, generatedQuestions, onClassChange: handleClassChange, onUpdateClass: handleUpdateClass, onDeleteClass: handleDeleteClass,
        onCopyClassCode: copyClassCode, onCreateClass: handleCreateClass, onClassNameChange: setClassName, onSubjectChange: setSubject, onModuleClassChange: setModuleClassId,
        onModuleNameChange: setModuleName, onModuleDescriptionChange: setModuleDescription, onCreateModule: handleCreateModule, onUpdateModule: handleUpdateModule, onDeleteModule: handleDeleteModule,
        onMateriFileChange: handleMateriPdfChange, onMateriFileRemove: () => setMateriPdfFile(null), onMateriModuleChange: setMateriModuleId, onGenerateMateri: handleGenerateMateri,
        onSaveMateri: handleSaveMateri, onSoalFileChange: handleSoalPdfChange, onSoalFileRemove: () => setSoalPdfFile(null),
        onQuestionTypeChange: setQuestionType, onSoalModuleChange: setSoalModuleId, onGenerateSoal: handleGenerateSoal, onSaveSoal: handleSaveSoal, onDownloadSoal: handleDownloadSoal,
    };
    return { contentProps, isLoadingClasses, isLoadingClass, isProcessingClass, isCreatingClass, isGeneratingMateri, isSavingMateri, isGeneratingSoal };
}