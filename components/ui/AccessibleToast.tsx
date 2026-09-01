'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

type ToastType = 'success' | 'info' | 'error';

interface AccessibleToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
    audioUrl?: string;
    typingSpeed?: number;
}

export default function AccessibleToast({
    message,
    type = 'info',
    duration = 5000,
    onClose,
    audioUrl,
    typingSpeed = 35,
}: AccessibleToastProps) {
    const [isExiting, setIsExiting] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 1. Logika Mengetik Karakter demi Karakter dengan Aman
    useEffect(() => {
        setDisplayedText('');
        setIsTyping(true);
        let index = 0;

        const timer = setInterval(() => {
            if (index < message.length) {
                setDisplayedText(message.slice(0, index + 1));
                index++;
            } else {
                setIsTyping(false);
                clearInterval(timer);
            }
        }, typingSpeed);

        return () => clearInterval(timer);
    }, [message, typingSpeed]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    useEffect(() => {
        if (audioUrl && audioRef.current) {
            audioRef.current.play().catch(() => { });
        }

        if (duration > 0 && !isTyping) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, audioUrl, isTyping]);

    const config = {
        success: {
            bgColor: 'bg-emerald-600',
            textColor: 'text-white',
            borderColor: 'border-emerald-700',
            audioUrl: '/audio/success.mp3',
        },
        error: {
            bgColor: 'bg-red-600',
            textColor: 'text-white',
            borderColor: 'border-red-700',
            audioUrl: '/audio/error.mp3',
        },
        info: {
            bgColor: 'bg-blue-600',
            textColor: 'text-white',
            borderColor: 'border-blue-700',
            audioUrl: '/audio/info.mp3',
        },
    };

    const currentConfig = config[type];
    const finalAudioUrl = audioUrl || currentConfig.audioUrl;

    return (
        <div
            role="alert"
            aria-live="assertive"
            lang="id"
            className={`
        notranslate fixed bottom-0 left-0 right-0 z-50
        w-full w-screen
        flex items-center justify-between gap-4 px-4 py-3.5 sm:px-8 sm:py-5 lg:px-12 lg:py-6
        shadow-2xl border-t-4 sm:border-t-[6px]
        font-semibold
        font-[family-name:var(--font-fredoka)]
        ${currentConfig.bgColor} ${currentConfig.textColor} ${currentConfig.borderColor}
        ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}
      `}
        >
            <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3.5 sm:gap-5 flex-grow">
                    {/* Logo Icon Responsif */}
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 shrink-0 flex items-center justify-center">
                        <Image
                            src="/icons/Logo.svg"
                            alt="Logo"
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Teks Pesan - Responsif All Device */}
                    <p className="flex-grow leading-snug min-h-[1.5em] flex items-center whitespace-pre-line text-base sm:text-xl lg:text-2xl tracking-wide">
                        <span>{displayedText}</span>
                        {isTyping && (
                            <span className="inline-block w-2 sm:w-2.5 lg:w-3 h-4 sm:h-6 lg:h-7 ml-1 bg-white animate-pulse" />
                        )}
                    </p>
                </div>

                {/* Tombol Tutup Silang Responsif */}
                <button
                    onClick={handleClose}
                    aria-label="Tutup pesan"
                    className="
            p-1.5 sm:p-2.5 rounded-full shrink-0
            hover:bg-black/15 active:bg-black/25
            transition-colors duration-150 ease-in-out
          "
                >
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8 fill-current" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>

            {finalAudioUrl && <audio ref={audioRef} src={finalAudioUrl} preload="auto" />}
        </div>
    );
}