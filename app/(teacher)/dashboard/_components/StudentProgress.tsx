import { Award, BookOpenCheck, CheckCircle2, ChevronDown, Clock3, TrendingUp } from 'lucide-react';
import type { ClassSummary } from '@/api/kelas/route';

export interface StudentProgressItem {
    name: string;
    initials: string;
    progress: number;
    score: number;
    completed: string;
    lastActivity: string;
    status: 'Sangat Baik' | 'Berkembang' | 'Perlu Pendampingan';
}

export interface StudentProgressData {
    className?: string;
    period?: string;
    target?: number;
    students: StudentProgressItem[];
    totalStudents?: number;
    averageScore?: number;
    completionRate?: number;
    studentsNeedingAttention?: number;
}

const statusStyles = {
    'Sangat Baik': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    Berkembang: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    'Perlu Pendampingan': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
};

interface StudentProgressProps {
    data: StudentProgressData | null;
    classes: ClassSummary[];
    selectedClassId: number | null;
    isLoadingClass: boolean;
    onClassChange: (classId: number) => void;
}

export function StudentProgress({ data, classes, selectedClassId, isLoadingClass, onClassChange }: StudentProgressProps) {
    const students = data?.students ?? [];
    const hasData = Boolean(data);

    return (
        <section className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">Ringkasan {data?.className ?? 'Kelas'}</p>
                    <h2 className="mt-1 text-2xl font-bold text-white">Progress Hasil Pembelajaran</h2>
                    <p className="mt-1 text-sm text-slate-400">Pantau perkembangan anak dan temukan materi yang masih perlu diperkuat.</p>
                </div>
                <div className="flex flex-col gap-2 self-start sm:items-end sm:self-auto">
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="progress-class-select">Kelas aktif</label>
                    <div className="relative">
                        <select id="progress-class-select" value={selectedClassId ?? ''} onChange={(event) => onClassChange(Number(event.target.value))} disabled={isLoadingClass || classes.length === 0} className="min-w-56 appearance-none rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 pr-10 text-sm text-slate-200 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
                            {classes.length === 0 ? <option value="">Belum ada kelas</option> : classes.map((item) => <option key={item.id} value={item.id}>{item.nama_kelas} ({item.kode_kelas})</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400"><BookOpenCheck className="h-4 w-4 text-blue-400" /> Periode: {data?.period ?? 'Belum tersedia'}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard label="Total Siswa" value={data?.totalStudents?.toString() ?? '-'} detail={hasData ? 'siswa aktif' : 'Data belum tersedia'} icon={BookOpenCheck} iconColor="text-blue-400" />
                <SummaryCard label="Rata-rata Nilai" value={data?.averageScore?.toString() ?? '-'} detail={hasData ? 'hasil evaluasi kelas' : 'Data belum tersedia'} icon={TrendingUp} iconColor="text-emerald-400" />
                <SummaryCard label="Materi Selesai" value={data?.completionRate !== undefined ? `${data.completionRate}%` : '-'} detail={hasData ? 'dari seluruh kelas' : 'Data belum tersedia'} icon={CheckCircle2} iconColor="text-cyan-400" />
                <SummaryCard label="Perlu Perhatian" value={data?.studentsNeedingAttention?.toString() ?? '-'} detail={hasData ? 'siswa perlu pendampingan' : 'Data belum tersedia'} icon={Clock3} iconColor="text-amber-400" />
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-800/90 shadow-xl">
                <div className="flex flex-col gap-2 border-b border-slate-700 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Perkembangan Siswa</h3>
                        <p className="text-sm text-slate-400">Progress berdasarkan materi dan latihan yang telah diselesaikan.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400"><Award className="h-4 w-4 shrink-0 text-amber-400" /> Target kelas: {data?.target !== undefined ? `${data.target}%` : '-'}</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500">
                            <tr><th className="px-6 py-4 font-semibold">Nama Siswa</th><th className="px-6 py-4 font-semibold">Progress Materi</th><th className="px-6 py-4 font-semibold">Nilai Rata-rata</th><th className="px-6 py-4 font-semibold">Aktivitas Terakhir</th><th className="px-6 py-4 font-semibold">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/70">
                            {students.length === 0 ? <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500">Belum ada data hasil pembelajaran siswa.</td></tr> : students.map((student) => <tr key={student.name} className="transition-colors hover:bg-slate-700/20">
                                <td className="whitespace-nowrap px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-300">{student.initials}</div><span className="font-semibold text-slate-200">{student.name}</span></div></td>
                                <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="h-2 w-32 overflow-hidden rounded-full bg-slate-700"><div className={`h-full rounded-full ${student.progress >= 80 ? 'bg-emerald-400' : student.progress >= 60 ? 'bg-blue-400' : 'bg-amber-400'}`} style={{ width: `${student.progress}%` }} /></div><div><p className="font-semibold text-slate-200">{student.progress > 0 ? `${student.progress}%` : 'Belum tersedia'}</p><p className="text-xs text-slate-500">{student.completed}</p></div></div></td>
                                <td className="px-6 py-4 font-semibold text-slate-200">{student.score > 0 ? `${student.score}/100` : 'Belum tersedia'}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-slate-400">{student.lastActivity}</td>
                                <td className="px-6 py-4"><span className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[student.status]}`}>{student.status}</span></td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

function SummaryCard({ label, value, detail, icon: Icon, iconColor }: { label: string; value: string; detail: string; icon: typeof BookOpenCheck; iconColor: string }) {
    return <div className="rounded-2xl border border-slate-700 bg-slate-800/90 p-5 shadow-lg"><div className="flex items-center justify-between"><p className="text-sm text-slate-400">{label}</p><Icon className={`h-5 w-5 ${iconColor}`} /></div><p className="mt-3 text-2xl font-bold text-white">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>;
}