'use client';

import { Award, Copy, Plus, RefreshCw } from 'lucide-react';

interface ClassCreatorProps {
    classCode: string;
    className: string;
    subject: string;
    onClassNameChange: (value: string) => void;
    onSubjectChange: (value: string) => void;
    onGenerateCode: () => void;
    onCopyCode: () => void;
    onCreateClass: (event: React.FormEvent) => void;
}

export function ClassCreator({ classCode, className, subject, onClassNameChange, onSubjectChange, onGenerateCode, onCopyCode, onCreateClass }: ClassCreatorProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700 p-4 rounded-3xl shadow-xl sm:p-6">
                <div className="flex items-center gap-2 text-blue-400 mb-2"><Award className="w-5 h-5" /><h2 className="text-xl font-bold text-white">Buat Kelas Baru</h2></div>
                <p className="text-sm text-slate-400 mb-6">Atur nama kelas dan dapatkan kode Unik untuk dibagikan ke siswa.</p>
                <form onSubmit={onCreateClass} className="space-y-4">
                    <label className="block text-sm font-medium text-slate-300">Nama Kelas<input type="text" value={className} onChange={(event) => onClassNameChange(event.target.value)} placeholder="Contoh: Kelas 4B - IPA Interaktif" className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" /></label>
                    <label className="block text-sm font-medium text-slate-300">Mata Pelajaran<input type="text" value={subject} onChange={(event) => onSubjectChange(event.target.value)} placeholder="Contoh: Ilmu Pengetahuan Alam (IPA)" className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" /></label>
                    <div className="pt-2"><label className="block text-sm font-medium text-slate-300 mb-1.5">Kode Unik Kelas</label><div className="flex items-center gap-2"><div className="min-w-0 flex-1 overflow-x-auto bg-slate-900 border border-slate-700 px-3 py-2.5 rounded-xl font-mono text-lg font-bold text-blue-400 tracking-wider text-center sm:px-4 sm:text-xl">{classCode}</div><button type="button" onClick={onGenerateCode} className="shrink-0 p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all cursor-pointer" title="Acak Kode Baru"><RefreshCw className="w-5 h-5" /></button><button type="button" onClick={onCopyCode} className="shrink-0 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all cursor-pointer" title="Salin Kode"><Copy className="w-5 h-5" /></button></div></div>
                    <button type="submit" className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 cursor-pointer mt-6"><Plus className="w-5 h-5" /> Simpan & Buat Kelas</button>
                </form>
            </div>
            <div className="lg:col-span-6 bg-gradient-to-br from-blue-900/40 to-slate-800 border border-blue-500/30 p-5 rounded-3xl shadow-xl flex flex-col justify-between sm:p-8"><div><span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/30">Petunjuk Siswa</span><h3 className="text-2xl font-bold text-white mt-4 mb-3">Bagikan Kode Kelas Kepada Siswa</h3><p className="text-slate-300 leading-relaxed text-sm">Siswa dapat bergabung ke dalam kelas Anda dengan memasukkan <span className="text-blue-400 font-semibold">Kode Unik</span> saat membuka aplikasi MoMo. Setelah terhubung, siswa dapat mengakses materi dan latihan soal yang disiapkan secara otomatis.</p></div><div className="mt-8 flex flex-col gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><p className="text-xs text-slate-400 uppercase tracking-wider">Kode Aktif Saat Ini</p><p className="text-2xl font-mono font-bold text-blue-400">{classCode}</p></div><button onClick={onCopyCode} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer sm:w-auto"><Copy className="w-4 h-4" /> Salin Kode</button></div></div>
        </div>
    );
}
