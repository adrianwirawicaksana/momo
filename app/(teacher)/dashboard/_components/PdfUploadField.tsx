'use client';

import { FileCheck, UploadCloud, X } from 'lucide-react';

interface PdfUploadFieldProps {
    file: File | null;
    maxSizeMb?: number;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
}

export function PdfUploadField({ file, maxSizeMb = 10, onFileChange, onRemove }: PdfUploadFieldProps) {
    if (!file) {
        return (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-2xl cursor-pointer bg-slate-900/60 hover:bg-slate-900/90 transition-all p-4 group">
                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-400 mb-2 transition-colors" />
                <p className="text-xs text-slate-300 text-center font-medium">
                    Klik untuk mengunggah atau <span className="text-blue-400">drag & drop</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Berkas PDF (Maks. {maxSizeMb} MB)</p>
                <input id="pdf-file" name="file" type="file" accept="application/pdf" required onChange={onFileChange} className="hidden" />
            </label>
        );
    }

    return (
        <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-blue-500/50 rounded-2xl">
            <div className="flex items-center gap-3 overflow-hidden">
                <FileCheck className="w-6 h-6 text-blue-400 shrink-0" />
                <div className="truncate">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
            </div>
            <button
                type="button"
                onClick={onRemove}
                className="plain-button p-1 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all"
                title="Hapus berkas"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}
