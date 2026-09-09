'use client';

import { BookOpen, ChevronDown, Copy, RefreshCw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { PdfUploadField } from './PdfUploadField';

const educationLevels = [
    'TK Kecil',
    'TK Besar',
    'SD Kelas 1',
    'SD Kelas 2',
    'SD Kelas 3',
    'SD Kelas 4',
    'SD Kelas 5',
    'SD Kelas 6',
    'SMP Kelas 1',
    'SMP Kelas 2',
    'SMP Kelas 3',
    'SMA Kelas 1',
    'SMA Kelas 2',
    'SMA Kelas 3',
    'SMK Kelas 1',
    'SMK Kelas 2',
    'SMK Kelas 3',
];

interface MateriGeneratorProps {
    file: File | null;
    grade: string;
    isGenerating: boolean;
    generatedMateri: string;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFileRemove: () => void;
    onGradeChange: (grade: string) => void;
    onGenerate: (event: React.FormEvent) => void;
}

export function MateriGenerator({
    file,
    grade,
    isGenerating,
    generatedMateri,
    onFileChange,
    onFileRemove,
    onGradeChange,
    onGenerate,
}: MateriGeneratorProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(generatedMateri);
        toast.success('Materi disalin!');
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
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Unggah Dokumen PDF</label>
                        <PdfUploadField file={file} onFileChange={onFileChange} onRemove={onFileRemove} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Tingkat Kelas</label>
                        <div className="relative">
                            <select value={grade} onChange={(event) => onGradeChange(event.target.value)} className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                                <option value="Pilih Kelas" disabled>Pilih Kelas</option>
                                {educationLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                            </select>
                            <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                    <button type="submit" disabled={isGenerating || !file} className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer mt-4">
                        {isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin" /> Mengekstrak PDF & Generasi...</> : <><Sparkles className="w-5 h-5" /> Generate Materi dari PDF</>}
                    </button>
                </form>
            </div>

            <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700 p-6 rounded-3xl shadow-xl min-h-[400px] flex flex-col">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-3 flex items-center justify-between">
                    <span>Hasil Rangkuman Materi</span>
                    {generatedMateri && <button onClick={handleCopy} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-slate-200 flex items-center gap-1 transition-all"><Copy className="w-3.5 h-3.5" /> Salin Text</button>}
                </h3>
                {generatedMateri ? <div className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed bg-slate-900/60 p-5 rounded-2xl border border-slate-700/50 flex-1 overflow-y-auto max-h-[500px]">{generatedMateri}</div> : <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 p-8"><BookOpen className="w-12 h-12 mb-3 stroke-1" /><p>Unggah PDF dan tekan button generate untuk menampilkan hasil materi.</p></div>}
            </div>
        </div>
    );
}
