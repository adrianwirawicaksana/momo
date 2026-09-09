"use client";

import { useState } from "react";
import Image from "next/image";

const MainBox = () => {
    // State loading untuk masing-masing video
    const [isVideo1Loading, setIsVideo1Loading] = useState(true);
    const [isVideo2Loading, setIsVideo2Loading] = useState(true);

    return (
        <main className="min-h-screen w-full bg-[linear-gradient(35deg,#2563eb_0%,#1f2937_60%)] text-white flex flex-col items-center justify-center overflow-x-hidden relative select-none p-4 sm:p-8 py-12 lg:py-20 gap-16 lg:gap-24">

            {/* --- BOX 1: NAVIGASI GURU --- */}
            <div className="w-full flex items-center justify-center">
                <div className="w-full max-w-7xl bg-linear-to-t from-purple-600/20 to-purple-500/20 backdrop-blur-lg border-2 border-purple-700/60 rounded-[2.5rem] lg:rounded-[6rem] p-6 sm:p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 shadow-2xl relative">

                    {/* Light Glow Effect (Kiri Atas) */}
                    <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] lg:rounded-[6rem] pointer-events-none">
                        <div className="absolute -top-16 -left-16 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
                    </div>

                    {/* Kiri: Video Container */}
                    <div className="w-full lg:flex-[3_3_0%] min-w-0 aspect-video rounded-2xl lg:rounded-3xl overflow-hidden bg-black/60 border-2 border-purple-700 relative shrink-0 shadow-lg z-20">

                        {/* SKELETON ANIMATION (Box 1) */}
                        {isVideo1Loading && (
                            <div className="absolute inset-0 z-30 bg-purple-950/60 animate-pulse flex items-center justify-center">
                                <div className="w-full h-full bg-linear-to-r from-transparent via-purple-500/10 to-transparent animate-[shimmer_2s_infinite]" />
                                {/* Icon Play kecil di tengah skeleton sebagai indikator visual */}
                                <svg
                                    className="w-12 h-12 text-purple-400/40 animate-bounce absolute"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        )}

                        <video
                            className={`w-full h-full object-cover pointer-events-none transition-opacity duration-500 ${isVideo1Loading ? "opacity-0" : "opacity-100"
                                }`}
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster="/images/video-thumbnail.png"
                            onLoadedData={() => setIsVideo1Loading(false)}
                        >
                            <source src="/video/teacher.mp4" type="video/mp4" />
                            Browser Anda tidak mendukung pemutar video.
                        </video>
                    </div>

                    {/* Kanan: Deskripsi Teks */}
                    <div className="w-full lg:flex-[2_2_0%] min-w-0 flex flex-col gap-3 sm:gap-4 text-center lg:text-left px-2 sm:px-6 lg:pr-8 z-10 pb-6 lg:pb-0">
                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-[family-name:var(--font-poppins)] uppercase">
                            Navigasi Guru
                        </h2>
                        <p className="text-sm sm:text-xl lg:text-2xl text-gray-200 font-medium leading-relaxed sm:leading-normal">
                            AI Momo membantu guru membuat kelas, menyusun materi, merancang soal dan kunci jawaban, serta memantau dan mengelola progress siswa secara otomatis.
                        </p>
                    </div>

                    {/* Gambar Icon Kucing 1 */}
                    <div className="absolute -bottom-3 -right-3 sm:-bottom-6 sm:-right-6 lg:-bottom-8 lg:-right-8 z-50">
                        <Image
                            src="/icons/Teacher-Cat.svg"
                            alt="Icon Navigasi Guru"
                            width={150}
                            height={150}
                            className="w-16 h-16 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 object-contain drop-shadow-xl pointer-events-none"
                        />
                    </div>

                </div>
            </div>

            {/* --- BOX 2: CARA BELAJAR SISWA --- */}
            <div className="w-full flex items-center justify-center">
                <div className="w-full max-w-7xl bg-linear-to-t from-purple-600/20 to-purple-500/20 backdrop-blur-lg border-2 border-purple-700/60 rounded-[2.5rem] lg:rounded-[6rem] p-6 sm:p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 shadow-2xl relative">

                    {/* Light Glow Effect (Kiri Atas) */}
                    <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] lg:rounded-[6rem] pointer-events-none">
                        <div className="absolute -top-16 -left-16 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
                    </div>

                    {/* Kiri: Video Container */}
                    <div className="w-full lg:flex-[3_3_0%] min-w-0 aspect-video rounded-2xl lg:rounded-3xl overflow-hidden bg-black/60 border-2 border-purple-700 relative shrink-0 shadow-lg z-20">

                        {/* SKELETON ANIMATION (Box 2) */}
                        {isVideo2Loading && (
                            <div className="absolute inset-0 z-30 bg-purple-950/60 animate-pulse flex items-center justify-center">
                                <div className="w-full h-full bg-linear-to-r from-transparent via-purple-500/10 to-transparent animate-[shimmer_2s_infinite]" />
                                <svg
                                    className="w-12 h-12 text-purple-400/40 animate-bounce absolute"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        )}

                        <video
                            className={`w-full h-full object-cover pointer-events-none transition-opacity duration-500 ${isVideo2Loading ? "opacity-0" : "opacity-100"
                                }`}
                            autoPlay
                            loop
                            muted
                            playsInline
                            poster="/images/video-thumbnail.png"
                            onLoadedData={() => setIsVideo2Loading(false)}
                        >
                            <source src="/video/kid.mp4" type="video/mp4" />
                            Browser Anda tidak mendukung pemutar video.
                        </video>
                    </div>

                    {/* Kanan: Deskripsi Teks */}
                    <div className="w-full lg:flex-[2_2_0%] min-w-0 flex flex-col gap-3 sm:gap-4 text-center lg:text-left px-2 sm:px-6 lg:pr-8 z-10 pb-6 lg:pb-0">
                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-[family-name:var(--font-poppins)] uppercase">
                            Cara Belajar Siswa
                        </h2>
                        <p className="text-sm sm:text-xl lg:text-2xl text-gray-200 font-medium leading-relaxed sm:leading-normal">
                            Siswa cukup berbicara langsung untuk berinteraksi; AI Momo akan merespons dengan membacakan materi, memandu soal latihan, dan memberikan umpan balik secara interaktif tanpa perlu mengetik atau melihat layar.
                        </p>
                    </div>

                    {/* Gambar Icon Kucing 2 */}
                    <div className="absolute -bottom-3 -right-3 sm:-bottom-6 sm:-right-6 lg:-bottom-8 lg:-right-8 z-50">
                        <Image
                            src="/icons/Sitting-Cat.svg"
                            alt="Icon Cara Belajar Siswa"
                            width={150}
                            height={150}
                            className="w-16 h-16 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 object-contain drop-shadow-xl pointer-events-none"
                        />
                    </div>

                </div>
            </div>

        </main>
    );
};

export default MainBox;