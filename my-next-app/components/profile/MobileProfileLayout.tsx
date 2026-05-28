"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface MobileProfileLayoutProps {
    title?: string;
    onBack?: () => void;
    children: React.ReactNode;
}

export default function MobileProfileLayout({ 
    title = "My Account", 
    onBack,
    children 
}: MobileProfileLayoutProps) {
    const router = useRouter();

    return (
        <div className="block lg:hidden bg-[#FAFAFA] min-h-screen pb-24">
            {/* Header Gradient */}
            <div className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] px-4 py-4 flex items-center text-white sticky top-0 z-10 w-full shadow-sm">
                <button onClick={onBack || (() => router.back())} className="mr-4">
                    <ArrowLeft size={22} className="text-white" />
                </button>
                <span className="font-semibold text-[17px] tracking-wide">{title}</span>
            </div>

            <div className="px-4 py-4">
                {children}
            </div>
        </div>
    );
}
