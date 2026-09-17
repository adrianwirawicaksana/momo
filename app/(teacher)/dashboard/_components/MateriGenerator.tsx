'use client';

import { BookOpen, ChevronDown, Download, RefreshCw, Save, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ModulMaterial, ModulSummary } from '@/api/modul/route';
import { PdfUploadField } from './PdfUploadField';

interface MateriGeneratorProps {
    modules: ModulSummary[];
    moduleId: number | null;
    moduleName: string;
    file: File | null;
    isGenerating: boolean;
    generatedMateri: ModulMaterial[];
    isSaving: boolean;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFileRemove: () => void;
    onModuleChange: (moduleId: number) => void;
    onGenerate: (event: React.FormEvent) => void;
    onSave: () => void;
}

export function MateriGenerator({
    modules,
    moduleId,
    moduleName,
    file,
    isGenerating,
    generatedMateri,
    isSaving,
    onFileChange,
    onFileRemove,
    onModuleChange,
    onGenerate,
    onSave,
}: MateriGeneratorProps) {
    const handleDownload = () => {
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            toast.error('Popup diblokir browser. Izinkan popup untuk mengunduh PDF.');
            return;
        }

        const content = generatedMateri.map((item) => `<h2>${item.judul.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h2><div>${item.konten.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`).join('');
        printWindow.document.write(`<!doctype html><html><head><title>Materi - ${moduleName || 'Modul'}</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#172033;padding:40px;white-space:pre-wrap}h1{font-size:24px;border-bottom:1px solid #cbd5e1;padding-bottom:12px}h2{font-size:20px;margin-top:24px}@media print{body{padding:0}}</style></head><body><h1>Materi - ${moduleName || 'Modul'}</h1>${content}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700 p-6 rounded-3xl shadow-xl h-fit">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <h2 className="text-xl font-bold text-white">AI Materi dari PDF</h2>
                </div>
                <p className="text-sm text-slate-400 mb-6">Unggah berkas PDF untuk merangkum dan membuat draf materi pembelajaran interaktif.</p>

                <form onSubmit={onGenerate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Modul Tujuan</label>
                        <div className="relative">
                            <select value={moduleId ?? ''} onChange={(event) => onModuleChange(Number(event.target.value))} disabled={modules.length === 0} className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60">
                                <option value="" disabled>{modules.length === 0 ? 'Belum ada modul' : 'Pilih Modul'}</option>
                                {modules.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}
                            </select>
                            <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Unggah Dokumen PDF</label>
                        <PdfUploadField file={file} maxSizeMb={25} onFileChange={onFileChange} onRemove={onFileRemove} />
                    </div>
                    <button type="submit" disabled={isGenerating || !file} className="game-button game-button-blue w-full py-3 px-4 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer mt-4">
                        {isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin" /> Mengekstrak PDF & Generasi...</> : <><Sparkles className="w-5 h-5" /> Generate Materi dari PDF</>}
                    </button>
                </form>
            </div>

            <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700 p-6 rounded-3xl shadow-xl min-h-100 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-3 flex items-center justify-between">
                    <span>Hasil Rangkuman Materi</span>
                    {generatedMateri.length > 0 && <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
                        <button type="button" onClick={handleDownload} className="game-button game-button-blue flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm sm:min-h-11 sm:gap-2 sm:rounded-xl sm:px-3.5 sm:py-2.5"><Download className="h-4 w-4 sm:h-5 sm:w-5" /> Download PDF</button>
                        <button type="button" onClick={onSave} disabled={isSaving} className="game-button game-button-yellow flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-11 sm:gap-2 sm:rounded-xl sm:px-3.5 sm:py-2.5"><Save className="h-4 w-4 sm:h-5 sm:w-5" /> {isSaving ? 'Menyimpan...' : 'Simpan ke Kelas'}</button>
                    </div>}
                </h3>
                {generatedMateri.length > 0 ? <div className="flex-1 space-y-5 overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5"><p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">{generatedMateri.length} bagian materi</p>{generatedMateri.map((item) => <section key={item.id} className="space-y-2"><h4 className="text-lg font-bold text-white">{item.judul}</h4><div className="whitespace-pre-wrap font-sans leading-relaxed text-slate-300">{item.konten}</div></section>)}</div> : <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-8"><BookOpen className="w-12 h-12 mb-3 stroke-1" /><p>Unggah PDF dan tekan button generate untuk menampilkan hasil materi.</p></div>}
            </div>
        </div>
    );
}
