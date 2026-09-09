'use client';

import { Activity, BookOpen, FileText, Key } from 'lucide-react';
import type { DashboardTab } from './types';

interface DashboardTabsProps {
    activeTab: DashboardTab;
    onTabChange: (tab: DashboardTab) => void;
}

const tabs = [
    { id: 'materi', label: 'Generate Materi PDF', icon: BookOpen },
    { id: 'soal', label: 'Generate Soal PDF', icon: FileText },
    { id: 'kelas', label: 'Buat Kode Kelas', icon: Key },
    { id: 'progress', label: 'Progress Siswa', icon: Activity },
] as const;

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
    return (
        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-700 bg-slate-800 p-1.5 sm:flex sm:w-fit">
            {tabs.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => onTabChange(id)}
                    className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-center text-xs font-medium transition-all cursor-pointer sm:gap-2 sm:px-5 sm:text-sm ${activeTab === id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                >
                    <Icon className="w-4 h-4" />
                    {label}
                </button>
            ))}
        </div>
    );
}
