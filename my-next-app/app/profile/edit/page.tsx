"use client";

import { ProfileEditableSections, MobileProfileLayout } from "@/components/profile";
import { useRouter } from "next/navigation";

export default function MobileProfileEditPage() {
    return (
        <main className="bg-[#FAFAFA] min-h-screen">
            <MobileProfileLayout title="Profile">
                <div className="bg-[#FAFAFA] pb-6">
                    <ProfileEditableSections />
                </div>
            </MobileProfileLayout>
        </main>
    );
}
