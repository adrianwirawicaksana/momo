'use client';

import { BookOpen, CalendarDays, ChevronDown, Download, Pencil, Plus, Printer, Save, Trash2, Volume2, VolumeX, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { createManualMaterial, deleteMaterial, getModuleDetail, getModuleMaterials, updateMaterial, type ModulDetail, type ModulMaterial } from '@/api/modul/route';
import { DashboardTabs } from '../../../_components/DashboardTabs';
import { GlobalLoading } from '@/components/shared/GlobalLoading';

const formatLabel = (value: string) => value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const hiddenKeys = new Set(['id', 'modul_id', 'module_id', 'urutan', 'order', 'created_at', 'updated_at']);

const formatSectionLabel = (value: string) => {
    const phaseMatch = value.match(/^(?:fase|phase)[ _-]*(\d+)$/i);
    return phaseMatch ? `Fase ${phaseMatch[1]}` : formatLabel(value);
};

const formatDate = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(date);
};

const parseMaterial = (value: unknown): unknown => {
    if (typeof value !== 'string') return value;
    const trimmedValue = value.trim();
    if (!trimmedValue.startsWith('{') && !trimmedValue.startsWith('[')) return value;
    try {
        return JSON.parse(trimmedValue) as unknown;
    } catch {
        return value;
    }
};

const unwrapMaterial = (value: unknown): unknown => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length !== 1) return value;
    const [key, nestedValue] = entries[0];
    if (['materi', 'material', 'content', 'contents', 'data'].includes(key.toLowerCase()) && nestedValue && typeof nestedValue === 'object') {
        return unwrapMaterial(nestedValue);
    }
    return value;
};

const toVoiceText = (value: unknown): string => {
    if (typeof value === 'string') return value.replace(/^#{1,6}\s+/gm, '').replace(/[*_`]/g, ' ');
    if (Array.isArray(value)) return value.map(toVoiceText).filter(Boolean).join('. ');
    if (value && typeof value === 'object') {
        return Object.entries(value as Record<string, unknown>)
            .filter(([key]) => !hiddenKeys.has(key.toLowerCase()))
            .map(([key, item]) => `${formatSectionLabel(key)}. ${toVoiceText(item)}`)
            .filter(Boolean)
            .join('. ');
    }
    return '';
};

const splitVoiceText = (text: string, maxLength = 220): string[] => {
    const words = text.replace(/\s+/g, ' ').trim().split(' ');
    const chunks: string[] = [];
    let current = '';

    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length > maxLength && current) {
            chunks.push(current);
            current = word;
        } else {
            current = candidate;
        }
    }
    if (current) chunks.push(current);
    return chunks;
};

const getVoiceSegments = (value: unknown): string[] => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return Object.entries(value as Record<string, unknown>)
            .filter(([key]) => !hiddenKeys.has(key.toLowerCase()))
            .flatMap(([key, item]) => splitVoiceText(`${formatSectionLabel(key)}. ${toVoiceText(item)}`));
    }
    const text = toVoiceText(value);
    return text ? splitVoiceText(text) : [];
};

function MaterialValue({ value, activeSectionKey }: { value: unknown; activeSectionKey?: string }) {
    if (typeof value === 'string') {
        return <MaterialText value={value} />;
    }
    if (Array.isArray(value)) {
        return <ul className="space-y-3 pl-5 font-normal marker:text-blue-400">{value.map((item, index) => <li key={index} className="pl-2 font-normal"><MaterialValue value={item} activeSectionKey={activeSectionKey} /></li>)}</ul>;
    }
    if (value && typeof value === 'object') {
        const entries = Object.entries(value as Record<string, unknown>).filter(([key]) => !hiddenKeys.has(key.toLowerCase()));
        return <div className="space-y-3 font-normal [&_div]:font-normal [&_li]:font-normal [&_p]:font-normal">{entries.map(([key, item], index) => <details key={key} data-section-key={key} open={activeSectionKey ? activeSectionKey === key : index === 0} className={`group scroll-mt-24 overflow-hidden rounded-2xl border bg-slate-950/40 transition-colors ${activeSectionKey === key ? 'border-emerald-400/80 shadow-lg shadow-emerald-950/30' : 'border-slate-700'}`}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-lg font-bold text-blue-100 transition hover:bg-slate-800/70 [&::-webkit-details-marker]:hidden">
                <span>{formatSectionLabel(key)}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-blue-300 transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-slate-700 px-5 py-5 font-normal text-slate-100"><MaterialValue value={item} activeSectionKey={activeSectionKey} /></div>
        </details>)}</div>;
    }
    return <p className="font-normal text-slate-500">Materi belum tersedia.</p>;
}

function MaterialText({ value }: { value: string }) {
    const blocks = value.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
    return <div className="space-y-6 font-normal text-base leading-8 text-slate-100 sm:text-lg [&_li]:font-normal [&_p]:font-normal">{blocks.map((block, index) => {
        const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
        if (lines.every((line) => /^[-*]\s+/.test(line))) {
            return <ul key={index} className="list-disc space-y-2 pl-6 font-normal marker:text-blue-400">{lines.map((line) => <li key={line} className="font-normal">{line.replace(/^[-*]\s+/, '')}</li>)}</ul>;
        }
        if (/^#{1,3}\s+/.test(lines[0])) {
            const [, heading] = lines[0].match(/^#{1,3}\s+(.+)/) ?? [];
            return <section key={index}><h2 className="mb-3 font-(family-name:--font-poppins) text-2xl font-bold leading-tight text-white">{heading}</h2><p className="whitespace-pre-wrap font-normal leading-8">{lines.slice(1).join('\n')}</p></section>;
        }
        return <p key={index} className="whitespace-pre-wrap font-normal leading-8">{block}</p>;
    })}</div>;
}

export default function MateriDetailPage() {
    const params = useParams<{ id: string }>();
    const [module, setModule] = useState<ModulDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [currentVoiceIndex, setCurrentVoiceIndex] = useState(0);
    const [materials, setMaterials] = useState<ModulMaterial[]>([]);
    const [isMaterialFormOpen, setIsMaterialFormOpen] = useState(false);
    const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
    const [materialTitle, setMaterialTitle] = useState('');
    const [materialContent, setMaterialContent] = useState('');
    const [materialOrder, setMaterialOrder] = useState('');
    const [isMaterialSaving, setIsMaterialSaving] = useState(false);

    const resetMaterialForm = () => {
        setIsMaterialFormOpen(false);
        setEditingMaterialId(null);
        setMaterialTitle('');
        setMaterialContent('');
        setMaterialOrder('');
    };

    const refreshMaterials = async (moduleId: number, token: string) => {
        const items = await getModuleMaterials(moduleId, token);
        setMaterials(items);
        return items;
    };

    useEffect(() => {
        const moduleId = Number(params.id);
        const token = window.localStorage.getItem('auth_token');
        if (!moduleId || !token) {
            void Promise.resolve().then(() => setIsLoading(false));
            return;
        }

        void Promise.all([getModuleDetail(moduleId, token), getModuleMaterials(moduleId, token)])
            .then(([detail, items]) => {
                setModule(detail);
                setMaterials(items);
            }).catch(() => {
                toast.error('Detail materi gagal dimuat.');
            }).finally(() => {
                setIsLoading(false);
            });
    }, [params.id]);

    const material = useMemo(() => materials.length > 0 ? materials : unwrapMaterial(parseMaterial(module?.materi)), [materials, module?.materi]);
    const voiceSegments = useMemo(() => getVoiceSegments(material), [material]);

    const activeVoiceSectionKey = useMemo(() => {
        if (!material || !isVoiceActive || typeof material !== 'object' || Array.isArray(material)) return undefined;
        let segmentOffset = 0;
        for (const [key, item] of Object.entries(material as Record<string, unknown>)) {
            if (hiddenKeys.has(key.toLowerCase())) continue;
            const sectionLength = splitVoiceText(`${formatSectionLabel(key)}. ${toVoiceText(item)}`).length;
            if (currentVoiceIndex >= segmentOffset && currentVoiceIndex < segmentOffset + sectionLength) return key;
            segmentOffset += sectionLength;
        }
        return undefined;
    }, [currentVoiceIndex, isVoiceActive, material]);

    useEffect(() => {
        if (!activeVoiceSectionKey) return;
        const section = Array.from(document.querySelectorAll<HTMLDetailsElement>('[data-section-key]')).find((element) => element.dataset.sectionKey === activeVoiceSectionKey);
        if (!section) return;
        section.open = true;
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [activeVoiceSectionKey]);

    useEffect(() => () => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }, []);

    const downloadPdf = () => window.print();
    const speakSegment = (index: number) => {
        if (!voiceSegments[index] || !('speechSynthesis' in window)) {
            setIsVoiceActive(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(voiceSegments[index]);
        setCurrentVoiceIndex(index);
        utterance.lang = 'id-ID';
        utterance.rate = 0.92;
        utterance.pitch = 1;
        utterance.onend = () => {
            if (index + 1 < voiceSegments.length) {
                speakSegment(index + 1);
            } else {
                setIsVoiceActive(false);
                setCurrentVoiceIndex(0);
            }
        };
        utterance.onerror = () => {
            setIsVoiceActive(false);
            setCurrentVoiceIndex(0);
        };
        window.speechSynthesis.speak(utterance);
    };

    const toggleVoice = () => {
        if (!('speechSynthesis' in window)) {
            toast.error('Browser ini belum mendukung mode voice.');
            return;
        }
        if (isVoiceActive) {
            window.speechSynthesis.cancel();
            setIsVoiceActive(false);
            setCurrentVoiceIndex(0);
            return;
        }
        setIsVoiceActive(true);
        window.speechSynthesis.cancel();
        speakSegment(0);
    };

    const startMaterialEdit = (item: ModulMaterial) => {
        setEditingMaterialId(item.id);
        setMaterialTitle(item.judul);
        setMaterialContent(item.konten);
        setMaterialOrder(String(item.urutan));
        setIsMaterialFormOpen(true);
    };

    const saveMaterial = async (event: React.FormEvent) => {
        event.preventDefault();
        const moduleId = Number(params.id);
        const token = window.localStorage.getItem('auth_token');
        if (!moduleId || !token || !materialTitle.trim() || !materialContent.trim()) {
            toast.error('Judul dan konten materi wajib diisi.');
            return;
        }

        setIsMaterialSaving(true);
        try {
            const payload = {
                judul: materialTitle.trim(),
                konten: materialContent.trim(),
                ...(materialOrder && Number(materialOrder) > 0 ? { urutan: Number(materialOrder) } : {}),
            };
            if (editingMaterialId) {
                await updateMaterial(editingMaterialId, payload, token);
                toast.success('Materi berhasil diperbarui.');
            } else {
                await createManualMaterial(moduleId, payload, token);
                toast.success('Materi manual berhasil ditambahkan.');
            }
            await refreshMaterials(moduleId, token);
            resetMaterialForm();
        } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.error || error.response?.data?.message : undefined;
            toast.error(message || 'Materi gagal disimpan.');
        } finally {
            setIsMaterialSaving(false);
        }
    };

    const removeMaterial = async (item: ModulMaterial) => {
        const token = window.localStorage.getItem('auth_token');
        if (!token || !window.confirm(`Hapus materi "${item.judul}"?`)) return;
        try {
            await deleteMaterial(item.id, token);
            setMaterials((current) => current.filter((materialItem) => materialItem.id !== item.id));
            toast.success('Materi berhasil dihapus.');
        } catch (error) {
            const message = axios.isAxiosError(error) ? error.response?.data?.error || error.response?.data?.message : undefined;
            toast.error(message || 'Materi gagal dihapus.');
        }
    };
    const createdAt = formatDate(module?.created_at);

    return <div className="flex h-[calc(100dvh-5rem)] min-h-0 overflow-hidden bg-slate-900 font-(family-name:--font-nunito) text-slate-100">
        <div className="flex h-full min-h-0 w-full flex-col gap-5 overflow-hidden p-3 sm:gap-6 sm:p-6 lg:flex-row lg:items-start lg:gap-0 lg:p-0">
            <div className="print:hidden">
                <DashboardTabs activeTab="kelola-kelas" />
            </div>
            <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-1 py-2 sm:px-0 lg:h-full lg:p-8">
                <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden">
                    {isLoading ? <GlobalLoading label="Materi sedang dimuat..." /> : !module ? <div className="rounded-3xl border border-slate-800 bg-slate-800/90 p-8 text-center shadow-xl"><BookOpen className="mx-auto h-12 w-12 text-slate-600" /><h1 className="mt-4 text-xl font-bold">Materi tidak ditemukan</h1><p className="mt-2 text-slate-400">Modul ini tidak dapat diakses atau belum tersedia.</p></div> : <article className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/90 shadow-xl print:border-0 print:bg-white print:text-slate-900 print:shadow-none">
                        <header className="shrink-0 border-b border-slate-700 bg-slate-800 px-6 py-7 sm:px-10 print:bg-white print:px-0 print:py-4">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 text-blue-300 print:text-blue-700"><BookOpen className="h-6 w-6" /><span className="text-sm font-semibold uppercase tracking-wider">Materi Pembelajaran</span></div>
                                    <h1 className="mt-4 font-(family-name:--font-poppins) text-3xl font-black tracking-tight text-white sm:text-4xl print:text-slate-900">{module.judul || module.nama || `Modul ${module.id}`}</h1>
                                    {module.deskripsi && <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-200 print:text-slate-600">{module.deskripsi}</p>}
                                    {createdAt && <p className="mt-5 flex items-center gap-2 text-sm text-slate-300 print:text-slate-600"><CalendarDays className="h-4 w-4" /> Dibuat {createdAt}</p>}
                                </div>
                                <div className="flex shrink-0 flex-wrap gap-2 print:hidden">
                                    <button type="button" onClick={toggleVoice} className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-500 sm:min-h-11 sm:px-4 sm:py-2.5">{isVoiceActive ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />} {isVoiceActive ? 'Berhenti' : 'Bacakan'}</button>
                                    <button type="button" onClick={downloadPdf} className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-500 sm:min-h-11 sm:px-4 sm:py-2.5"><Download className="h-4 w-4" /> PDF</button>
                                </div>
                            </div>
                            <div className="mt-6 border-t border-slate-700 pt-5 print:hidden">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div><h2 className="text-lg font-bold text-white">Kelola Materi</h2><p className="text-sm text-slate-400">Tambah atau ubah materi manual tanpa menghapus hasil AI.</p></div>
                                    <button type="button" onClick={() => { resetMaterialForm(); setIsMaterialFormOpen(true); }} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"><Plus className="h-4 w-4" /> Tulis Materi</button>
                                </div>
                                {isMaterialFormOpen && <form onSubmit={saveMaterial} className="mt-4 space-y-3 rounded-2xl border border-slate-700 bg-slate-950/40 p-4"><input value={materialTitle} onChange={(event) => setMaterialTitle(event.target.value)} placeholder="Judul materi" aria-label="Judul materi" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-blue-500" /><textarea value={materialContent} onChange={(event) => setMaterialContent(event.target.value)} placeholder="Konten materi" aria-label="Konten materi" rows={5} className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-blue-500" /><input value={materialOrder} onChange={(event) => setMaterialOrder(event.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Urutan (opsional)" aria-label="Urutan materi" className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white outline-none focus:border-blue-500" /><div className="flex gap-2"><button type="submit" disabled={isMaterialSaving} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Save className="h-4 w-4" /> {isMaterialSaving ? 'Menyimpan...' : 'Simpan Materi'}</button><button type="button" onClick={resetMaterialForm} disabled={isMaterialSaving} className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><X className="h-4 w-4" /> Batal</button></div></form>}
                                {materials.length > 0 && <div className="mt-4 space-y-2">{materials.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/40 p-3"><div className="min-w-0"><p className="truncate font-semibold text-white">{item.urutan}. {item.judul}</p><p className="truncate text-xs text-slate-500">{item.konten}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => startMaterialEdit(item)} className="rounded-lg bg-blue-600 p-2 text-white" title="Edit materi"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => void removeMaterial(item)} className="rounded-lg bg-rose-600 p-2 text-white" title="Hapus materi"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>}
                            </div>
                        </header>
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 text-lg font-normal leading-8 text-white sm:px-10 sm:py-6 lg:px-14">
                            <MaterialValue value={material} activeSectionKey={activeVoiceSectionKey} />
                        </div>
                        <footer className="flex shrink-0 items-center gap-2 border-t border-slate-800 px-6 py-4 text-xs text-slate-500 sm:px-10 print:hidden"><Printer className="h-4 w-4" /> Gunakan Download PDF untuk menyimpan materi.</footer>
                    </article>}
                </div>
            </main>
        </div>
    </div>;
}
