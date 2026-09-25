'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AccessibleToast from '@/components/ui/AccessibleToast';
import ShiningButton from "@/components/ui/ShiningButton";
import TypewriterText from "@/components/ui/TypewriterText";

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = ArrayLike<SpeechRecognitionAlternativeLike>;

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const INTRO_TEXT = 'Klik kanan dan bicara ke momo, aku siap belajar untuk lanjut.';
const INSTRUCTION_TEXT = 'Klik kiri untuk mendengar. Klik kanan untuk berbicara.';
const REDIRECT_PHRASE = 'aku siap belajar';

export default function Home() {
  const router = useRouter();
  const [showToast, setShowToast] = useState(true);
  const [toastConfig, setToastConfig] = useState({
    message: INSTRUCTION_TEXT,
    type: 'info' as 'success' | 'error' | 'info'
  });

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const sanitized = text?.trim();
    if (!sanitized) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sanitized);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((voice) => /google/i.test(voice.name) && /id|indonesia/i.test(voice.lang));

    utterance.lang = 'id-ID';
    utterance.rate = 1;
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const startRecording = () => {
    if (typeof window === 'undefined') return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const SpeechRecognition =
      (window as typeof window & {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      }).SpeechRecognition ||
      (window as typeof window & {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      }).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'id-ID';

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        const transcript = Array.from(event.results)
          .flatMap((result) => Array.from(result).map((alternative) => alternative.transcript.trim()))
          .join(' ')
          .trim();

        if (!transcript) return;

        const normalizedTranscript = transcript.toLowerCase();
        if (normalizedTranscript.includes(REDIRECT_PHRASE)) {
          recognition.stop();
          router.push('/study');
          return;
        }

        // Rekaman suara tetap diproses tanpa menampilkan transcript di UI.
      };

      recognition.onend = () => {
        setToastConfig({
          message: INSTRUCTION_TEXT,
          type: 'info'
        });
      };

      recognitionRef.current = recognition;
    }

    setToastConfig({ message: 'Sedang mendengarkan…', type: 'info' });
    speakText('Sedang mendengarkan');
    recognitionRef.current.start();
  };

  const handleLeftClick = () => {
    speakText(INTRO_TEXT);
  };

  const handleRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    startRecording();
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      speakText(INSTRUCTION_TEXT);
    }, 400);

    return () => {
      window.clearTimeout(timer);
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div
      onClick={handleLeftClick}
      onContextMenu={handleRightClick}
      onTouchStart={handleLeftClick}
      className="bg-[linear-gradient(35deg,#2563eb_0%,#1f2937_60%)] min-h-[calc(100dvh-5rem)] w-full text-white flex items-center justify-center overflow-x-hidden relative select-none"
    >
      <main className="max-w-5xl lg:max-w-6xl w-full mx-auto flex flex-col lg:flex-row items-center justify-center gap-6 md:gap-10 lg:gap-16 px-6 sm:px-8 py-6">

        {/* Section Kiri: Gambar Banner */}
        <section className="w-full lg:w-1/2 flex items-center justify-center animate-float">
          <Image
            src="/images/Banner.png"
            alt="Logo Icon"
            height={550}
            width={550}
            className="h-auto w-[clamp(15rem,65vw,26rem)] lg:w-full max-h-[38vh] sm:max-h-[45vh] lg:max-h-[65vh] object-contain drop-shadow-lg pointer-events-none"
            priority
          />
        </section>

        {/* Section Kanan: Judul & Tombol Aksi */}
        <section className="w-full lg:w-1/2 max-w-md flex flex-col items-center lg:items-start text-center lg:text-left gap-6 sm:gap-8">

          {/* Judul menggunakan Komponen TypewriterText */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.6rem] font-bold leading-[1.25] tracking-wide font-[family-name:var(--font-fredoka)] text-white min-h-[3em] sm:min-h-[2.5em]">
            <TypewriterText
              text="Membuka akses belajar tanpa batas untuk penyandang tunanetra!"
              speed={40}
            />
          </h1>

          {/* Group Tombol Aksi */}
          <div className="w-full flex flex-col gap-3.5">
            <ShiningButton className="py-3.5 sm:py-4 px-6" href="/study" variant="blue">
              Mulai Belajar
            </ShiningButton>

            <ShiningButton className="py-3.5 sm:py-4 px-6" href="/login" variant="yellow">
              Saya seorang Guru
            </ShiningButton>
          </div>
        </section>

        {/* Toast Instruksi Awal */}
        {showToast && (
          <AccessibleToast
            message={toastConfig.message}
            type={toastConfig.type}
            duration={0}
            speakOnChange={false}
            onClose={() => setShowToast(false)}
          />
        )}

      </main>
    </div>
  );
}