"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ShiningButton from "@/components/ui/ShiningButton";
import { LayoutDashboard, LogOut } from "lucide-react";
import toast from "react-hot-toast";

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [isTeacher, setIsTeacher] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        // Cek role pengguna dari localStorage (atau atur sesuai sistem simpan token/user kamu)
        const userRole = localStorage.getItem("user_role");
        if (userRole === "guru" || userRole === "teacher") {
            setIsTeacher(true);
        }
    }, [pathname]);

    // Handler untuk Logout khusus Guru
    const handleLogout = () => {
        localStorage.removeItem("user_role");
        localStorage.removeItem("token");
        setIsTeacher(false);
        toast.success("Berhasil keluar dari akun guru.");
        router.push("/login");
    };

    // Cek apakah di halaman /guide (hanya setelah mounted)
    const isGuidePage = isMounted && pathname === "/guide";

    // Route tujuan tombol untuk role default
    const buttonHref = isGuidePage ? "/study" : "/guide";

    return (
        <nav className="sticky top-0 w-full h-20 bg-gray-800 border-b-2 border-gray-900 z-50">
            <div className="h-full w-full max-w-5xl lg:max-w-6xl mx-auto flex min-w-0 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

                {/* Logo & Brand Name */}
                <Link href="/" className="flex min-w-0 shrink items-center gap-2.5 hover:opacity-90 transition-opacity">
                    <Image
                        src="/icons/Logo.svg"
                        alt="Logo Icon"
                        height={44}
                        width={44}
                        className="w-10 h-10 sm:w-11 sm:h-11 object-contain"
                        priority
                    />
                    <div className="flex items-center gap-2">
                        <span className="truncate text-3xl sm:text-4xl font-extrabold text-blue-400 font-[family-name:var(--font-fredoka)] tracking-wide">
                            MoMo
                        </span>
                        {/* Indicator khusus jika masuk sebagai Guru */}
                        {isMounted && isTeacher && (
                            <span className="hidden sm:inline-block bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                Guru
                            </span>
                        )}
                    </div>
                </Link>

                {/* Container Tombol Sisi Kanan */}
                <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                    {isMounted && isTeacher ? (
                        /* ================= MODIFIKASI KHUSUS ROLE GURU ================= */
                        <>
                            <ShiningButton
                                href="/dashboard-guru"
                                className="py-2 px-3 sm:px-4 font-extrabold uppercase"
                                variant="blue"
                            >
                                <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                                    <LayoutDashboard className="w-5 h-5 shrink-0" />
                                    <span>
                                        <span className="inline sm:hidden">Dashboard</span>
                                        <span className="hidden sm:inline">Dashboard Guru</span>
                                    </span>
                                </span>
                            </ShiningButton>

                            <button
                                onClick={handleLogout}
                                title="Keluar Akun"
                                className="p-2.5 rounded-xl bg-gray-700/80 hover:bg-red-600/20 border border-gray-600 hover:border-red-500/50 text-gray-300 hover:text-red-400 transition-all cursor-pointer flex items-center justify-center"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        /* ================= TAMPILAN DEFAULT (SISWA / UMUM) ================= */
                        <ShiningButton className="py-2 px-3 sm:px-4 font-extrabold uppercase" href={buttonHref} variant="blue">
                            <span className="flex items-center justify-center gap-1.5 sm:gap-2">

                                {isGuidePage ? (
                                    // --- ICON BUKU (Mulai Belajar) ---
                                    <svg
                                        className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M19 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                                            fill="#FFD700"
                                        />
                                        <path
                                            d="M17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17V3Z"
                                            fill="#FFE55C"
                                        />
                                        <path
                                            d="M7 3V21"
                                            stroke="#E6C200"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M10 8H14M10 12H14M10 16H12"
                                            stroke="#1F2937"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                ) : (
                                    // --- ICON LAMPU (Panduan) ---
                                    <svg
                                        className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2Z"
                                            fill="#FFD700"
                                        />
                                        <path
                                            d="M12 4C9.24 4 7 6.24 7 9C7 10.3 7.5 11.48 8.32 12.35C8.75 12.8 9 13.39 9 14V16H11V4.08C11.32 4.03 11.66 4 12 4Z"
                                            fill="#FFE55C"
                                        />
                                        <path
                                            d="M9 19H15V20C15 20.55 14.55 21 14 21H10C9.45 21 9 20.55 9 20V19Z"
                                            fill="#E0E0E0"
                                        />
                                        <path
                                            d="M10.5 21.5H13.5V22C13.5 22.28 13.28 22.5 13 22.5H11C10.72 22.5 10.5 22.28 10.5 22V21.5Z"
                                            fill="#9E9E9E"
                                        />
                                    </svg>
                                )}

                                {/* Responsive Text */}
                                {isGuidePage ? (
                                    <span>
                                        <span className="inline sm:hidden">Mulai</span>
                                        <span className="hidden sm:inline">Mulai Belajar</span>
                                    </span>
                                ) : (
                                    <span>Panduan</span>
                                )}

                            </span>
                        </ShiningButton>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;