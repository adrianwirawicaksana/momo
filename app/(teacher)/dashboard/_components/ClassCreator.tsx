'use client';

import { Award, Copy, LoaderCircle, Plus, Volume2 } from 'lucide-react';

interface ClassCreatorProps {
    classCode: string;
    className: string;
    subject: string;
    generatedClassName: string;
    generatedSubject: string;
    isCreatingClass: boolean;
    onClassNameChange: (value: string) => void;
    onSubjectChange: (value: string) => void;
    onCopyCode: () => void;
    onCreateClass: (event: React.FormEvent) => void;
}

export function ClassCreator({ classCode, className, subject, generatedClassName, generatedSubject, isCreatingClass, onClassNameChange, onSubjectChange, onCopyCode, onCreateClass }: ClassCreatorProps) {
    const speakGeneratedCode = () => {
        if (!classCode || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`Kode unik kelas adalah ${classCode.split('').join(' ')}`);
        utterance.lang = 'id-ID';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700 p-4 rounded-3xl shadow-xl sm:p-6">
                <div className="flex items-center gap-2 text-blue-400 mb-2"><Award className="w-5 h-5" /><h2 className="text-xl font-bold text-white">Buat Kelas Baru</h2></div>
                <p className="text-sm text-slate-400 mb-6">Atur nama kelas dan dapatkan kode Unik untuk dibagikan ke siswa.</p>
                <form onSubmit={onCreateClass} className="space-y-4">
                    <label className="block text-sm font-medium text-slate-300">Nama Kelas<input type="text" value={className} onChange={(event) => onClassNameChange(event.target.value)} placeholder="Contoh: Kelas 4B - IPA Interaktif" className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" /></label>
                    <label className="block text-sm font-medium text-slate-300">Mata Pelajaran<input type="text" value={subject} onChange={(event) => onSubjectChange(event.target.value)} placeholder="Contoh: Ilmu Pengetahuan Alam (IPA)" className="mt-1.5 w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" /></label>
                    <div className="pt-2"><label className="block text-sm font-medium text-slate-300 mb-1.5">Kode Unik Kelas</label><div aria-live="polite" className={`flex min-h-[76px] min-w-0 items-center justify-center overflow-x-auto rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-center font-mono text-4xl font-black tracking-[0.2em] ${classCode ? 'text-blue-400' : 'text-slate-500'}`}>{classCode || 'Belum ada kode'}</div></div>
                    <button type="submit" disabled={isCreatingClass || !className.trim() || !subject.trim()} aria-busy={isCreatingClass} className="game-button game-button-blue w-full py-3 px-4 rounded-xl flex justify-center items-center gap-2 cursor-pointer mt-6 disabled:cursor-not-allowed disabled:opacity-60">{isCreatingClass ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />} {isCreatingClass ? 'Membuat Kelas...' : 'Simpan & Buat Kelas'}</button>
                </form>
            </div>
            <div className="lg:col-span-6 bg-gradient-to-br from-blue-900/40 to-slate-800 border border-blue-500/30 p-5 rounded-3xl shadow-xl flex flex-col justify-between sm:p-8"><div><span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/30">Petunjuk Siswa</span><h3 className="text-2xl font-bold text-white mt-4 mb-3">Bagikan Kode Kelas Kepada Siswa</h3><p className="text-slate-300 leading-relaxed text-sm">Siswa dapat bergabung ke dalam kelas Anda dengan memasukkan <span className="text-blue-400 font-semibold">Kode Unik</span> saat membuka aplikasi MoMo. Setelah terhubung, siswa dapat mengakses materi dan latihan soal yang disiapkan secara otomatis.</p></div><div className="mt-8 rounded-2xl border border-slate-700/80 bg-slate-900/80 p-4 sm:p-5"><p className="text-xs uppercase tracking-wider text-slate-400">Status Kode Kelas</p><p className="mt-2 text-lg font-semibold text-blue-300">{classCode ? 'Kode kelas berhasil dibuat' : 'Kode kelas belum dibuat'}</p>{classCode ? <><div className="mt-3 space-y-1 text-sm text-slate-300"><p>Nama kelas: <span className="font-semibold text-white">{generatedClassName || 'Kelas baru'}</span></p><p>Mata pelajaran: <span className="font-semibold text-white">{generatedSubject || 'Belum tersedia'}</span></p></div><p className="mt-4 break-all text-center font-mono text-4xl font-black tracking-[0.2em] text-white sm:text-5xl">{classCode}</p><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={onCopyCode} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500"><Copy className="h-5 w-5" /> Salin Kode</button><button type="button" onClick={speakGeneratedCode} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500" aria-label="Bacakan kode kelas"><Volume2 className="h-5 w-5" /> Bacakan Kode</button></div></> : <p className="mt-4 text-sm text-slate-500">Buat kelas untuk menampilkan detail dan kode unik.</p>}</div></div>
        </div>
    );
}
