"use client";

import { ProfileSidebar, MobileProfileLayout } from "@/components/profile";
import LiveSupportSection from "@/components/profile/LiveSupportSection";

export default function LiveSupportPage() {
    return (
        <>
            {/* ── Desktop Layout ── */}
            <main className="hidden lg:block bg-white lg:py-4 sm:py-6 md:py-8">
                <div className="container-main lg:py-4 sm:py-6 md:py-8 px-0 lg:px-4">
                    {/* Breadcrumb */}
                    <p className="text-xs sm:text-sm text-gray-400 mb-3 md:mb-4">
                        HOME &gt; MY ACCOUNT &gt;{" "}
                        <span className="text-[#EE9C24]">LIVE SUPPORT</span>
                    </p>

                    <div className="grid grid-cols-12 gap-4 md:gap-6">
                        {/* Sidebar */}
                        <div className="col-span-12 lg:col-span-3 min-w-0">
                            <ProfileSidebar activeItem="Live Support" />
                        </div>

                        {/* Main Content */}
                        <div className="col-span-12 lg:col-span-9 min-w-0">
                            <LiveSupportSection />
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Mobile Layout ── */}
            <MobileProfileLayout title="Live Support">
                <div className="pb-6">
                    <LiveSupportSection />
                </div>
            </MobileProfileLayout>
        </>
    );
}
