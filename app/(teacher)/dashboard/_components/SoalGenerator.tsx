'use client';

import { CheckCircle, ChevronDown, FileText, HelpCircle, RefreshCw, Sparkles } from 'lucide-react';
import { PdfUploadField } from './PdfUploadField';
import type { QuestionItem, QuestionType } from './types';
import type { ModulSummary } from '@/api/modul/route';

interface SoalGeneratorProps {
    modules: ModulSummary[];
    moduleId: number | null;
    file: File | null;
    questionType: QuestionType;
    isGenerating: boolean;
    questions: QuestionItem[];
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFileRemove: () => void;
    onQuestionTypeChange: (type: QuestionType) => void;
    onModuleChange: (moduleId: number) => void;
    onGenerate: (event: React.FormEvent) => void;
    onSave: () => void;
    onDownload: () => void;
}

export function SoalGenerator({ modules, moduleId, file, questionType, isGenerating, questions, onFileChange, onFileRemove, onQuestionTypeChange, onModuleChange, onGenerate, onSave, onDownload }: SoalGeneratorProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-slate-800/90 border border-slate-700 p-4 rounded-3xl shadow-xl h-fit sm:p-6">
                <div className="flex items-center gap-2 text-blue-400 mb-2"><FileText className="w-5 h-5" /><h2 className="text-xl font-bold text-white">Generator Soal PDF</h2></div>
                <p className="text-sm text-slate-400 mb-6">Unggah dokumen PDF sebagai sumber pembuatan soal dan kunci jawaban.</p>
                <form onSubmit={onGenerate} className="space-y-4">
                    <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Unggah Dokumen PDF</label><PdfUploadField file={file} maxSizeMb={5} onFileChange={onFileChange} onRemove={onFileRemove} /></div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Jenis Soal</label>
                        <div className="relative">
                            <select value={questionType} onChange={(event) => onQuestionTypeChange(event.target.value as QuestionType)} className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-4 pr-10 text-white outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="harian">Harian</option>
                                <option value="uts">UTS</option>
                                <option value="uas">UAS</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Modul Tujuan</label>
                        <div className="relative">
                            <select value={moduleId ?? ''} onChange={(event) => onModuleChange(Number(event.target.value))} disabled={modules.length === 0} className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-4 pr-10 text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
                                <option value="" disabled>{modules.length === 0 ? 'Belum ada modul' : 'Pilih Modul'}</option>
                                {modules.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                    <button type="submit" disabled={isGenerating || !file} className="game-button game-button-blue w-full py-3 px-4 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer mt-4">{isGenerating ? <><RefreshCw className="w-5 h-5 animate-spin" /> Membuat Soal dari PDF...</> : <><Sparkles className="w-5 h-5" /> Generate Soal dari PDF</>}</button>
                </form>
            </div>
            <div className="lg:col-span-8 bg-slate-800/90 border border-slate-700 p-4 rounded-3xl shadow-xl min-h-[400px] sm:p-6">
                <h3 className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3 text-lg font-bold text-white"><span>Daftar Soal & Kunci Jawaban</span>{questions.length > 0 && <div className="flex flex-wrap items-center gap-2"><span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">Total: {questions.length} Soal</span><button type="button" onClick={onSave} className="game-button game-button-yellow rounded-lg px-3 py-2 text-xs">Simpan Soal</button><button type="button" onClick={onDownload} className="game-button game-button-blue rounded-lg px-3 py-2 text-xs">Download PDF</button></div>}</h3>
                {questions.length > 0 ? <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">{questions.map((question) => <div key={question.id} className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/70 space-y-3"><p className="font-semibold text-white text-base">{question.id}. {question.question}</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">{question.options.map((option, index) => <div key={option} className="text-sm text-slate-300 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50"><span className="mr-2 font-bold text-blue-300">{String.fromCharCode(65 + index)}.</span>{option}</div>)}</div>{question.answer && <div className="mt-3 pt-3 border-t border-slate-800 bg-emerald-950/30 p-3 rounded-xl border-emerald-800/40"><p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> KUNCI JAWABAN: {question.answer}</p>{question.explanation && <p className="text-xs text-slate-400 mt-1 pl-5">{question.explanation}</p>}</div>}</div>)}</div> : <div className="h-[300px] flex flex-col items-center justify-center text-center text-slate-500"><HelpCircle className="w-12 h-12 mb-3 stroke-1" /><p>Unggah PDF dan buat soal untuk menampilkan hasilnya di sini.</p></div>}
            </div>
        </div>
    );
}