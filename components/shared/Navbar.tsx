import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
    return (
        <nav className="fixed top-0 w-screen h-20 border-b-2 border-gray-200 z-50 text-gray-800">
            <div className="h-full w-full max-w-5xl mx-auto flex items-center justify-around">
                <div className="h-full w-full flex items-center justify-center lg:justify-start px-4 gap-2">
                    <Image src="/icons/Logo.svg" alt="Logo Icon" height={50} width={50} />
                    <h1 className="flex items-center justify-center h-24 text-4xl font-bold text-blue-500 font-[family-name:var(--font-fredoka)]">
                        momo
                    </h1>
                </div>
                <ul className="hidden lg:flex h-full w-full justify-end items-center gap-2 px-4">
                    <Link
                        href="/login"
                        className="p-2 px-6 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xl rounded-xl border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 font-[family-name:var(--font-nunito)] transition-all duration-100 ease-in-out inline-block"
                    >
                        login
                    </Link>
                </ul>
            </div>
        </nav >
    )
}

export default Navbar
