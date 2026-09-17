"use client";

import { useState, useEffect, useRef } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react'; // Import ikon mata

interface Cat {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    angle: number;
    angularVelocity: number;
}

export default function Page() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State untuk Show/Hide Password
    const [isLoading, setIsLoading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const setAuthCookie = (name: string, value: string) => {
        const secure = window.location.protocol === 'https:' ? '; secure' : '';
        document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=604800; sameSite=lax${secure}`;
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirect');

        if (document.cookie.split('; ').some((cookie) => cookie.startsWith('auth_token='))) {
            router.replace(redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard');
        }
    }, [router]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const catImage = new Image();
        catImage.src = '/icons/Cute-Cat.png';

        const catsCount = 10;
        const CAT_SIZE = 80;
        const CAT_RADIUS = CAT_SIZE / 2;
        const cats: Cat[] = [];

        catImage.onload = () => {
            for (let i = 0; i < catsCount; i++) {
                let x = Math.random() * (canvas.width - CAT_SIZE);
                let y = Math.random() * (canvas.height - CAT_SIZE);

                const vx = (Math.random() - 0.5) * 3;
                const vy = (Math.random() - 0.5) * 3;

                cats.push({
                    x: x + CAT_RADIUS,
                    y: y + CAT_RADIUS,
                    vx: vx === 0 ? 1 : vx,
                    vy: vy === 0 ? 1 : vy,
                    radius: CAT_RADIUS,
                    angle: Math.random() * Math.PI * 2,
                    angularVelocity: (Math.random() - 0.5) * 0.02,
                });
            }
        };

        let animationFrameId: number;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Update Posisi & Rotasi
            for (let i = 0; i < cats.length; i++) {
                const cat = cats[i];
                cat.x += cat.vx;
                cat.y += cat.vy;
                cat.angle += cat.angularVelocity;

                if (cat.x - cat.radius <= 0) {
                    cat.x = cat.radius;
                    cat.vx *= -1;
                } else if (cat.x + cat.radius >= canvas.width) {
                    cat.x = canvas.width - cat.radius;
                    cat.vx *= -1;
                }

                if (cat.y - cat.radius <= 0) {
                    cat.y = cat.radius;
                    cat.vy *= -1;
                } else if (cat.y + cat.radius >= canvas.height) {
                    cat.y = canvas.height - cat.radius;
                    cat.vy *= -1;
                }
            }

            // 2. Deteksi Tabrakan Antar Kucing
            for (let i = 0; i < cats.length; i++) {
                for (let j = i + 1; j < cats.length; j++) {
                    const c1 = cats[i];
                    const c2 = cats[j];

                    const dx = c2.x - c1.x;
                    const dy = c2.y - c1.y;
                    const distance = Math.hypot(dx, dy);
                    const minDistance = c1.radius + c2.radius;

                    if (distance < minDistance) {
                        const nx = dx / distance;
                        const ny = dy / distance;

                        const overlap = minDistance - distance;
                        c1.x -= nx * (overlap / 2);
                        c1.y -= ny * (overlap / 2);
                        c2.x += nx * (overlap / 2);
                        c2.y += ny * (overlap / 2);

                        const kx = c1.vx - c2.vx;
                        const ky = c1.vy - c2.vy;
                        const p = 2 * (nx * kx + ny * ky) / 2;

                        c1.vx -= p * nx;
                        c1.vy -= p * ny;
                        c2.vx += p * nx;
                        c2.vy += p * ny;

                        c1.angularVelocity *= -1;
                        c2.angularVelocity *= -1;
                    }
                }
            }

            // 3. Render Gambar ke Canvas
            cats.forEach((cat) => {
                if (catImage.complete) {
                    ctx.save();
                    ctx.translate(cat.x, cat.y);
                    ctx.rotate(cat.angle);
                    ctx.globalAlpha = 0.75;

                    ctx.drawImage(
                        catImage,
                        -cat.radius,
                        -cat.radius,
                        CAT_SIZE,
                        CAT_SIZE
                    );
                    ctx.restore();
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Handler Submit Form Login
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Email dan password wajib diisi!');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('https://momo-be-production.up.railway.app/api/v1/guru/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Gagal masuk. Periksa email dan kata sandi Anda.');
            }

            // Simpan Token JWT & Profil Guru ke LocalStorage + Cookie untuk middleware
            if (result.data?.token) {
                localStorage.setItem('auth_token', result.data.token);
                localStorage.setItem('guru_profile', JSON.stringify(result.data.guru ?? {}));
                setAuthCookie('auth_token', result.data.token);
                setAuthCookie('user_role', 'guru');

                if (result.data.guru) {
                    setAuthCookie('guru_profile', JSON.stringify(result.data.guru));
                }
            }

            toast.success(result.message || 'Login berhasil!');

            const params = new URLSearchParams(window.location.search);
            const redirectTo = params.get('redirect');
            window.location.replace(redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard');

        } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan pada server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="bg-linear-to-tl from-gray-900 to-gray-800 min-h-screen w-full flex justify-center items-center md:p-4 relative overflow-hidden">

            {/* Navbar Transparan */}
            <nav className="hidden md:flex absolute top-0 left-0 w-full z-20 items-center justify-between px-12 py-8 bg-transparent">
                <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity backdrop-blur-2xl rounded p-2 px-4">
                    <NextImage
                        src="/icons/Logo.svg"
                        alt="Logo Icon"
                        height={44}
                        width={44}
                        className="w-10 h-10 sm:w-11 sm:h-11 object-contain"
                    />
                    <span className="text-4xl font-bold text-white tracking-wide font-[family-name:var(--font-fredoka)]">
                        MoMo App
                    </span>
                </Link>
            </nav>

            {/* Canvas Latar Belakang Kucing */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none z-0"
            />

            {/* Form Login Card */}
            <div className="w-full min-h-screen md:min-h-0 md:max-w-md bg-linear-to-tl from-gray-800/90 to-gray-700/90 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-center rounded-none md:rounded-2xl md:shadow-2xl md:border md:border-gray-700 relative z-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white tracking-wide font-[family-name:var(--font-poppins)]">Selamat Datang!</h1>
                    <p className="text-base text-gray-400 mt-1">Silakan masuk ke akun Anda</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Input Email */}
                    <div>
                        <label className="block text-base font-medium text-gray-300 mb-2">
                            Alamat Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="guru@gmail.com"
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-lg bg-gray-900/60 border border-gray-700 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                        />
                    </div>

                    {/* Input Password + Toggle Show/Hide */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-base font-medium text-gray-300">
                                Kata Sandi
                            </label>
                            <a href="#" className="text-base text-blue-400 hover:text-blue-300 transition-colors">
                                Lupa kata sandi?
                            </a>
                        </div>
                        <div className="relative flex items-center">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={isLoading}
                                className="w-full pl-4 pr-12 py-3 rounded-lg bg-gray-900/60 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="plain-button absolute right-3.5 text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
                                title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center">
                        <input
                            id="remember"
                            type="checkbox"
                            className="h-4 w-4 rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-500 accent-blue-600"
                        />
                        <label htmlFor="remember" className="ml-2 block text-base text-gray-400">
                            Ingat saya
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="game-button game-button-blue w-full py-3 px-4 text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Memproses...</span>
                            </>
                        ) : (
                            'Masuk'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-base text-gray-400 mt-6">
                    Belum punya akun?{' '}
                    <a href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Daftar sekarang
                    </a>
                </p>

            </div>
        </main>
    );
}