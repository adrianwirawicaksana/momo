'use client';

import { ArrowLeft, BookOpen, CalendarDays, ChevronDown, Download, Pencil, Printer, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getModuleDetail, getModuleMaterials, type ModulDetail } from '@/api/modul/route';
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

const escapeHtml = (value: string) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const renderPrintableValue = (value: unknown): string => {
    if (typeof value === 'string') {
        return `<div class="print-block">${escapeHtml(value).replace(/\n/g, '<br />')}</div>`;
    }

    if (Array.isArray(value)) {
        return `<ul class="print-list">${value.map((item) => `<li>${renderPrintableValue(item)}</li>`).join('')}</ul>`;
    }

    if (value && typeof value === 'object') {
        const entries = Object.entries(value as Record<string, unknown>).filter(([key]) => !hiddenKeys.has(key.toLowerCase()));
        if (entries.length === 0) {
            return '<p>Belum ada isi materi.</p>';
        }

        return entries.map(([key, item]) => `<section class="print-section"><h2>${escapeHtml(formatSectionLabel(key))}</h2>${renderPrintableValue(item)}</section>`).join('');
    }

    return '<p>Belum ada isi materi.</p>';
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
        return <div className="space-y-3 font-normal print:space-y-6 print:text-black [&_div]:font-normal [&_li]:font-normal [&_p]:font-normal">{entries.map(([key, item], index) => <details key={key} data-section-key={key} open={activeSectionKey ? activeSectionKey === key : index === 0} className={`group scroll-mt-24 overflow-hidden rounded-2xl border bg-slate-950/40 transition-colors print:overflow-visible print:rounded-none print:border-0 print:bg-transparent print:text-black ${activeSectionKey === key ? 'border-emerald-400/80 shadow-lg shadow-emerald-950/30' : 'border-slate-700'}`}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-lg font-bold text-blue-100 transition hover:bg-slate-800/70 print:hidden [&::-webkit-details-marker]:hidden">
                <span>{formatSectionLabel(key)}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-blue-300 transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-slate-700 px-5 py-5 font-normal text-slate-100 print:border-0 print:px-0 print:py-0 print:text-black"><MaterialValue value={item} activeSectionKey={activeSectionKey} /></div>
        </details>)}</div>;
    }
    return <p className="font-normal text-slate-500 print:text-black">Materi atau soal belum tersedia.</p>;
}

function MaterialText({ value }: { value: string }) {
    const blocks = value.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
    return <div className="space-y-6 font-normal text-base leading-8 text-slate-100 sm:text-lg print:text-black [&_li]:font-normal [&_p]:font-normal">{blocks.map((block, index) => {
        const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
        if (lines.every((line) => /^[-*]\s+/.test(line))) {
            return <ul key={index} className="list-disc space-y-2 pl-6 font-normal marker:text-blue-400">{lines.map((line) => <li key={line} className="font-normal">{line.replace(/^[-*]\s+/, '')}</li>)}</ul>;
        }
        if (/^#{1,3}\s+/.test(lines[0])) {
            const [, heading] = lines[0].match(/^#{1,3}\s+(.+)/) ?? [];
            return <section key={index}><h2 className="mb-3 font-(family-name:--font-poppins) text-2xl font-bold leading-tight text-white print:text-black">{heading}</h2><p className="whitespace-pre-wrap font-normal leading-8 print:text-black">{lines.slice(1).join('\n')}</p></section>;
        }
        return <p key={index} className="whitespace-pre-wrap font-normal leading-8 print:text-black">{block}</p>;
    })}</div>;
}

function QuestionList({ questions }: { questions: NonNullable<ModulDetail['soal']> }) {
    return <section className="mt-10 print:mt-8">
        <div className="space-y-5">
            {questions.map((question, index) => <article key={question.id} className="rounded-2xl border border-slate-700 bg-slate-950/40 p-5 print:break-inside-avoid print:rounded-none print:border-slate-300 print:bg-transparent print:p-0 print:pb-5">
                <h3 className="font-semibold text-white print:text-black">{index + 1}. {question.pertanyaan}</h3>
                <ol className="mt-3 grid gap-2 pl-6 text-base text-slate-300 marker:text-blue-400 print:text-black sm:grid-cols-2" type="A">
                    {[question.pilihan_a, question.pilihan_b, question.pilihan_c, question.pilihan_d].map((option, optionIndex) => <li key={option}><span className="font-bold">{String.fromCharCode(65 + optionIndex)}.</span> {option}</li>)}
                </ol>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-blue-300 print:text-slate-600">Jenis: {question.jenis}</p>
            </article>)}
        </div>
    </section>;
}

export default function MateriDetailPage() {
    const params = useParams<{ id: string }>();
    const [module, setModule] = useState<ModulDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [currentVoiceIndex, setCurrentVoiceIndex] = useState(0);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [materials, setMaterials] = useState<Awaited<ReturnType<typeof getModuleMaterials>>>([]);

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
    const hasQuestions = Boolean(module?.soal?.length);
    const hasMaterial = Boolean(material);
    const detailLabel = hasQuestions && !hasMaterial ? 'Detail Soal' : hasMaterial && hasQuestions ? 'Detail Materi & Soal' : 'Detail Materi';
    const contentLabel = hasQuestions && !hasMaterial ? 'Soal Pembelajaran' : hasMaterial && hasQuestions ? 'Materi & Soal Pembelajaran' : 'Materi Pembelajaran';
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

    const downloadPdf = () => {
        if (isDownloadingPdf || typeof window === 'undefined' || !module) return;

        setIsDownloadingPdf(true);

        const printWindow = window.open('', '_blank', 'width=1200,height=900');
        if (!printWindow) {
            toast.error('Popup diblokir. Izinkan popup lalu klik print PDF lagi.');
            setIsDownloadingPdf(false);
            return;
        }

        const printableContent = materials.length > 0
            ? materials.map((item) => `<section class="print-section"><h2>${escapeHtml(item.judul || 'Materi')}</h2><div>${escapeHtml(item.konten || 'Belum ada isi materi.').replace(/\n/g, '<br />')}</div></section>`).join('')
            : renderPrintableValue(material);

        const title = (module.judul || module.nama || `Modul ${module.id ?? ''}`).trim();
        const html = `
            <!doctype html>
            <html>
              <head>
                <title>${escapeHtml(title)}</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    color: #0f172a;
                    background: #ffffff;
                    margin: 0;
                    padding: 32px;
                    line-height: 1.7;
                  }
                  h1 {
                    margin: 0 0 12px;
                    font-size: 30px;
                    border-bottom: 2px solid #2563eb;
                    padding-bottom: 12px;
                  }
                  .meta {
                    color: #475569;
                    margin-bottom: 24px;
                  }
                  .print-section {
                    margin: 0 0 24px;
                    page-break-inside: avoid;
                  }
                  .print-section h2 {
                    font-size: 22px;
                    color: #1d4ed8;
                    margin: 0 0 12px;
                  }
                  .print-list {
                    margin: 0 0 12px;
                    padding-left: 22px;
                  }
                  .print-block, .print-section p, .print-section li {
                    font-size: 15px;
                    margin: 0 0 8px;
                  }
                  .print-section div {
                    white-space: pre-wrap;
                  }
                </style>
              </head>
              <body>
                <h1>${escapeHtml(title)}</h1>
                ${module.deskripsi ? `<div class="meta">${escapeHtml(module.deskripsi)}</div>` : ''}
                ${printableContent}
              </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        window.setTimeout(() => {
            try {
                printWindow.focus();
                printWindow.print();
            } catch {
                toast.error('Browser tidak bisa membuka print dialog.');
            } finally {
                window.setTimeout(() => {
                    printWindow.close();
                    setIsDownloadingPdf(false);
                }, 1200);
            }
        }, 250);
    };
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

    const createdAt = formatDate(module?.created_at);

    return <>
        <style jsx global>{`
            @media print {
                html, body {
                    background: #ffffff !important;
                    overflow: visible !important;
                    height: auto !important;
                }
                body > div {
                    background: #ffffff !important;
                }
                .material-print-content {
                    display: block !important;
                    overflow: visible !important;
                    max-height: none !important;
                    height: auto !important;
                    color: #0f172a !important;
                }
                .material-print-content details {
                    display: block !important;
                    border: none !important;
                    background: transparent !important;
                    box-shadow: none !important;
                    margin-bottom: 18px !important;
                    break-inside: avoid;
                }
                .material-print-content details summary {
                    display: none !important;
                }
                .material-print-content details > div {
                    display: block !important;
                    border-top: 1px solid #cbd5e1 !important;
                    padding: 12px 0 0 !important;
                }
                .material-print-content * {
                    color: #0f172a !important;
                    background: transparent !important;
                }
            }
        `}</style>
        <div className="flex h-[calc(100dvh-5rem)] min-h-0 overflow-hidden bg-slate-900 font-(family-name:--font-nunito) text-slate-100 print:h-auto print:min-h-0 print:overflow-visible print:bg-white print:text-slate-900">
            <div className="flex h-full min-h-0 w-full flex-col gap-5 overflow-hidden p-3 sm:gap-6 lg:flex-row lg:items-start lg:gap-0 lg:p-0 print:h-auto print:min-h-0 print:overflow-visible print:p-0">
                <div className="print:hidden">
                    <DashboardTabs activeTab="kelola-kelas" />
                </div>
                <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-1 py-2 sm:px-0 lg:h-full lg:p-8 print:h-auto print:min-h-0 print:overflow-visible print:p-0">
                    <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden print:h-auto print:min-h-0 print:max-w-none print:overflow-visible">
                        {isLoading ? <GlobalLoading label="Materi sedang dimuat..." /> : !module ? <div className="rounded-3xl border border-slate-800 bg-slate-800/90 p-8 text-center shadow-xl"><BookOpen className="mx-auto h-12 w-12 text-slate-600" /><h1 className="mt-4 text-xl font-bold">Materi tidak ditemukan</h1><p className="mt-2 text-slate-400">Modul ini tidak dapat diakses atau belum tersedia.</p></div> : <article className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/90 shadow-xl print:h-auto print:min-h-0 print:overflow-visible print:border-0 print:bg-white print:text-slate-900 print:shadow-none">
                            <header className="shrink-0 border-b border-slate-700 bg-slate-800 px-6 py-7 sm:px-10 print:hidden">
                                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-3 text-blue-300 print:text-blue-700"><BookOpen className="h-6 w-6" /><span className="text-sm font-semibold uppercase tracking-wider">{contentLabel}</span></div>
                                        <h1 className="mt-4 font-(family-name:--font-poppins) text-3xl font-black tracking-tight text-white sm:text-4xl print:text-slate-900">{module.judul || module.nama || `Modul ${module.id}`}</h1>
                                        {module.deskripsi && <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-200 print:text-slate-600">{module.deskripsi}</p>}
                                        {createdAt && <p className="mt-5 flex items-center gap-2 text-sm text-slate-300 print:text-slate-600"><CalendarDays className="h-4 w-4" /> Dibuat {createdAt}</p>}
                                    </div>
                                    <div className="flex shrink-0 flex-wrap gap-2 print:hidden">
                                        <Link href="/dashboard/kelola-kelas" className="game-button game-button-blue flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm sm:min-h-11 sm:px-4 sm:py-2.5"><ArrowLeft className="h-4 w-4" /> Kembali</Link>
                                        <button type="button" onClick={toggleVoice} className="game-button game-button-yellow flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm sm:min-h-11 sm:px-4 sm:py-2.5">{isVoiceActive ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />} {isVoiceActive ? 'Berhenti' : 'Bacakan'}</button>
                                        <button type="button" onClick={downloadPdf} disabled={isDownloadingPdf} className="game-button game-button-blue flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm sm:min-h-11 sm:px-4 sm:py-2.5 disabled:cursor-not-allowed disabled:opacity-60"><Download className="h-4 w-4" /> {isDownloadingPdf ? 'Membuka Print...' : 'Print PDF'}</button>
                                        {hasMaterial && <Link href={`/dashboard/kelola-kelas/materi/${module.id}/edit`} className="game-button game-button-blue flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm sm:min-h-11 sm:px-4 sm:py-2.5"><Pencil className="h-4 w-4" /> Kelola Materi</Link>}
                                    </div>
                                </div>
                            </header>
                            <div className="material-print-content min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 text-lg font-normal leading-8 text-white sm:px-10 sm:py-6 lg:px-14 print:h-auto print:min-h-0 print:overflow-visible print:px-0 print:text-slate-900">
                                <div className="hidden print:mb-8 print:block print:border-b print:border-slate-300 print:pb-5 print:text-black">
                                    <h1 className="font-(family-name:--font-poppins) text-3xl font-bold leading-tight">{module.judul || module.nama || `Modul ${module.id}`}</h1>
                                    {module.deskripsi && <p className="mt-3 text-base leading-7">{module.deskripsi}</p>}
                                </div>
                                {hasMaterial && <MaterialValue value={material} activeSectionKey={activeVoiceSectionKey} />}
                                {module.soal && module.soal.length > 0 && <QuestionList questions={module.soal} />}
                            </div>
                            <footer className="flex shrink-0 items-center gap-2 border-t border-slate-800 px-6 py-4 text-xs text-slate-500 sm:px-10 print:hidden"><Printer className="h-4 w-4" /> Gunakan Print PDF untuk menyimpan {detailLabel.toLowerCase()}.</footer>
                        </article>}
                    </div>
                </main>
            </div>
        </div>
    </>;
}