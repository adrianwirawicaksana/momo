'use client';

import Image from 'next/image';

interface GlobalLoadingProps {
    label?: string;
}

export function GlobalLoading({ label = 'Memuat data...' }: GlobalLoadingProps) {
    return (
        <div className="fixed inset-0 z-100 flex min-h-screen items-center justify-center bg-slate-950/95 backdrop-blur-sm" role="status" aria-live="polite" aria-label={label}>
            <div className="flex flex-col items-center gap-5 text-center">
                <div className="relative flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44 lg:h-48 lg:w-48">
                    <div className="absolute h-24 w-24 animate-ping rounded-full bg-blue-400/20 [animation-duration:2s] sm:h-32 sm:w-32" />
                    <Image src="/icons/Sitting-Cat.svg" alt="MoMo sedang memproses" width={160} height={160} priority className="relative h-28 w-28 object-contain sm:h-36 sm:w-36 lg:h-40 lg:w-40" />
                </div>
                <p className="flex items-center justify-center font-(family-name:--font-poppins) text-base font-bold text-white">
                    {label.replace(/\.\.\.$/, '')}
                    <span className="ml-1 inline-flex gap-0.5" aria-hidden="true">
                        <span className="animate-bounce [animation-delay:0ms]">.</span>
                        <span className="animate-bounce [animation-delay:150ms]">.</span>
                        <span className="animate-bounce [animation-delay:300ms]">.</span>
                    </span>
                </p>
            </div>
        </div>
    );
}
