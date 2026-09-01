"use client";
import { useState, useEffect, useRef } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';

interface Cat {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    angle: number;
    angularVelocity: number;
}

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Kata sandi tidak cocok!');
            return;
        }
        console.log({ name, email, password });
    };

    return (
        <main className="bg-linear-to-tl from-gray-900 to-gray-800 min-h-screen w-full flex justify-center items-center md:p-4 relative overflow-hidden">

            {/* Navbar Transparan di Paling Atas */}
            <nav className="hidden md:flex absolute top-0 left-0 w-full z-20 items-center justify-between px-6 md:px-12 py-8 bg-transparent">
                <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
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

            {/* Form Register Card - Melebarkan max-w menjadi 2xl untuk Horizontal Grid */}
            <div className="w-full min-h-screen md:min-h-0 md:max-w-xl bg-linear-to-tl from-gray-800/90 to-gray-700/90 backdrop-blur-md p-6 sm:p-8 flex flex-col justify-center rounded-none md:rounded-2xl md:shadow-2xl md:border md:border-gray-700 relative z-10">

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-white tracking-wide font-[family-name:var(--font-poppins)]">Buat Akun Baru</h1>
                    <p className="text-base md:text-base text-gray-400 mt-1">Daftar untuk mulai menggunakan MoMo</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Grid Horizontal 2 Kolom untuk Desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Input Nama Lengkap */}
                        <div>
                            <label className="block text-base font-medium text-gray-300 mb-1.5">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nama Anda"
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-900/60 border border-gray-700 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Input Email */}
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
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-900/60 border border-gray-700 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Input Password */}
                        <div>
                            <label className="block text-base font-medium text-gray-300 mb-1.5">
                                Kata Sandi
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-900/60 border border-gray-700 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Input Konfirmasi Password */}
                        <div>
                            <label className="block text-base font-medium text-gray-300 mb-1.5">
                                Konfirmasi Kata Sandi
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-900/60 border border-gray-700 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Checkbox Syarat & Ketentuan */}
                    <div className="flex items-center pt-2">
                        <input
                            id="terms"
                            type="checkbox"
                            required
                            className="h-4 w-4 rounded bg-gray-900 border-gray-700 text-blue-600 focus:ring-blue-500 accent-blue-600"
                        />
                        <label htmlFor="terms" className="ml-2 block text-base text-gray-400">
                            Saya menyetujui <a href="#" className="text-blue-400 hover:underline">Syarat & Ketentuan</a>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-3 px-4 text-base font-[family-name:var(--font-poppins)] bg-linear-to-t from-blue-600 to-blue-500 text-white font-medium rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all cursor-pointer mt-2"
                    >
                        Daftar
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-base text-gray-400 mt-5">
                    Sudah punya akun?{' '}
                    <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Masuk di sini
                    </a>
                </p>

            </div>
        </main>
    );
}