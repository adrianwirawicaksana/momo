"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

import {
    getFriendlyErrorMessage,
    registerUser,
    validateRegisterForm,
    type RegisterPayload,
} from '../_lib/register';

interface Cat {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    angle: number;
    angularVelocity: number;
}

export default function RegisterForm() {
    const router = useRouter();
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
                const x = Math.random() * (canvas.width - CAT_SIZE);
                const y = Math.random() * (canvas.height - CAT_SIZE);
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

        let animationFrameId = 0;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < cats.length; i += 1) {
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

            for (let i = 0; i < cats.length; i += 1) {
                for (let j = i + 1; j < cats.length; j += 1) {
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
                        const p = (2 * (nx * kx + ny * ky)) / 2;

                        c1.vx -= p * nx;
                        c1.vy -= p * ny;
                        c2.vx += p * nx;
                        c2.vy += p * ny;

                        c1.angularVelocity *= -1;
                        c2.angularVelocity *= -1;
                    }
                }
            }

            cats.forEach((cat) => {
                if (!catImage.complete) return;

                ctx.save();
                ctx.translate(cat.x, cat.y);
                ctx.rotate(cat.angle);
                ctx.globalAlpha = 0.75;
                ctx.drawImage(catImage, -cat.radius, -cat.radius, CAT_SIZE, CAT_SIZE);
                ctx.restore();
            });

            animationFrameId = window.requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationMessage = validateRegisterForm({ password, confirmPassword });
        if (validationMessage) {
            toast.error(validationMessage);
            return;
        }

        setIsLoading(true);

        // Mengirim payload dengan format confirm_password (snake_case)
        const payload = {
            nama,
            email,
            password,
            confirm_password: confirmPassword,
        };

        try {
            const { response, data } = await registerUser(payload as unknown as RegisterPayload);

            if (!response.ok) {
                // Penanganan khusus jika akun terbuat namun Resend gagal kirim email
                const rawErrorMsg = typeof data?.error === 'string' ? data.error : '';
                if (rawErrorMsg.includes('gagal mengirim email verifikasi')) {
                    toast.success('Akun berhasil dibuat! Mengalihkan ke login...', { duration: 4000 });
                    setTimeout(() => {
                        router.push('/login');
                    }, 2000);
                    return;
                }

                toast.error(getFriendlyErrorMessage(data, response.status));
                return;
            }

            toast.success('Pendaftaran berhasil! Mengalihkan ke halaman login...');

            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error: unknown) {
            toast.error(getFriendlyErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="bg-linear-to-tl from-gray-900 to-gray-800 min-h-screen w-full flex justify-center items-center md:p-4 relative overflow-hidden">
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

            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

            <div className="w-full min-h-screen md:min-h-0 md:max-w-xl bg-linear-to-tl from-gray-800/90 to-gray-700/90 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-center rounded-none md:rounded-2xl md:shadow-2xl md:border md:border-gray-700 relative z-10">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-white tracking-wide font-[family-name:var(--font-poppins)]">Buat Akun Baru</h1>
                    <p className="text-base text-gray-400 mt-1">Daftar untuk mulai menggunakan MoMo</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-base font-medium text-gray-300 mb-1.5">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                required
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                placeholder="Nama Anda"
                                disabled={isLoading}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-900/60 border border-gray-700 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                            />
                        </div>

                        <div>
                            <label className="block text-base font-medium text-gray-300 mb-1.5">
                                Alamat Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="guru@gmail.com"
                                disabled={isLoading}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-900/60 border border-gray-700 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                            />
                        </div>

                        <div>
                            <label className="block text-base font-medium text-gray-300 mb-1.5">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-900/60 border border-gray-700 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-base font-medium text-gray-300 mb-1.5">
                                Konfirmasi Kata Sandi
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-900/60 border border-gray-700 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center pt-2">
                        <input
                            id="terms"
                            type="checkbox"
                            required
                            disabled={isLoading}
                            className="h-4 w-4 rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-500 accent-blue-600"
                        />
                        <label htmlFor="terms" className="ml-2 block text-base text-gray-400">
                            Saya menyetujui <a href="#" className="text-blue-400 hover:underline">Syarat & Ketentuan</a>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 text-base font-[family-name:var(--font-poppins)] bg-linear-to-t from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Memproses...
                            </span>
                        ) : (
                            'Daftar'
                        )}
                    </button>
                </form>

                <p className="text-center text-base text-gray-400 mt-5">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Masuk di sini
                    </Link>
                </p>
            </div>
        </main>
    );
}