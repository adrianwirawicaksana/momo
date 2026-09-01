"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function ConditionalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Daftar route yang TIDAK ingin menampilkan Navbar & Footer
    const authRoutes = ["/login", "/register"];
    const isAuthPage = authRoutes.includes(pathname);

    if (isAuthPage) {
        return <main className="flex-1">{children}</main>;
    }

    return (
        <>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </>
    );
}