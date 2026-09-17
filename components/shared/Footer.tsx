import Image from "next/image";
import Link from "next/link";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-gray-800 border-t-2 border-gray-900 text-gray-300 py-6 px-4 sm:px-8 z-40 relative print:hidden">
            <div className="max-w-5xl lg:max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">

                {/* --- KIRI: COPYRIGHT MOMO APP --- */}
                <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-bold text-gray-300">
                        © {currentYear} <span className="text-blue-400 font-extrabold font-[family-name:var(--font-fredoka)] tracking-wide">MoMo App</span>. All rights reserved.
                    </span>
                </div>

                {/* --- KANAN: CREDIT TIM & LOGO STEKOM --- */}
                <div className="flex items-center justify-center flex-wrap gap-2.5 sm:gap-3 bg-gray-900/60 px-5 py-2.5 rounded-2xl border border-gray-700/60 shadow-inner">
                    <span className="text-sm sm:text-base text-gray-400">
                        Dibuat oleh Tim <span className="font-extrabold text-white">import we as intern:</span>
                    </span>
                    <Link
                        href="https://stekom.ac.id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <Image
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Logo_universitas_stekom.png/1280px-Logo_universitas_stekom.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20230125060018"
                            alt="STEKOM University Logo"
                            width={36}
                            height={36}
                            className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow"
                        />
                        <span className="text-sm sm:text-base font-extrabold text-blue-400 uppercase tracking-wide font-[family-name:var(--font-fredoka)]">
                            STEKOM University
                        </span>
                    </Link>
                </div>

            </div>
        </footer>
    );
};

export default Footer;