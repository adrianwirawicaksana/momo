"use client";
import { useState, useEffect, useRef } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';

interface Cat {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number; // Menggunakan radius lingkaran untuk deteksi tabrakan
    angle: number;
    angularVelocity: number;
}

export default function Page() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
        const CAT_SIZE = 80; // Ukuran disamakan semua (60px)
        const CAT_RADIUS = CAT_SIZE / 2;
        const cats: Cat[] = [];

        catImage.onload = () => {
            for (let i = 0; i < catsCount; i++) {
                // Posisi acak agar tidak bertumpukan di awal
                let x = Math.random() * (canvas.width - CAT_SIZE);
                let y = Math.random() * (canvas.height - CAT_SIZE);

                // Kecepatan gerak acak (-1.5 s/d 1.5)
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

                // Memantul dari Pinggir Layar
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

            // 2. Deteksi Tabrakan Antar Kucing (Elastic Collision 2D)
            for (let i = 0; i < cats.length; i++) {
                for (let j = i + 1; j < cats.length; j++) {
                    const c1 = cats[i];
                    const c2 = cats[j];

                    const dx = c2.x - c1.x;
                    const dy = c2.y - c1.y;
                    const distance = Math.hypot(dx, dy);
                    const minDistance = c1.radius + c2.radius;

                    // Jika saling bertabrakan
                    if (distance < minDistance) {
                        // Vektor normal (arah tabrakan)
                        const nx = dx / distance;
                        const ny = dy / distance;

                        // Pisahkan posisi agar tidak menempel/tumpang tindih
                        const overlap = minDistance - distance;
                        c1.x -= nx * (overlap / 2);
                        c1.y -= ny * (overlap / 2);
                        c2.x += nx * (overlap / 2);
                        c2.y += ny * (overlap / 2);

                        // Kecepatan relatif
                        const kx = c1.vx - c2.vx;
                        const ky = c1.vy - c2.vy;
                        const p = 2 * (nx * kx + ny * ky) / 2; // Karena massa disamakan (1:1)

                        // Tukar momentum/kecepatan (efek mental)
                        c1.vx -= p * nx;
                        c1.vy -= p * ny;
                        c2.vx += p * nx;
                        c2.vy += p * ny;

                        // Balik arah putaran rotasi saat saling bertabrakan
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
                    ctx.globalAlpha = 0.75; // Transparansi opacity

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
        console.log({ email, password });
    };

    return (
        <main className="bg-linear-to-tl from-gray-900 to-gray-800 min-h-screen w-full flex justify-center items-center md:p-4 relative overflow-hidden">

            {/* Navbar Transparan di Paling Atas */}
            <nav className="hidden md:flex absolute top-0 left-0 w-full z-20 items-center justify-between px-12 py-8 bg-transparent">
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
                            className="w-full px-4 py-3 rounded-lg bg-gray-900/60 border border-gray-700 text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Input Password */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-base font-medium text-gray-300">
                                Kata Sandi
                            </label>
                            <a href="#" className="text-base text-blue-400 hover:text-blue-300 transition-colors">
                                Lupa kata sandi?
                            </a>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg bg-gray-900/60 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
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
                        className="w-full py-3 px-4 text-lg font-[family-name:var(--font-poppins)] bg-linear-to-t from-blue-600 to-blue-500 text-white font-medium rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all cursor-pointer"
                    >
                        Masuk
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