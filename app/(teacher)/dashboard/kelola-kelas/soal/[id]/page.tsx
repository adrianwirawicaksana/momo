'use client';

import { ArrowLeft, BookOpen, CalendarDays, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { createManualQuestion, deleteQuestion, getModuleDetail, getModuleQuestionList, updateQuestion, type ModulDetail, type ModulSoal } from '@/api/modul/route';
import { DashboardTabs } from '../../../_components/DashboardTabs';
import { GlobalLoading } from '@/components/shared/GlobalLoading';

const questionTypes = ['harian', 'uts', 'uas'] as const;
type QuestionFormState = {
    jenis: (typeof questionTypes)[number];
    pertanyaan: string;
    pilihan_a: string;
    pilihan_b: string;
    pilihan_c: string;
    pilihan_d: string;
    kunci_jawaban: 'A' | 'B' | 'C' | 'D';
};

const emptyForm = (): QuestionFormState => ({
    jenis: 'uts',
    pertanyaan: '',
    pilihan_a: '',
    pilihan_b: '',
    pilihan_c: '',
    pilihan_d: '',
    kunci_jawaban: 'A',
});

const formatDate = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(date);
};

export default function SoalManagementPage() {
    const params = useParams<{ id: string }>();
    const [module, setModule] = useState<ModulDetail | null>(null);
    const [questions, setQuestions] = useState<ModulSoal[]>([]);
    const [selectedType, setSelectedType] = useState<(typeof questionTypes)[number]>('uts');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<QuestionFormState>(emptyForm());

    const resetForm = (nextType: (typeof questionTypes)[number] = selectedType) => {
        setEditingId(null);
        setForm({ ...emptyForm(), jenis: nextType });
    };

    const loadQuestions = async (moduleId: number, type: (typeof questionTypes)[number], token: string) => {
        const list = await getModuleQuestionList(moduleId, type, token);
        setQuestions(list);
    };

    useEffect(() => {
        const moduleId = Number(params.id);
        const token = window.localStorage.getItem('auth_token');
        if (!moduleId || !token) {
            void Promise.resolve().then(() => setIsLoading(false));
            return;
        }

        void Promise.all([
            getModuleDetail(moduleId, token),
            getModuleQuestionList(moduleId, selectedType, token),
        ])
            .then(([detail, list]) => {
                setModule(detail);
                setQuestions(list);
                setForm((current) => ({ ...current, jenis: selectedType }));
            })
            .catch(() => toast.error('Data soal gagal dimuat.'))
            .finally(() => setIsLoading(false));
    }, [params.id, selectedType]);

    const saveQuestion = async (event: FormEvent) => {
        event.preventDefault();
        const moduleId = Number(params.id);
        const token = window.localStorage.getItem('auth_token');

        if (!moduleId || !token) {
            toast.error('Sesi login tidak ditemukan.');
            return;
        }

        const payload = {
            jenis: form.jenis,
            pertanyaan: form.pertanyaan.trim(),
            pilihan_a: form.pilihan_a.trim(),
            pilihan_b: form.pilihan_b.trim(),
            pilihan_c: form.pilihan_c.trim(),
            pilihan_d: form.pilihan_d.trim(),
            kunci_jawaban: form.kunci_jawaban,
        };

        if (!payload.pertanyaan || !payload.pilihan_a || !payload.pilihan_b || !payload.pilihan_c || !payload.pilihan_d) {
            toast.error('Semua field soal harus diisi.');
            return;
        }

        setIsSaving(true);
        try {
            if (editingId) {
                await updateQuestion(editingId, payload, token);
                toast.success('Soal berhasil diperbarui.');
            } else {
                await createManualQuestion(moduleId, payload, token);
                toast.success('Soal berhasil ditambahkan.');
            }
            await loadQuestions(moduleId, payload.jenis, token);
            resetForm(payload.jenis);
        } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.error || error.response?.data?.message : undefined;
            toast.error(message || 'Soal gagal disimpan.');
        } finally {
            setIsSaving(false);
        }
    };

    const startEdit = (item: ModulSoal) => {
        setEditingId(item.id);
        setSelectedType(item.jenis);
        setForm({
            jenis: item.jenis,
            pertanyaan: item.pertanyaan,
            pilihan_a: item.pilihan_a,
            pilihan_b: item.pilihan_b,
            pilihan_c: item.pilihan_c,
            pilihan_d: item.pilihan_d,
            kunci_jawaban: 'A',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const removeQuestion = async (item: ModulSoal) => {
        const token = window.localStorage.getItem('auth_token');
        if (!token || !window.confirm(`Hapus soal "${item.pertanyaan.slice(0, 60)}${item.pertanyaan.length > 60 ? '...' : ''}"?`)) return;

        try {
            await deleteQuestion(item.id, token);
            setQuestions((current) => current.filter((question) => question.id !== item.id));
            toast.success('Soal berhasil dihapus.');
            if (editingId === item.id) resetForm(selectedType);
        } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.error || error.response?.data?.message : undefined;
            toast.error(message || 'Soal gagal dihapus.');
        }
    };

    const createdAt = formatDate(module?.created_at);

    return <div className="flex h-[calc(100dvh-5rem)] min-h-0 overflow-hidden bg-slate-900 font-(family-name:--font-nunito) text-slate-100">
        <div className="flex h-full min-h-0 w-full flex-col gap-5 overflow-hidden p-3 sm:gap-6 sm:p-6 lg:flex-row lg:items-start lg:gap-0 lg:p-0">
            <div className="print:hidden">
                <DashboardTabs activeTab="kelola-kelas" />
            </div>
            <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-1 py-2 sm:px-0 lg:h-full lg:p-8">
                <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden">
                    {isLoading ? <GlobalLoading label="Soal sedang dimuat..." /> : !module ? <div className="rounded-3xl border border-slate-800 bg-slate-800/90 p-8 text-center shadow-xl"><BookOpen className="mx-auto h-12 w-12 text-slate-600" /><h1 className="mt-4 text-xl font-bold">Soal tidak ditemukan</h1><p className="mt-2 text-slate-400">Modul ini tidak dapat diakses atau belum tersedia.</p></div> : <article className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/90 shadow-xl">
                        <header className="shrink-0 border-b border-slate-700 bg-slate-800 px-6 py-7 sm:px-10">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 text-blue-300"><BookOpen className="h-6 w-6" /><span className="text-sm font-semibold uppercase tracking-wider">Kelola Soal</span></div>
                                    <h1 className="mt-4 font-(family-name:--font-poppins) text-3xl font-black tracking-tight text-white sm:text-4xl">{module.judul || module.nama || `Modul ${module.id}`}</h1>
                                    {module.deskripsi && <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-200">{module.deskripsi}</p>}
                                    {createdAt && <p className="mt-5 flex items-center gap-2 text-sm text-slate-300"><CalendarDays className="h-4 w-4" /> Dibuat {createdAt}</p>}
                                </div>
                                <div className="flex shrink-0 flex-wrap gap-2">
                                    <Link href="/dashboard/kelola-kelas" className="game-button game-button-blue flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm sm:min-h-11 sm:px-4 sm:py-2.5"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
                                    <button type="button" onClick={() => resetForm(selectedType)} className="game-button game-button-yellow flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm sm:min-h-11 sm:px-4 sm:py-2.5"><Plus className="h-4 w-4" /> Tambah Soal</button>
                                </div>
                            </div>
                        </header>

                        <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-10 sm:py-6 lg:px-14">
                            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4 shadow-lg shadow-slate-950/20 sm:p-5">
                                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <h2 className="text-xl font-bold text-white">Daftar Soal</h2>
                                                <p className="mt-1 text-sm text-slate-400">Kelola bank soal per jenis ujian.</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm font-medium text-slate-300">Jenis</label>
                                                <select value={selectedType} onChange={(event) => setSelectedType(event.target.value as (typeof questionTypes)[number])} className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
                                                    {questionTypes.map((type) => <option key={type} value={type}>{type.toUpperCase()}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {questions.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center"><BookOpen className="mx-auto h-9 w-9 text-slate-600" /><p className="mt-3 text-base font-medium text-slate-300">Belum ada soal untuk jenis {selectedType.toUpperCase()}.</p><p className="mt-1 text-sm text-slate-500">Tambahkan soal baru di panel kanan untuk mulai membuat bank soal.</p></div> : questions.map((item, index) => (
                                                <div key={item.id} className="rounded-2xl border border-slate-700 bg-slate-950/40 p-4 transition hover:border-blue-500/60 hover:bg-slate-950/60">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-500/15 px-1.5 text-xs font-bold text-blue-300">{index + 1}</span>
                                                                <p className="min-w-0 text-base font-bold text-white">{item.pertanyaan}</p>
                                                            </div>
                                                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                                                {[item.pilihan_a, item.pilihan_b, item.pilihan_c, item.pilihan_d].map((option, optionIndex) => <div key={`${item.id}-${optionIndex}`} className="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-200"><span className="mr-2 font-bold text-blue-300">{String.fromCharCode(65 + optionIndex)}.</span>{option}</div>)}
                                                            </div>
                                                            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-blue-300">Jenis: {item.jenis}</p>
                                                        </div>
                                                        <div className="flex shrink-0 gap-2">
                                                            <button type="button" onClick={() => startEdit(item)} className="game-button game-button-blue rounded-lg p-2" title="Edit soal"><Pencil className="h-4 w-4" /></button>
                                                            <button type="button" onClick={() => void removeQuestion(item)} className="game-button game-button-danger rounded-lg p-2" title="Hapus soal"><Trash2 className="h-4 w-4" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <aside className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4 shadow-lg shadow-slate-950/20 sm:p-5">
                                    <div className="mb-4">
                                        <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Soal' : 'Tambah Soal Baru'}</h2>
                                        <p className="mt-1 text-sm text-slate-400">{editingId ? 'Perbarui data soal yang dipilih.' : 'Buat soal manual untuk jenis yang sedang dipilih.'}</p>
                                    </div>

                                    <form onSubmit={saveQuestion} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-200">Jenis soal</label>
                                            <select value={form.jenis} onChange={(event) => setForm((current) => ({ ...current, jenis: event.target.value as QuestionFormState['jenis'] }))} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-base text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                                                {questionTypes.map((type) => <option key={type} value={type}>{type.toUpperCase()}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="soal-pertanyaan" className="text-sm font-semibold text-slate-200">Pertanyaan</label>
                                            <textarea id="soal-pertanyaan" value={form.pertanyaan} onChange={(event) => setForm((current) => ({ ...current, pertanyaan: event.target.value }))} rows={4} placeholder="Masukkan pertanyaan" className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-base text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                                        </div>

                                        {(['pilihan_a', 'pilihan_b', 'pilihan_c', 'pilihan_d'] as const).map((key, index) => (
                                            <div key={key} className="space-y-2">
                                                <label htmlFor={`soal-${key}`} className="text-sm font-semibold text-slate-200">Pilihan {String.fromCharCode(65 + index)}</label>
                                                <input id={`soal-${key}`} value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} placeholder={`Jawaban ${String.fromCharCode(65 + index)}`} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-base text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                                            </div>
                                        ))}

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-200">Kunci jawaban</label>
                                            <select value={form.kunci_jawaban} onChange={(event) => setForm((current) => ({ ...current, kunci_jawaban: event.target.value as QuestionFormState['kunci_jawaban'] }))} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-base text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                                                {(['A', 'B', 'C', 'D'] as const).map((answer) => <option key={answer} value={answer}>{answer}</option>)}
                                            </select>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <button type="submit" disabled={isSaving} className="game-button game-button-blue inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" /> {isSaving ? 'Menyimpan...' : editingId ? 'Perbarui Soal' : 'Simpan Soal'}</button>
                                            <button type="button" onClick={() => resetForm(selectedType)} className="game-button game-button-yellow inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><X className="h-4 w-4" /> Batal</button>
                                        </div>
                                    </form>
                                </aside>
                            </div>
                        </section>
                    </article>}
                </div>
            </main>
        </div>
    </div>;
}
