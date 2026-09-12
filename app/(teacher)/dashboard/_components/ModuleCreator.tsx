'use client';

import { BookOpen, ChevronDown, LoaderCircle, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import type { ClassSummary } from '@/api/kelas/route';
import type { ModulSummary } from '@/api/modul/route';

interface ModuleCreatorProps {
    classes: ClassSummary[];
    modules: ModulSummary[];
    name: string;
    description: string;
    classId: number | null;
    isCreating: boolean;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onClassChange: (classId: number) => void;
    onCreate: (event: React.FormEvent) => void;
    onUpdate: (id: number, payload: { nama?: string; deskripsi?: string }) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}

export function ModuleCreator({
    classes,
    modules,
    name,
    description,
    classId,
    isCreating,
    onNameChange,
    onDescriptionChange,
    onClassChange,
    onCreate,
    onUpdate,
    onDelete,
}: ModuleCreatorProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [editingDescription, setEditingDescription] = useState('');
    const [busyId, setBusyId] = useState<number | null>(null);

    const startEditing = (module: ModulSummary) => {
        setEditingId(module.id);
        setEditingName(module.nama);
        setEditingDescription(module.deskripsi ?? '');
    };

    const saveEditing = async () => {
        if (!editingId || !editingName.trim() || busyId) return;
        setBusyId(editingId);
        try {
            await onUpdate(editingId, { nama: editingName.trim(), deskripsi: editingDescription.trim() });
            setEditingId(null);
        } finally {
            setBusyId(null);
        }
    };

    const removeModule = async (module: ModulSummary) => {
        if (busyId || !window.confirm(`Hapus modul "${module.nama}" beserta materi dan soalnya?`)) return;
        setBusyId(module.id);
        try {
            await onDelete(module.id);
        } finally {
            setBusyId(null);
        }
    };

    return (
        <section className="mt-6 rounded-3xl border border-slate-700 bg-slate-800/90 p-5 shadow-xl sm:p-6">
            <div className="mb-5 flex items-center gap-2 text-blue-400">
                <BookOpen className="h-5 w-5" />
                <div>
                    <h2 className="text-xl font-bold text-white">Buat Modul Pembelajaran</h2>
                    <p className="mt-1 text-sm text-slate-400">Buat modul dan langsung tautkan ke salah satu kelas.</p>
                </div>
            </div>
            <form onSubmit={onCreate} className="grid gap-4 lg:grid-cols-3 lg:items-end">
                <label className="block text-sm font-medium text-slate-300">
                    Kelas Tujuan
                    <div className="relative mt-1.5">
                        <select value={classId ?? ''} onChange={(event) => onClassChange(Number(event.target.value))} disabled={classes.length === 0 || isCreating} className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 pr-10 text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
                            <option value="" disabled>{classes.length === 0 ? 'Belum ada kelas' : 'Pilih kelas'}</option>
                            {classes.map((item) => <option key={item.id} value={item.id}>{item.nama_kelas} ({item.mata_pelajaran || 'Tanpa mata pelajaran'})</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    </div>
                </label>
                <label className="block text-sm font-medium text-slate-300">
                    Nama Modul
                    <input value={name} onChange={(event) => onNameChange(event.target.value)} disabled={isCreating} placeholder="Contoh: Pecahan Dasar" className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-blue-500 disabled:opacity-60" />
                </label>
                <button type="submit" disabled={isCreating || classes.length === 0 || !classId || !name.trim()} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
                    {isCreating ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                    {isCreating ? 'Membuat Modul...' : 'Buat & Tautkan Modul'}
                </button>
                <label className="block text-sm font-medium text-slate-300 lg:col-span-3">
                    Deskripsi Modul <span className="font-normal text-slate-500">(opsional)</span>
                    <textarea value={description} onChange={(event) => onDescriptionChange(event.target.value)} disabled={isCreating} rows={2} placeholder="Ringkasan isi modul untuk guru..." className="mt-1.5 w-full resize-y rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-blue-500 disabled:opacity-60" />
                </label>
            </form>
            <div className="mt-8 border-t border-slate-700 pt-6">
                <h3 className="mb-3 text-lg font-bold text-white">Kelola Modul</h3>
                {modules.length === 0 ? <p className="text-sm text-slate-500">Belum ada modul.</p> : <div className="space-y-3">{modules.map((module) => editingId === module.id ? <div key={module.id} className="space-y-3 rounded-2xl border border-blue-500/50 bg-slate-900/70 p-4"><input value={editingName} onChange={(event) => setEditingName(event.target.value)} aria-label="Nama modul" className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" /><textarea value={editingDescription} onChange={(event) => setEditingDescription(event.target.value)} aria-label="Deskripsi modul" rows={2} className="w-full resize-y rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-blue-500" /><div className="flex gap-2"><button type="button" onClick={saveEditing} disabled={busyId === module.id || !editingName.trim()} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" /> Simpan</button><button type="button" onClick={() => setEditingId(null)} disabled={Boolean(busyId)} className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><X className="h-4 w-4" /> Batal</button></div></div> : <div key={module.id} className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate font-semibold text-white">{module.nama}</p><p className="mt-1 truncate text-sm text-slate-400">{module.deskripsi || 'Tanpa deskripsi'}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => startEditing(module)} disabled={Boolean(busyId)} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Pencil className="h-4 w-4" /> Edit</button><button type="button" onClick={() => void removeModule(module)} disabled={Boolean(busyId)} className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Trash2 className="h-4 w-4" /> Hapus</button></div></div>)}</div>}
            </div>
        </section>
    );
}
