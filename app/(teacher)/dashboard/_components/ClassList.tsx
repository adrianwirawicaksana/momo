'use client';

import { useState } from 'react';
import { AlertTriangle, Check, ChevronDown, Copy, Edit3, Filter, LoaderCircle, Search, Trash2, Volume2, X } from 'lucide-react';
import Link from 'next/link';
import type { ClassDetail, ClassSummary, UpdateClassPayload } from '@/api/kelas/route';

interface ClassListProps {
    classes: ClassSummary[];
    selectedClassId: number | null;
    classDetails: Record<number, ClassDetail>;
    isLoading: boolean;
    onSelect: (id: number) => void;
    onUpdate: (id: number, payload: UpdateClassPayload) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onUpdateModule: (id: number, payload: { nama?: string; deskripsi?: string }) => Promise<void>;
    onDeleteModule: (id: number) => Promise<void>;
    onCopy: (code: string) => void;
}

export function ClassList({ classes, selectedClassId, classDetails, isLoading, onSelect, onUpdate, onDelete, onCopy }: ClassListProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [editingSubject, setEditingSubject] = useState('');
    const [busyId, setBusyId] = useState<number | null>(null);
    const [pendingDelete, setPendingDelete] = useState<ClassSummary | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const pageSize = 4;
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const subjects = Array.from(new Set(classes.map((item) => item.mata_pelajaran?.trim()).filter(Boolean))).sort();
    const filteredClasses = classes.filter((item) => {
        const searchableText = `${item.nama_kelas} ${item.kode_kelas} ${item.mata_pelajaran ?? ''}`.toLowerCase();
        const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
        const matchesSubject = subjectFilter === 'all' || item.mata_pelajaran?.trim() === subjectFilter;
        return matchesSearch && matchesSubject;
    });
    const totalPages = Math.max(1, Math.ceil(filteredClasses.length / pageSize));
    const activePage = Math.min(currentPage, totalPages);
    const visibleClasses = filteredClasses.slice((activePage - 1) * pageSize, activePage * pageSize);

    const updateSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const updateSubjectFilter = (value: string) => {
        setSubjectFilter(value);
        setCurrentPage(1);
    };

    const startEditing = (item: ClassSummary) => {
        setEditingId(item.id);
        setEditingName(item.nama_kelas);
        setEditingSubject(item.mata_pelajaran ?? '');
    };

    const saveEditing = async () => {
        if (!editingId || !editingName.trim() || busyId) return;
        setBusyId(editingId);
        try {
            await onUpdate(editingId, {
                nama: editingName.trim(),
                mata_pelajaran: editingSubject.trim(),
            });
            setEditingId(null);
        } finally {
            setBusyId(null);
        }
    };

    const removeClass = (classOrId: ClassSummary | number) => {
        const item = typeof classOrId === 'number' ? classes.find((classItem) => classItem.id === classOrId) : classOrId;
        if (!item) return;
        setPendingDelete(item);
    };

    const confirmRemoveClass = async () => {
        if (!pendingDelete || busyId) return;
        setBusyId(pendingDelete.id);
        try {
            await onDelete(pendingDelete.id);
            setPendingDelete(null);
        } finally {
            setBusyId(null);
        }
    };

    const speakCode = (code: string) => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`Kode kelas adalah ${code.split('').join(' ')}`);
        utterance.lang = 'id-ID';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    };

    return (
        <section className="mt-6 rounded-3xl border border-slate-700 bg-slate-800/90 p-5 shadow-xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-white">Daftar Kelas</h2>
                    <p className="mt-1 text-sm text-slate-400">Pilih, ubah, atau hapus kelas yang sudah dibuat.</p>
                </div>
                <span className="rounded-full bg-blue-500/15 px-3 py-1 text-sm font-bold text-blue-300">{classes.length} kelas</span>
            </div>
            {classes.length > 0 && <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(12rem,0.4fr)]">
                <label className="relative block">
                    <span className="sr-only">Cari kelas</span>
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                    <input value={searchTerm} onChange={(event) => updateSearch(event.target.value)} placeholder="Cari nama, kode, atau mata pelajaran..." className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500" />
                </label>
                <label className="relative block">
                    <span className="sr-only">Filter mata pelajaran</span>
                    <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                    <select value={subjectFilter} onChange={(event) => updateSubjectFilter(event.target.value)} className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-10 text-sm text-white outline-none transition focus:border-blue-500">
                        <option value="all">Semua mata pelajaran</option>
                        {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                </label>
            </div>}
            {isLoading ? <div className="flex items-center justify-center gap-2 py-10 text-slate-400"><LoaderCircle className="h-5 w-5 animate-spin" /> Memuat kelas...</div> : classes.length === 0 ? <p className="py-10 text-center text-slate-500">Belum ada kelas. Buat kelas pertama di atas.</p> : filteredClasses.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-700 py-10 text-center text-slate-500">Kelas yang sesuai tidak ditemukan.</p> : <div className="grid gap-3 lg:grid-cols-2">{visibleClasses.map((item) => {
                const isEditing = editingId === item.id;
                const isBusy = busyId === item.id;
                return <article key={item.id} className={`rounded-2xl border p-4 transition ${selectedClassId === item.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-900/60'}`}>
                    {isEditing ? <div className="space-y-3"><input value={editingName} onChange={(event) => setEditingName(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" aria-label="Nama kelas" /><input value={editingSubject} onChange={(event) => setEditingSubject(event.target.value)} placeholder="Mata pelajaran" className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" aria-label="Mata pelajaran" /><div className="flex gap-2"><button type="button" onClick={saveEditing} disabled={isBusy || !editingName.trim()} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Check className="h-4 w-4" /> Simpan</button><button type="button" onClick={() => setEditingId(null)} className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white"><X className="h-4 w-4" /> Batal</button></div></div> : <><div className="flex items-start justify-between gap-3"><button type="button" onClick={() => onSelect(item.id)} className="min-w-0 text-left"><h3 className="truncate text-lg font-bold text-white">{item.nama_kelas}</h3><p className="mt-1 text-sm text-slate-400">{item.mata_pelajaran || 'Mata pelajaran belum tersedia'}</p></button><span className="shrink-0 font-mono text-lg font-black tracking-wider text-blue-300">{item.kode_kelas}</span></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => onCopy(item.kode_kelas)} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"><Copy className="h-4 w-4" /> Salin</button><button type="button" onClick={() => speakCode(item.kode_kelas)} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"><Volume2 className="h-4 w-4" /> Suara</button><button type="button" onClick={() => startEditing(item)} className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-600"><Edit3 className="h-4 w-4" /> Edit</button><button type="button" onClick={() => void removeClass(item.id)} disabled={isBusy} className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50"><Trash2 className="h-4 w-4" /> Hapus</button></div></>}
                    <div className="mt-4 border-t border-slate-700 pt-4">
                        <h4 className="text-sm font-bold text-slate-200">Modul dan materi tersimpan</h4>
                        {isLoading && !classDetails[item.id] ? <div className="mt-3 flex items-center gap-2 text-sm text-slate-400"><LoaderCircle className="h-4 w-4 animate-spin" /> Memuat materi...</div> : classDetails[item.id]?.modul.length ? <div className="mt-3 space-y-2">{classDetails[item.id].modul.map((module) => {
                            const material = module.materi;
                            const hasQuestions = Boolean(module.soal?.length);
                            return <div key={module.id} className="rounded-xl border border-slate-700 bg-slate-950/40 p-3">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate font-semibold text-blue-200">{module.nama || module.judul || `Modul ${module.id}`}</p>
                                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{material && hasQuestions ? 'Materi dan soal tersedia' : material ? 'Materi tersedia' : hasQuestions ? 'Soal tersedia' : 'Materi atau soal belum tersedia.'}</span>
                                    </div>
                                </div>
                                {(Boolean(material) || hasQuestions) && <div className="mt-3 flex justify-end">
                                    <Link href={hasQuestions && !material ? `/dashboard/kelola-kelas/soal/${module.id}` : `/dashboard/kelola-kelas/materi/${module.id}`} className="game-button game-button-blue w-full rounded-lg px-3 py-2 text-center text-xs font-semibold sm:w-auto">{hasQuestions && !material ? 'Kelola Soal' : material && hasQuestions ? 'Kelola Materi & Soal' : 'Kelola Materi'}</Link>
                                </div>}
                            </div>;
                        })}</div> : <p className="mt-3 text-sm text-slate-500">Belum ada modul yang terikat ke kelas ini.</p>}
                    </div>
                </article>;
            })}</div>}
            {!isLoading && filteredClasses.length > 0 && <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-slate-700 pt-4 text-sm sm:flex-row">
                <p className="text-slate-500">Menampilkan {((activePage - 1) * pageSize) + 1}-{Math.min(activePage * pageSize, filteredClasses.length)} dari {filteredClasses.length} kelas</p>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={activePage === 1} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-semibold text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Sebelumnya</button>
                    <span className="min-w-20 text-center font-semibold text-slate-300">{activePage} / {totalPages}</span>
                    <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={activePage === totalPages} className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-semibold text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Berikutnya</button>
                </div>
            </div>}

            {pendingDelete && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busyId) setPendingDelete(null); }}>
                <div role="dialog" aria-modal="true" aria-labelledby="delete-class-title" className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-5 text-center shadow-2xl shadow-black/40 sm:p-6">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
                        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <h2 id="delete-class-title" className="mt-4 text-lg font-bold text-white">Hapus kelas ini?</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">Kelas <span className="font-semibold text-slate-200">{pendingDelete.nama_kelas}</span> dan akses siswa di dalamnya akan terhapus.</p>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setPendingDelete(null)} disabled={Boolean(busyId)} className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 disabled:opacity-50">Batal</button>
                        <button type="button" onClick={confirmRemoveClass} disabled={Boolean(busyId)} className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60">
                            {busyId ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Hapus
                        </button>
                    </div>
                </div>
            </div>}
        </section>
    );
}