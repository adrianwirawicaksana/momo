'use client';

import { usePathname } from 'next/navigation';
import { DashboardTabs } from './_components/DashboardTabs';
import { DashboardContent } from './_components/DashboardContent';
import { GlobalLoading } from '@/components/shared/GlobalLoading';
import { useDashboardController } from './_hooks/useDashboardController';
import type { DashboardTab } from './_components/types';

export default function DashboardGuruPage() {
    const pathname = usePathname();
    const activeTab: DashboardTab = pathname.endsWith('/generate-soal')
        ? 'soal'
        : pathname.endsWith('/buat-kelas')
            ? 'buat-kelas'
            : pathname.endsWith('/buat-modul')
                ? 'buat-modul'
                : pathname.endsWith('/kelola-kelas')
                    ? 'kelola-kelas'
                    : pathname.endsWith('/progress-siswa')
                        ? 'progress'
                        : 'materi';
    const dashboard = useDashboardController(activeTab);

    return (
        <div className="min-h-[calc(100dvh-5rem)] bg-slate-900 text-slate-100 flex flex-col font-(family-name:--font-poppins)">
            <div className="flex w-full flex-1 flex-col gap-5 p-3 sm:gap-6 sm:p-6 lg:flex-row lg:items-start lg:gap-0 lg:p-0">
                <DashboardTabs activeTab={activeTab} />
                <main className="min-w-0 flex-1 lg:p-8">
                    {(dashboard.isLoadingClasses || dashboard.isLoadingClass || dashboard.isProcessingClass || dashboard.isCreatingClass || dashboard.isGeneratingMateri || dashboard.isSavingMateri || dashboard.isGeneratingSoal) && <GlobalLoading label="MoMo sedang memproses..." />}
                    <DashboardContent activeTab={activeTab} {...dashboard.contentProps} />
                </main>
            </div>
        </div>
    );
}