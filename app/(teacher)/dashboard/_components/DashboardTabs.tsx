'use client';

import { Activity, BookOpen, FileText, Key, Layers3, LogOut, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const tabs = [
    { id: 'materi', href: '/dashboard/generate-materi', label: 'Generate Materi PDF', icon: BookOpen },
    { id: 'soal', href: '/dashboard/generate-soal', label: 'Generate Soal PDF', icon: FileText },
    { id: 'buat-kelas', href: '/dashboard/buat-kelas', label: 'Buat Kelas', icon: Key },
    { id: 'buat-modul', href: '/dashboard/buat-modul', label: 'Generate Modul', icon: Layers3 },
    { id: 'kelola-kelas', href: '/dashboard/kelola-kelas', label: 'Kelola Kelas', icon: Settings2 },
    { id: 'progress', href: '/dashboard/progress-siswa', label: 'Progress Siswa', icon: Activity },
] as const;

type DashboardTab = (typeof tabs)[number]['id'];

interface DashboardTabsProps {
    activeTab: DashboardTab;
}

export function DashboardTabs({ activeTab }: DashboardTabsProps) {
    const router = useRouter();

    const handleLogout = () => {
        const expireCookie = (name: string) => {
            const attributes = `expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; path=/; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
            document.cookie = `${name}=; ${attributes}`;
            document.cookie = `${name}=; ${attributes.replace('path=/', `path=${window.location.pathname}`)}`;
        };

        expireCookie('auth_token');
        expireCookie('user_role');
        expireCookie('guru_profile');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('guru_profile');
        localStorage.removeItem('active_class_id');
        toast.success('Berhasil keluar dari akun guru.');
        router.replace('/login');
        router.refresh();
    };

    return (
        <nav aria-label="Navigasi dashboard guru" className="flex min-w-0 gap-1 overflow-x-auto rounded-2xl border border-slate-700 bg-slate-800 p-1.5 lg:sticky lg:top-20 lg:h-[calc(100dvh-5rem)] lg:w-72 lg:shrink-0 lg:flex-col lg:gap-2 lg:overflow-visible lg:rounded-none lg:border-b-0 lg:border-l-0 lg:border-t-0 lg:p-4">
            <div className="contents lg:flex lg:flex-col lg:gap-2">
                {tabs.map(({ id, href, label, icon: Icon }) => (
                    <Link
                        key={id}
                        href={href}
                        aria-current={activeTab === id ? 'page' : undefined}
                        className={`flex min-h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-center text-xs font-medium transition-all cursor-pointer sm:gap-2 sm:px-5 sm:text-sm lg:min-h-12 lg:shrink lg:justify-start lg:px-4 lg:text-left ${activeTab === id
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </Link>
                ))}
            </div>
            <button type="button" onClick={handleLogout} className="flex min-h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-medium text-red-300 transition hover:bg-red-500/15 hover:text-red-200 sm:gap-2 sm:px-5 sm:text-sm lg:mt-auto lg:min-h-12 lg:shrink lg:justify-start lg:px-4">
                <LogOut className="h-4 w-4" />
                Logout
            </button>
        </nav>
    );
}
