'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import AccessibleToast from '@/components/ui/AccessibleToast';
import ShiningButton from "@/components/ui/ShiningButton";
import TypewriterText from "@/components/ui/TypewriterText";

export default function Home() {
  const [showToast, setShowToast] = useState(true);
  const [toastConfig] = useState({
    message: 'Klik di mana saja atau tekan tombol untuk mulai suara...',
    type: 'info' as 'success' | 'error' | 'info'
  });

  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Siapkan audio tanpa menjalankannya saat halaman baru dimuat.
  useEffect(() => {
    const audio = new Audio("/audio/Halo.mp3");
    audio.volume = 1.0;
    audioRef.current = audio;
  }, []);

  // Handler Interaksi Pertama
  const handleUserInteraction = () => {
    if (hasInteracted) return;

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => {
        setShowToast(false);
        setHasInteracted(true);
      }).catch((err) => {
        console.log("Audio playback failed:", err);
      });
    }
  };

  return (
    <div
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
      onPointerDown={handleUserInteraction}
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
            speakOnChange
            onClose={() => setShowToast(false)}
          />
        )}

      </main>
    </div>
  );
}