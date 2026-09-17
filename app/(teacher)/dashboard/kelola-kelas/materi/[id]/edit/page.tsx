'use client';

import { ArrowLeft, BookOpen, CalendarDays, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { createManualMaterial, deleteMaterial, getModuleDetail, getModuleMaterials, updateMaterial, type ModulDetail, type ModulMaterial } from '@/api/modul/route';
import { DashboardTabs } from '../../../../_components/DashboardTabs';
import { GlobalLoading } from '@/components/shared/GlobalLoading';

const formatDate = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(date);
};

export default function MateriEditPage() {
    const params = useParams<{ id: string }>();
    const [module, setModule] = useState<ModulDetail | null>(null);
    const [materials, setMaterials] = useState<ModulMaterial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [order, setOrder] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setContent('');
        setOrder('');
    };

    const loadMaterials = async (moduleId: number, token: string) => {
        setMaterials(await getModuleMaterials(moduleId, token));
    };

    useEffect(() => {
        const moduleId = Number(params.id);
        const token = window.localStorage.getItem('auth_token');
        if (!moduleId || !token) {
            void Promise.resolve().then(() => setIsLoading(false));
            return;
        }

        void Promise.all([getModuleDetail(moduleId, token), getModuleMaterials(moduleId, token)])
            .then(([detail, items]) => {
                setModule(detail);
                setMaterials(items);
            })
            .catch(() => toast.error('Data materi gagal dimuat.'))
            .finally(() => setIsLoading(false));
    }, [params.id]);

    const startEdit = (item: ModulMaterial) => {
        setEditingId(item.id);
        setTitle(item.judul);
        setContent(item.konten);
        setOrder(String(item.urutan));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const saveMaterial = async (event: FormEvent) => {
        event.preventDefault();
        const moduleId = Number(params.id);
        const token = window.localStorage.getItem('auth_token');
        if (!moduleId || !token || !title.trim() || !content.trim()) {
            toast.error('Judul dan konten materi wajib diisi.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                judul: title.trim(),
                konten: content.trim(),
                ...(order && Number(order) > 0 ? { urutan: Number(order) } : {}),
            };
            if (editingId) {
                await updateMaterial(editingId, payload, token);
                toast.success('Materi berhasil diperbarui.');
            } else {
                await createManualMaterial(moduleId, payload, token);
                toast.success('Materi berhasil ditambahkan.');
            }
            await loadMaterials(moduleId, token);
            resetForm();
        } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.error || error.response?.data?.message : undefined;
            toast.error(message || 'Materi gagal disimpan.');
        } finally {
            setIsSaving(false);
        }
    };

    const removeMaterial = async (item: ModulMaterial) => {
        const token = window.localStorage.getItem('auth_token');
        if (!token || !window.confirm(`Hapus materi "${item.judul}"?`)) return;
        try {
            await deleteMaterial(item.id, token);
            setMaterials((current) => current.filter((material) => material.id !== item.id));
            toast.success('Materi berhasil dihapus.');
            if (editingId === item.id) {
                resetForm();
            }
        } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.error || error.response?.data?.message : undefined;
            toast.error(message || 'Materi gagal dihapus.');
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
                    {isLoading ? <GlobalLoading label="Materi sedang dimuat..." /> : !module ? <div className="rounded-3xl border border-slate-800 bg-slate-800/90 p-8 text-center shadow-xl"><BookOpen className="mx-auto h-12 w-12 text-slate-600" /><h1 className="mt-4 text-xl font-bold">Materi tidak ditemukan</h1><p className="mt-2 text-slate-400">Modul ini tidak dapat diakses atau belum tersedia.</p></div> : <article className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/90 shadow-xl">
                        <header className="shrink-0 border-b border-slate-700 bg-slate-800 px-6 py-7 sm:px-10">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 text-blue-300"><BookOpen className="h-6 w-6" /><span className="text-sm font-semibold uppercase tracking-wider">Kelola Materi</span></div>
                                    <h1 className="mt-4 font-(family-name:--font-poppins) text-3xl font-black tracking-tight text-white sm:text-4xl">{module.judul || module.nama || `Modul ${module.id}`}</h1>
                                    {module.deskripsi && <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-200">{module.deskripsi}</p>}
                                    {createdAt && <p className="mt-5 flex items-center gap-2 text-sm text-slate-300"><CalendarDays className="h-4 w-4" /> Dibuat {createdAt}</p>}
                                </div>
                                <div className="flex shrink-0 flex-wrap gap-2">
                                    <Link href={`/dashboard/kelola-kelas/materi/${module.id}`} className="game-button game-button-blue flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm sm:min-h-11 sm:px-4 sm:py-2.5"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
                                    <button type="button" onClick={() => { resetForm(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="game-button game-button-yellow flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm sm:min-h-11 sm:px-4 sm:py-2.5"><Plus className="h-4 w-4" /> Tambah Materi</button>
                                </div>
                            </div>
                        </header>

                        <section className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-10 sm:py-6 lg:px-14">
                            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4 shadow-lg shadow-slate-950/20 sm:p-5">
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <div>
                                                <h2 className="text-xl font-bold text-white">Daftar Materi</h2>
                                                <p className="mt-1 text-sm text-slate-400">Kelola isi materi yang sudah ditambahkan ke modul ini.</p>
                                            </div>
                                            <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-300">{materials.length} item</span>
                                        </div>

                                        <div className="space-y-3">
                                            {materials.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center"><BookOpen className="mx-auto h-9 w-9 text-slate-600" /><p className="mt-3 text-base font-medium text-slate-300">Belum ada materi tersimpan.</p><p className="mt-1 text-sm text-slate-500">Tambahkan materi baru di panel kanan untuk mulai mengisi modul.</p></div> : materials.map((item) => (
                                                <div key={item.id} className="rounded-2xl border border-slate-700 bg-slate-950/40 p-4 transition hover:border-blue-500/60 hover:bg-slate-950/60">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-500/15 px-1.5 text-xs font-bold text-blue-300">{item.urutan ?? 1}</span>
                                                                <p className="min-w-0 truncate text-base font-bold text-white">{item.judul}</p>
                                                            </div>
                                                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">{item.konten}</p>
                                                        </div>
                                                        <div className="flex shrink-0 gap-2">
                                                            <button type="button" onClick={() => startEdit(item)} className="game-button game-button-blue rounded-lg p-2" title="Edit materi"><Pencil className="h-4 w-4" /></button>
                                                            <button type="button" onClick={() => void removeMaterial(item)} className="game-button game-button-danger rounded-lg p-2" title="Hapus materi"><Trash2 className="h-4 w-4" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <aside className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4 shadow-lg shadow-slate-950/20 sm:p-5">
                                    <div className="mb-4">
                                        <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Materi' : 'Tambah Materi Baru'}</h2>
                                        <p className="mt-1 text-sm text-slate-400">{editingId ? 'Perbarui isi materi yang dipilih.' : 'Masukkan judul, urutan, dan konten materi baru.'}</p>
                                    </div>

                                    <form onSubmit={saveMaterial} className="space-y-4">
                                        <div className="space-y-2">
                                            <label htmlFor="materi-judul" className="text-sm font-semibold text-slate-200">Judul materi</label>
                                            <input id="materi-judul" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Masukkan judul materi" className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-base text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="materi-urutan" className="text-sm font-semibold text-slate-200">Urutan</label>
                                            <input id="materi-urutan" value={order} onChange={(event) => setOrder(event.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Opsional" className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-base text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="materi-konten" className="text-sm font-semibold text-slate-200">Konten materi</label>
                                            <textarea id="materi-konten" value={content} onChange={(event) => setContent(event.target.value)} rows={12} placeholder="Tulis isi materi disini..." className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-base text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <button type="submit" disabled={isSaving} className="game-button game-button-blue inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" /> {isSaving ? 'Menyimpan...' : editingId ? 'Perbarui Materi' : 'Simpan Materi'}</button>
                                            <button type="button" onClick={resetForm} className="game-button game-button-yellow inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><X className="h-4 w-4" /> Batal</button>
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
