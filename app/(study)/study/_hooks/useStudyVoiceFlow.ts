'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const API_BASE_URL = 'https://momo-be-production.up.railway.app';
const INITIAL_SPEECH_TEXT = 'Selamat datang di halaman study, Klik kiri layar untuk mendengar, klik kanan layar untuk bicara!';
const THINKING_MESSAGE = 'Aku sedang berpikir';
const LOADING_MESSAGE = 'Sedang menyiapkan jawaban untukmu...';
const LISTENING_MESSAGE = 'Aku sedang mendengarkanmu, bicaralah...';
const EMPTY_RECORDING_PLACEHOLDER = 'Menyimak suara...';
const REASONING_START_DELAY_MS = 220;

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

type SpeechRecognitionRuntime = SpeechRecognitionInstance & {
    _sessionId?: number;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export type UseStudyVoiceFlowResult = {
    isListening: boolean;
    isReasoning: boolean;
    speechText: string;
    transcript: string;
    displayedText: string;
    statusColorClass: string;
    handleGlobalClick: () => void;
    handleGlobalContextMenu: (event: React.MouseEvent) => void;
};

const sendTranscriptToTutor = async (text: string) => {
    try {
        const sessionId = typeof window !== 'undefined' ? window.localStorage.getItem('momo_session_id') : null;

        const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pesan: text,
                ...(sessionId ? { session_id: sessionId } : {}),
            }),
        });

        const payload = (await response.json()) as Record<string, unknown>;

        if (!response.ok) {
            const message = typeof payload.message === 'string'
                ? payload.message
                : 'Tutor sedang tidak bisa menjawab saat ini.';
            throw new Error(message);
        }

        const sessionIdFromResponse = typeof payload.session_id === 'string' ? payload.session_id : null;
        if (sessionIdFromResponse && typeof window !== 'undefined') {
            window.localStorage.setItem('momo_session_id', sessionIdFromResponse);
        }

        const answer = typeof payload.balasan === 'string'
            ? payload.balasan
            : typeof payload.message === 'string'
                ? payload.message
                : 'Tutor menjawab.';

        return answer;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Tutor sedang tidak bisa menjawab saat ini.');
    }
};

export function useStudyVoiceFlow(): UseStudyVoiceFlowResult {
    const [isListening, setIsListening] = useState(false);
    const [isReasoning, setIsReasoning] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [speechText, setSpeechText] = useState(() => {
        if (typeof window !== 'undefined' && !window.isSecureContext) {
            return 'Fitur suara butuh koneksi HTTPS / localhost.';
        }
        return INITIAL_SPEECH_TEXT;
    });
    const [displayedText, setDisplayedText] = useState('');
    const [phase, setPhase] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');

    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const transcriptRef = useRef('');
    const finalTranscriptRef = useRef('');
    const interimTranscriptRef = useRef('');
    const isStartingRef = useRef(false);
    const isSubmittingRef = useRef(false);
    const lastSubmittedTranscriptRef = useRef('');
    const activeFlowIdRef = useRef(0);
    const activeSubmitIdRef = useRef(0);
    const responseRevealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reasoningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isReasoningRef = useRef(false);
    const lastAutoSpokenTextRef = useRef('');
    const initialAutoSpeakRef = useRef(false);
    const isListeningRef = useRef(false);
    const speechCaptureCooldownRef = useRef(0);
    const activeSpeechTypeRef = useRef<'prompt' | 'answer' | 'none'>('none');
    const recognitionSessionRef = useRef(0);

    const isListeningPromptText = useCallback((text: string) => {
        const cleanText = text.trim().replace(/\s+/g, ' ').toLowerCase();
        const promptText = LISTENING_MESSAGE.trim().replace(/\s+/g, ' ').toLowerCase();

        return cleanText === promptText || cleanText.includes('aku sedang mendengarkanmu') || cleanText.includes('bicaralah');
    }, []);

    const statusColorClass = phase === 'listening' ? 'game-button-red' : phase === 'thinking' || phase === 'speaking' ? 'game-button-yellow' : 'game-button-blue';

    useEffect(() => {
        isReasoningRef.current = isReasoning;
    }, [isReasoning]);

    useEffect(() => {
        const textToRender = isReasoning
            ? THINKING_MESSAGE
            : phase === 'listening'
                ? (transcript.trim() || EMPTY_RECORDING_PLACEHOLDER)
                : phase === 'speaking'
                    ? (speechText.trim() || transcript.trim() || '')
                    : (speechText.trim() || transcript.trim() || '');

        if (!textToRender.trim()) {
            const clearTimer = window.setTimeout(() => {
                setDisplayedText('');
            }, 0);

            return () => {
                window.clearTimeout(clearTimer);
            };
        }

        let currentIndex = 0;
        const typingInterval = window.setInterval(() => {
            currentIndex += 1;
            setDisplayedText(textToRender.slice(0, currentIndex));

            if (currentIndex >= textToRender.length) {
                window.clearInterval(typingInterval);
            }
        }, 28);

        return () => {
            window.clearInterval(typingInterval);
        };
    }, [isReasoning, phase, speechText, transcript]);

    const speakText = useCallback((text: string, speechType: 'prompt' | 'answer' = 'prompt', onFinish?: () => void) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        if (!text?.trim()) return;

        activeSpeechTypeRef.current = speechType;
        speechCaptureCooldownRef.current = Date.now() + 2200;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find((voice) => /google/i.test(voice.name) && /id|indonesia/i.test(voice.lang));

        utterance.lang = 'id-ID';
        utterance.rate = 1.0;
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        if (speechType === 'answer') {
            utterance.onstart = () => {
                setDisplayedText(text);
            };
        }

        utterance.onend = () => {
            if (speechType === 'answer') {
                setDisplayedText(text);
                onFinish?.();
            }
            activeSpeechTypeRef.current = 'none';
        };

        utterance.onerror = () => {
            if (speechType === 'answer') {
                setDisplayedText(text);
                onFinish?.();
            }
            activeSpeechTypeRef.current = 'none';
        };

        window.speechSynthesis.speak(utterance);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        if (initialAutoSpeakRef.current) return;

        const textToSpeak = INITIAL_SPEECH_TEXT.trim();
        if (!textToSpeak) return;

        initialAutoSpeakRef.current = true;

        const timer = setTimeout(() => {
            speakText(textToSpeak);
        }, 500);

        return () => clearTimeout(timer);
    }, [speakText]);

    useEffect(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        if (phase === 'thinking' && isReasoning) {
            if (lastAutoSpokenTextRef.current === THINKING_MESSAGE) return;

            lastAutoSpokenTextRef.current = THINKING_MESSAGE;

            const timer = setTimeout(() => {
                speakText(THINKING_MESSAGE, 'prompt');
            }, 250);

            return () => clearTimeout(timer);
        }

        if (phase !== 'speaking' || isReasoning) return;

        const textToSpeak = (speechText.trim() || transcript.trim() || '').trim();
        if (!textToSpeak || textToSpeak === THINKING_MESSAGE) return;
        if (lastAutoSpokenTextRef.current === textToSpeak) return;

        lastAutoSpokenTextRef.current = textToSpeak;

        const timer = setTimeout(() => {
            speakText(textToSpeak, 'answer', () => {
                if (phase === 'speaking') {
                    setIsReasoning(false);
                    setPhase('idle');
                }
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [isReasoning, phase, speechText, speakText, transcript]);

    const submitVoiceAnswer = useCallback(
        async (answer: string, submissionId?: number) => {
            const trimmedAnswer = answer.trim();
            if (!trimmedAnswer) return;

            const latestSubmissionId = submissionId ?? ++activeSubmitIdRef.current;
            if (isSubmittingRef.current && submissionId === undefined) {
                return;
            }

            if (lastSubmittedTranscriptRef.current === trimmedAnswer && submissionId === undefined) {
                return;
            }

            isSubmittingRef.current = true;
            lastSubmittedTranscriptRef.current = trimmedAnswer;

            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }

            setIsReasoning(true);
            setPhase('thinking');
            setTranscript('');
            setSpeechText(LOADING_MESSAGE);

            if (reasoningTimeoutRef.current) {
                clearTimeout(reasoningTimeoutRef.current);
            }

            reasoningTimeoutRef.current = setTimeout(() => {
                void (async () => {
                    try {
                        const resultText = await sendTranscriptToTutor(trimmedAnswer);
                        const finalText = resultText || 'Tutor merespons.';

                        if (latestSubmissionId !== activeSubmitIdRef.current) {
                            return;
                        }

                        if (responseRevealTimeoutRef.current) {
                            clearTimeout(responseRevealTimeoutRef.current);
                        }

                        setIsReasoning(false);
                        setTranscript(finalText);
                        setSpeechText(finalText);
                        setPhase('speaking');
                        lastAutoSpokenTextRef.current = '';
                    } catch (error) {
                        if (latestSubmissionId !== activeSubmitIdRef.current) {
                            return;
                        }

                        const message = error instanceof Error ? error.message : 'Gagal menghubungkan ke stream backend.';
                        toast.error(message);
                        setSpeechText('Gagal menghubungkan ke tutor.');
                        setDisplayedText('');
                        setTimeout(() => {
                            if (latestSubmissionId !== activeSubmitIdRef.current) {
                                return;
                            }
                            setIsReasoning(false);
                            setPhase('idle');
                        }, 900);
                    } finally {
                        if (latestSubmissionId === activeSubmitIdRef.current) {
                            isSubmittingRef.current = false;
                        }
                    }
                })();
            }, REASONING_START_DELAY_MS);
        },
        [],
    );

    useEffect(() => {
        return () => {
            if (responseRevealTimeoutRef.current) {
                clearTimeout(responseRevealTimeoutRef.current);
                responseRevealTimeoutRef.current = null;
            }
            if (reasoningTimeoutRef.current) {
                clearTimeout(reasoningTimeoutRef.current);
                reasoningTimeoutRef.current = null;
            }
        };
    }, []);

    const finalizeCurrentRecording = useCallback((sessionId: number) => {
        const nextText = (finalTranscriptRef.current || transcriptRef.current || '').trim();
        if (!nextText) {
            setIsReasoning(false);
            setPhase('idle');
            setSpeechText(INITIAL_SPEECH_TEXT);
            setDisplayedText('');
            return;
        }

        if (sessionId !== recognitionSessionRef.current) {
            return;
        }

        activeSubmitIdRef.current += 1;
        const currentSubmitId = activeSubmitIdRef.current;
        setIsReasoning(true);
        setPhase('thinking');
        setTranscript('');
        setSpeechText(LOADING_MESSAGE);
        setDisplayedText('');

        if (reasoningTimeoutRef.current) {
            clearTimeout(reasoningTimeoutRef.current);
        }

        reasoningTimeoutRef.current = setTimeout(() => {
            void submitVoiceAnswer(nextText, currentSubmitId);
        }, REASONING_START_DELAY_MS);
    }, [submitVoiceAnswer]);

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

        const recognition: SpeechRecognitionRuntime = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'id-ID';

        recognition.onstart = () => {
            const runtime = recognition as SpeechRecognitionRuntime;
            runtime._sessionId = recognitionSessionRef.current;

            isStartingRef.current = false;
            isListeningRef.current = true;
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            speechCaptureCooldownRef.current = Date.now() + 2200;
            lastAutoSpokenTextRef.current = '';
            isSubmittingRef.current = false;
            lastSubmittedTranscriptRef.current = '';
            setIsListening(true);
            setPhase('listening');
            setTranscript('');
            setSpeechText('');
            setDisplayedText('');
            speakText(LISTENING_MESSAGE, 'prompt');
        };

        recognition.onresult = (event: RecognitionEventLike) => {
            const runtime = recognition as SpeechRecognitionRuntime;
            if (runtime._sessionId !== recognitionSessionRef.current) {
                return;
            }

            const now = Date.now();
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const resultText = event.results[i][0].transcript.trim();
                if (!resultText) continue;

                if (isListeningPromptText(resultText)) {
                    continue;
                }

                if (now < speechCaptureCooldownRef.current && isListeningPromptText(resultText)) {
                    continue;
                }

                if (event.results[i].isFinal) {
                    finalTranscript += (finalTranscript ? ' ' : '') + resultText;
                } else {
                    interimTranscript += (interimTranscript ? ' ' : '') + resultText;
                }
            }

            const nextFinalText = finalTranscript.trim();
            if (nextFinalText) {
                const normalized = nextFinalText.replace(/\s+/g, ' ');
                if (finalTranscriptRef.current === normalized) {
                    return;
                }

                finalTranscriptRef.current = `${finalTranscriptRef.current} ${normalized}`.replace(/\s+/g, ' ').trim();
                transcriptRef.current = finalTranscriptRef.current;
                setTranscript(finalTranscriptRef.current);
                if (!isListeningRef.current) {
                    setSpeechText(finalTranscriptRef.current);
                }
            }

            const nextInterimText = interimTranscript.trim();
            if (nextInterimText) {
                const normalized = nextInterimText.replace(/\s+/g, ' ');
                const combinedText = `${finalTranscriptRef.current} ${normalized}`.replace(/\s+/g, ' ').trim();
                if (transcriptRef.current === combinedText) {
                    return;
                }

                transcriptRef.current = combinedText;
                setTranscript(combinedText);
                if (!isListeningRef.current) {
                    setSpeechText(combinedText);
                }
            }
        };

        recognition.onerror = (event: RecognitionErrorLike) => {
            const runtime = recognition as SpeechRecognitionRuntime;
            if (runtime._sessionId !== recognitionSessionRef.current) {
                return;
            }

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
            const runtime = recognition as SpeechRecognitionRuntime;
            const sessionId = runtime._sessionId ?? recognitionSessionRef.current;
            isListeningRef.current = false;
            setIsListening(false);
            isStartingRef.current = false;

            finalizeCurrentRecording(sessionId);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.onend = null;
                recognitionRef.current.abort();
            }
        };
    }, [finalizeCurrentRecording, isListeningPromptText, speakText, submitVoiceAnswer]);

    const safeStart = useCallback(() => {
        if (!recognitionRef.current || isStartingRef.current || isListeningRef.current) return;

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        const nextSessionId = ++recognitionSessionRef.current;
        activeFlowIdRef.current += 1;
        activeSubmitIdRef.current = activeFlowIdRef.current;
        transcriptRef.current = '';
        finalTranscriptRef.current = '';
        interimTranscriptRef.current = '';
        (recognitionRef.current as SpeechRecognitionRuntime)._sessionId = nextSessionId;

        try {
            isStartingRef.current = true;
            recognitionRef.current.start();
        } catch {
            isStartingRef.current = false;
            toast.error('Gagal memulai rekaman, coba klik kanan lagi.');
        }
    }, []);

    const stopListening = useCallback((resetToIdle = true) => {
        isStartingRef.current = false;
        isListeningRef.current = false;
        isSubmittingRef.current = false;
        lastSubmittedTranscriptRef.current = '';

        if (responseRevealTimeoutRef.current) {
            clearTimeout(responseRevealTimeoutRef.current);
            responseRevealTimeoutRef.current = null;
        }
        if (reasoningTimeoutRef.current) {
            clearTimeout(reasoningTimeoutRef.current);
            reasoningTimeoutRef.current = null;
        }

        if (recognitionRef.current) {
            try {
                if (resetToIdle) {
                    transcriptRef.current = '';
                    finalTranscriptRef.current = '';
                    interimTranscriptRef.current = '';
                    activeSubmitIdRef.current += 1;
                }
                recognitionRef.current.stop();
            } catch {
                // ignore stop errors from rapid repeated toggles
            }
        }

        setIsListening(false);
        setIsReasoning(false);
        if (resetToIdle) {
            setPhase('idle');
            setSpeechText(INITIAL_SPEECH_TEXT);
            setTranscript('');
            setDisplayedText('');
        }
    }, []);

    const toggleListening = useCallback(() => {
        if (!recognitionRef.current) return;

        if (isListening || isListeningRef.current || isStartingRef.current) {
            stopListening(false);
            return;
        }

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        lastAutoSpokenTextRef.current = '';
        transcriptRef.current = '';
        finalTranscriptRef.current = '';
        interimTranscriptRef.current = '';
        isSubmittingRef.current = false;
        lastSubmittedTranscriptRef.current = '';
        speechCaptureCooldownRef.current = Date.now() + 2200;
        setIsReasoning(false);
        setPhase('listening');
        setTranscript('');
        setSpeechText('');
        safeStart();
    }, [isListening, safeStart, stopListening]);

    const handleGlobalClick = useCallback(() => {
        const currentMessage = transcript.trim() || speechText.trim() || INITIAL_SPEECH_TEXT;
        if (!currentMessage) return;

        if (isReasoning) {
            return;
        }

        speakText(currentMessage);
    }, [isReasoning, speakText, speechText, transcript]);

    const handleGlobalContextMenu = useCallback(
        (event: React.MouseEvent) => {
            event.preventDefault();
            toggleListening();
        },
        [toggleListening],
    );

    return {
        isListening,
        isReasoning,
        speechText,
        transcript,
        displayedText,
        statusColorClass,
        handleGlobalClick,
        handleGlobalContextMenu,
    };
}
