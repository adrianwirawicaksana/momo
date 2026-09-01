import Link from "next/link";
import { ReactNode } from "react";

interface ShiningButtonProps {
    href: string;
    children: ReactNode;
    variant?: "blue" | "yellow";
    className?: string;
}

export default function ShiningButton({
    href,
    children,
    variant = "blue",
    className = "",
}: ShiningButtonProps) {
    const variantStyles = {
        blue: "bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 border-blue-950 shadow-[0_5px_0_0_#1e3a8a] text-white",
        yellow: "bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-500 border-amber-950 shadow-[0_5px_0_0_#78350f] text-gray-900",
    };

    return (
        <Link
            href={href}
            className={`
        relative uppercase w-full text-center overflow-hidden
        font-black text-base sm:text-lg rounded-2xl border-2 sm:border-[3px] 
        font-[family-name:var(--font-fredoka)] tracking-wider inline-block
        
        /* Efek Tekan Tombol Game */
        active:translate-y-1 active:shadow-none transition-all duration-100 ease-in-out
        
        ${variantStyles[variant]}
        ${className}
      `}
        >
            {/* Highlight Dalam (Efek Kaca/3D Atas khas Game) */}
            <span className="absolute top-0 left-0 w-full h-[35%] bg-white/25 pointer-events-none rounded-t-xl" />

            {/* Efek Cahaya Mengkilat (Shine Loop) */}
            <span
                className="
          absolute top-0 -left-[100%] w-full h-full
          bg-gradient-to-r from-transparent via-white/40 to-transparent
          skew-x-[-25deg]
          animate-[shine_3s_infinite_ease-in-out]
          pointer-events-none z-10
        "
            />

            <span className="relative z-20 drop-shadow-[0_2px_0_rgba(0,0,0,0.3)]">{children}</span>
        </Link>
    );
}