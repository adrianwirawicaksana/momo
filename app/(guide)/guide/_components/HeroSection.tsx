import Image from "next/image";
import TypewriterText from "@/components/ui/TypewriterText";

const HeroSection = () => {
    return (
        <main className="min-h-[calc(100dvh-5rem)] bg-[linear-gradient(-35deg,#2563eb_0%,#1f2937_60%)] w-full">
            <div className="min-h-[calc(100dvh-5rem)] w-full max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-16 px-5 sm:px-8 py-8 sm:py-12 overflow-x-hidden">
                {/* Section Kiri: Teks & Informasi */}
                <section className="w-full lg:flex-1 min-w-0 flex flex-col gap-6 text-center lg:text-left items-center lg:items-start justify-center">
                    <h1 className="w-full max-w-full break-words font-[family-name:var(--font-poppins)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase font-bold min-h-[2.5em] sm:min-h-[2.2em]">
                        <TypewriterText text="Panduan & cara penggunaan Aplikasi MoMo" speed={40} />
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-2xl">
                        Setiap tombol, menu, dan teks materi akan dibacakan secara otomatis dengan responsif, tanpa perlu bergantung pada tampilan visual.
                    </p>
                </section>

                {/* Section Kanan: Gambar Banner Melayang */}
                <section className="w-full lg:flex-1 min-w-0 flex items-center justify-center animate-float">
                    <Image
                        src="/images/Banner-Panduan.png"
                        alt="Guide Banner Image"
                        height={550}
                        width={550}
                        className="h-auto w-[clamp(14rem,50vw,28rem)] max-w-full lg:w-full max-h-[30vh] sm:max-h-[40vh] lg:max-h-[60vh] object-contain drop-shadow-xl pointer-events-none"
                        priority
                    />
                </section>

            </div>
        </main>
    )
}

export default HeroSection
