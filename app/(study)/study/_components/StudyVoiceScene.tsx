'use client';

import Image from 'next/image';
import { Brain, Mic, Ear } from 'lucide-react';

type StudyVoiceSceneProps = {
    isListening: boolean;
    isReasoning: boolean;
    speechText: string;
    transcript: string;
    displayedText: string;
    onClick: () => void;
    onContextMenu: (event: React.MouseEvent) => void;
};

export function StudyVoiceScene({
    isListening,
    isReasoning,
    speechText,
    transcript,
    displayedText,
    onClick,
    onContextMenu,
}: StudyVoiceSceneProps) {
    return (
        <div
            onClick={onClick}
            onContextMenu={onContextMenu}
            className="w-screen min-h-[calc(100dvh-5rem)] bg-white flex flex-col md:flex-row overflow-x-hidden select-none cursor-pointer"
        >
            <section className="w-full md:w-1/2 bg-white p-6 sm:p-10 flex flex-col items-center justify-center gap-6 relative">
                <div className={`group relative z-20 w-full max-w-lg bg-blue-50/50 p-5 rounded-3xl border-2 border-blue-200 shadow-sm transition-all duration-300 ease-out hover:border-blue-400 ${displayedText ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90'}`}>
                    <p className="text-base sm:text-lg font-bold text-slate-800 text-center leading-relaxed break-words font-[family-name:var(--font-poppins)] min-h-[3rem] max-h-[12rem] overflow-y-auto flex items-center justify-center transition-transform duration-300 ease-out">
                        {isReasoning
                            ? 'Aku sedang berpikir'
                            : displayedText || (isListening
                                ? transcript.trim() || 'Belum ada rekaman suara.'
                                : speechText.trim() || transcript.trim() || 'Belum ada rekaman suara.')}
                    </p>

                    <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-blue-200 transition-colors group-hover:border-t-blue-400"></div>
                    <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-blue-50"></div>
                </div>

                <div className="relative z-10 shrink-0 mt-2">
                    <div
                        className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 -z-10 pointer-events-none ${isListening ? 'bg-red-200 scale-150 opacity-80 animate-pulse' : isReasoning ? 'bg-amber-200 scale-125 opacity-80 animate-pulse' : 'bg-blue-200 scale-110 opacity-70'}`}
                    ></div>

                    <div
                        className={`relative z-10 transition-all duration-300 ${isListening
                            ? 'w-46 h-46 sm:w-58 sm:h-58'
                            : isReasoning
                                ? 'w-40 h-40 sm:w-52 sm:h-52'
                                : 'w-36 h-36 sm:w-48 sm:h-48'
                            }`}
                    >
                        {isListening ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src="/icons/Listening-Cat.png"
                                    alt="Kucing sedang mendengarkan"
                                    fill
                                    unoptimized
                                    priority
                                    className="object-contain"
                                />
                            </div>
                        ) : isReasoning ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src="/icons/Reasoning-Cat.png"
                                    alt="Kucing sedang berpikir"
                                    fill
                                    unoptimized
                                    priority
                                    className="object-contain"
                                />
                            </div>
                        ) : (
                            <div className="relative w-full h-full">
                                <Image
                                    src="/icons/Momo.png"
                                    alt="Karakter maskot"
                                    fill
                                    unoptimized
                                    priority
                                    className="object-contain"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-slate-600 text-xs sm:text-sm font-bold tracking-wider uppercase relative z-20">
                    Klik Kiri: Dengarkan Teks
                </p>
            </section>

            <section className="w-full md:w-1/2 bg-white p-4 sm:p-8 flex items-center justify-center">
                <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 border-b-8 shadow-xl flex flex-col items-center justify-between gap-6 min-h-[420px] sm:min-h-[480px]">
                    <div className="w-full text-center pt-2">
                        <h2 className={`text-xl sm:text-2xl font-black font-[family-name:var(--font-poppins)] ${isListening ? 'text-red-500' : isReasoning ? 'text-amber-600' : 'text-slate-800'}`}>
                            {isListening ? 'Sedang Mendengarkan...' : isReasoning ? 'Menyusun jawaban...' : 'Siap Bicara?'}
                        </h2>
                    </div>

                    <div className="relative flex items-center justify-center my-auto">
                        {isListening && (
                            <>
                                <div className="absolute inset-0 rounded-full bg-red-100 animate-ping scale-150 pointer-events-none"></div>
                                <div className="absolute inset-0 rounded-full bg-red-200 animate-ping delay-300 scale-125 pointer-events-none"></div>
                            </>
                        )}

                        <div
                            aria-disabled={isReasoning}
                            className={`game-button w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'scale-105 border-red-400 bg-gradient-to-b from-red-500 to-red-600 shadow-[0_8px_0_#b91c1c]' : isReasoning ? 'opacity-90 border-amber-400 bg-gradient-to-b from-amber-400 to-amber-500 shadow-[0_8px_0_#b45309]' : 'border-blue-500 bg-gradient-to-b from-blue-500 to-blue-600 shadow-[0_8px_0_#1d4ed8]'}`}
                        >
                            {isListening ? (
                                <Ear className="h-12 w-12 sm:h-16 sm:w-16 drop-shadow-md text-white" strokeWidth={2.5} />
                            ) : isReasoning ? (
                                <Brain className="h-12 w-12 sm:h-16 sm:w-16 drop-shadow-md text-white" strokeWidth={2.5} />
                            ) : (
                                <Mic className="h-12 w-12 sm:h-16 sm:w-16 drop-shadow-md text-white" strokeWidth={2.5} />
                            )}
                        </div>
                    </div>

                    <div className="w-full pb-2 text-center flex flex-col gap-2">
                        <div className={`py-3 px-4 rounded-2xl uppercase font-bold text-sm tracking-wide transition-all border-2 ${isListening ? 'bg-white border-red-200 text-red-600' : isReasoning ? 'bg-white border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                            {isListening ? 'Klik Kanan: Untuk Stop' : isReasoning ? 'Tunggu sebentar, aku sedang menyiapkan jawaban...' : 'Klik Kanan: Untuk Bicara'}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
