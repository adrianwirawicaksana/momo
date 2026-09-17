'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Brain, Mic } from 'lucide-react';

const INITIAL_SPEECH_TEXT = 'Klik kiri layar untuk mendengar, klik kanan layar untuk bicara!';
const THINKING_SPEECH_TEXT = 'Saya sedang berpikir...';

type RecognitionResultLike = {
    isFinal: boolean;
    0: {
        transcript: string;
    };
};

type RecognitionEventLike = {
    resultIndex: number;
    results: ArrayLike<RecognitionResultLike>;
};

type RecognitionErrorLike = {
    error: string;
};

type SpeechRecognitionInstance = {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onstart: (() => void) | null;
    onresult: ((event: RecognitionEventLike) => void) | null;
    onerror: ((event: RecognitionErrorLike) => void) | null;
    onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export default function JoinClassPage() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [speechText, setSpeechText] = useState(() => {
        if (typeof window !== 'undefined' && !window.isSecureContext) {
            return 'Fitur suara butuh koneksi HTTPS / localhost.';
        }
        return INITIAL_SPEECH_TEXT;
    });
    const [displayedText, setDisplayedText] = useState('');
    const isReasoning = !isListening && Boolean(transcript.trim());
    const statusColorClass = isListening
        ? 'game-button-red'
        : isReasoning
            ? 'game-button-yellow'
            : 'game-button-blue';

    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const transcriptRef = useRef('');
    const finalTranscriptRef = useRef('');
    const interimTranscriptRef = useRef('');
    const isStartingRef = useRef(false);
    const lastSpokenSpeechTextRef = useRef('');
    const currentMessage = isListening ? speechText : isReasoning ? THINKING_SPEECH_TEXT : transcript.trim() || speechText;
    const currentVoiceMessage = isListening ? speechText : isReasoning ? THINKING_SPEECH_TEXT : currentMessage;

    // Efek mengetik otomatis (Typewriter effect)
    useEffect(() => {
        const fullText = currentMessage;

        let index = 0;
        const timer = setInterval(() => {
            if (index < fullText.length) {
                index += 1;
                setDisplayedText(fullText.slice(0, index));
            } else {
                clearInterval(timer);
            }
        }, 25);

        return () => clearInterval(timer);
    }, [currentMessage]);

    const safeStart = () => {
        if (!recognitionRef.current || isStartingRef.current) return;
        try {
            isStartingRef.current = true;
            recognitionRef.current.start();
        } catch {
            isStartingRef.current = false;
            toast.error('Gagal memulai rekaman, coba klik kanan lagi.');
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition =
            (window as typeof window & {
                SpeechRecognition?: SpeechRecognitionConstructor;
                webkitSpeechRecognition?: SpeechRecognitionConstructor;
            }).SpeechRecognition ||
            (window as typeof window & {
                SpeechRecognition?: SpeechRecognitionConstructor;
                webkitSpeechRecognition?: SpeechRecognitionConstructor;
            }).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            return;
        }

        const recognition: SpeechRecognitionInstance = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'id-ID';

        recognition.onstart = () => {
            isStartingRef.current = false;
            setIsListening(true);
            setSpeechText('Aku sedang mendengarkanmu, bicaralah...');
        };

        recognition.onresult = (event: RecognitionEventLike) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const resultText = event.results[i][0].transcript.trim();
                if (event.results[i].isFinal) {
                    finalTranscript += (finalTranscript ? ' ' : '') + resultText;
                } else {
                    interimTranscript += (interimTranscript ? ' ' : '') + resultText;
                }
            }

            if (finalTranscript) {
                finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalTranscript}`.replace(/\s+/g, ' ').trim();
                transcriptRef.current = finalTranscriptRef.current;
                setTranscript(finalTranscriptRef.current);
            }

            if (interimTranscript) {
                interimTranscriptRef.current = interimTranscript;
                const combinedText = `${finalTranscriptRef.current} ${interimTranscript}`.replace(/\s+/g, ' ').trim();
                transcriptRef.current = combinedText;
                setTranscript(combinedText);
            }
        };

        recognition.onerror = (event: RecognitionErrorLike) => {
            isStartingRef.current = false;

            if (event.error === 'not-allowed') {
                toast.error('Izin mikrofon ditolak. Cek pengaturan browser kamu.');
                setSpeechText('Akses mikrofon dibatalkan.');
            } else if (event.error === 'no-speech') {
                toast('Tidak ada suara terdeteksi', { icon: '❌' });
                setSpeechText('Suara tidak terdengar. Coba bicara lebih dekat ke mic!');
            } else if (event.error !== 'aborted') {
                toast.error('Terjadi kendala rekam suara');
                setSpeechText('Kendala sistem suara. Coba lagi ya!');
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            isStartingRef.current = false;
        };

        if (recognitionRef) {
            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.onend = null;
                recognitionRef.current.abort();
            }
        };
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            setIsListening(false);
            setSpeechText(INITIAL_SPEECH_TEXT);
            recognitionRef.current.stop();
        } else {
            transcriptRef.current = '';
            finalTranscriptRef.current = '';
            interimTranscriptRef.current = '';
            setTranscript('');
            safeStart();
        }
    };

    const speakText = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'id-ID';
            utterance.rate = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        if (lastSpokenSpeechTextRef.current !== currentVoiceMessage) {
            lastSpokenSpeechTextRef.current = currentVoiceMessage;
            speakText(currentVoiceMessage);
        }
    }, [currentVoiceMessage]);

    useEffect(() => {
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Handler Klik Layar: Klik Kiri = Mendengar (TTS), Klik Kanan = Merekam / Stop
    const handleGlobalClick = () => {
        // Mencegah trigger jika user klik elemen tertentu seperti toast
        speakText(isReasoning ? THINKING_SPEECH_TEXT : transcript || speechText);
    };

    const handleGlobalContextMenu = (e: React.MouseEvent) => {
        e.preventDefault(); // Matikan context menu default browser
        toggleListening();
    };

    return (
        /* Full screen wrapper yang menerima interaksi Klik Kiri dan Klik Kanan secara global */
        <div
            onClick={handleGlobalClick}
            onContextMenu={handleGlobalContextMenu}
            className="w-screen min-h-[calc(100dvh-5rem)] bg-white flex flex-col md:flex-row overflow-x-hidden select-none cursor-pointer"
        >
            {/* ===== KONTAINER KIRI: MASKOT + SPEECH BUBBLE ===== */}
            <section className="w-full md:w-1/2 bg-white p-6 sm:p-10 flex flex-col items-center justify-center gap-6 relative">

                {/* Speech Bubble / Balon Kata */}
                <div className="group relative z-20 w-full max-w-lg bg-blue-50/50 p-5 rounded-3xl border-2 border-blue-200 shadow-sm transition-all hover:border-blue-400">
                    <p className="text-base sm:text-lg font-bold text-slate-800 text-center leading-relaxed break-words font-[family-name:var(--font-poppins)] min-h-[3rem] flex items-center justify-center">
                        {displayedText}
                    </p>

                    {/* Panah Segitiga Bawah */}
                    <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-blue-200 transition-colors group-hover:border-t-blue-400"></div>
                    <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-blue-50"></div>
                </div>

                {/* Maskot Logo / Avatar */}
                <div className="relative z-10 shrink-0 mt-2">
                    {/* Aura lembut di belakang maskot */}
                    <div
                        className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 -z-10 pointer-events-none ${isListening ? 'bg-red-200 scale-150 opacity-80 animate-pulse' : isReasoning ? 'bg-amber-200 scale-125 opacity-80 animate-pulse' : 'bg-blue-200 scale-110 opacity-70'
                            }`}
                    ></div>

                    {/* Gambar Maskot */}
                    <div className={`relative z-10 transition-all duration-300 ${isListening || isReasoning ? 'w-44 h-44 sm:w-56 sm:h-56' : 'w-36 h-36 sm:w-48 sm:h-48'}`}>
                        <Image
                            src={isListening ? '/icons/Listening-Cat.png' : isReasoning ? '/icons/Reasoning-Cat.png' : '/icons/Logo.svg'}
                            alt={isListening ? 'Kucing sedang mendengarkan' : isReasoning ? 'Kucing sedang berpikir' : 'Karakter Maskot'}
                            fill
                            unoptimized
                            priority
                            className="object-contain drop-shadow-xl"
                        />
                    </div>
                </div>

                {/* Subtitle Bantuan */}
                <p className="text-slate-600 text-xs sm:text-sm font-bold tracking-wider uppercase relative z-20">
                    Klik Kiri: Dengarkan Teks
                </p>
            </section>

            {/* ===== KONTAINER KANAN: STATUS & INSTRUKSI ===== */}
            <section className="w-full md:w-1/2 bg-white p-4 sm:p-8 flex items-center justify-center">

                {/* Card Container Box Utama */}
                <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 border-b-8 shadow-xl flex flex-col items-center justify-between gap-6 min-h-[420px] sm:min-h-[480px]">

                    {/* Header Status */}
                    <div className="w-full text-center pt-2">
                        <h2 className={`text-xl sm:text-2xl font-black font-[family-name:var(--font-poppins)] ${isListening ? 'text-red-500' : isReasoning ? 'text-amber-600' : 'text-slate-800'}`}>
                            {isListening ? 'Sedang Mendengarkan...' : isReasoning ? 'Sedang Memahami...' : 'Siap Bicara?'}
                        </h2>
                    </div>

                    {/* Indikator Visual Status Suara */}
                    <div className="relative flex items-center justify-center my-auto">
                        {isListening && (
                            <>
                                <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping scale-150 pointer-events-none"></div>
                                <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping delay-300 scale-125 pointer-events-none"></div>
                            </>
                        )}

                        <div
                            aria-disabled={isReasoning}
                            className={`game-button ${statusColorClass} w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'scale-105' : isReasoning ? 'opacity-90' : ''}`}
                        >
                            {isReasoning ? <Brain className="h-12 w-12 sm:h-16 sm:w-16 drop-shadow-md" strokeWidth={2.5} /> : <Mic className="h-12 w-12 sm:h-16 sm:w-16 drop-shadow-md" strokeWidth={2.5} />}
                        </div>
                    </div>

                    {/* Petunjuk Aksi Global */}
                    <div className="w-full pb-2 text-center flex flex-col gap-2">
                        <div className={`py-3 px-4 rounded-2xl uppercase font-bold text-sm tracking-wide transition-all border-2 ${isListening ? 'bg-red-50 border-red-200 text-red-600' : isReasoning ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                            {isListening ? 'Klik Kanan: Untuk Stop' : isReasoning ? 'Klik Kanan: Untuk Bicara Lagi' : 'Klik Kanan: Untuk Bicara'}
                        </div>
                    </div>

                </div>

            </section>
        </div>
    );
}