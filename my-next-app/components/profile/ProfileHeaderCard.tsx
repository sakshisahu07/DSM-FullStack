"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";

interface ProfileHeaderCardProps {
    fullName: string;
    description: string;
    address: string;
}

export default function ProfileHeaderCard({
    fullName,
    description,
    address,
}: ProfileHeaderCardProps) {
    return (
        <div className="card overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_15px_rgba(0,0,0,0.02)] sm:border-white sm:shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:rounded-[28px]">
            <div className="p-6 sm:p-6 md:p-9">
                <div className="flex flex-col items-center text-center gap-3 sm:flex-row sm:items-center sm:text-left sm:gap-5">
                    <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full border border-[#efe7db] sm:h-24 sm:w-24">
                        <Image
                            src="/Images/user-profile.png"
                            width={96}
                            height={96}
                            alt="avatar"
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-[1.1rem] font-bold leading-tight text-heading sm:text-3xl sm:font-semibold sm:text-[2.125rem]">
                            {fullName}
                        </h2>
                        {/* Hidden on mobile, shown on desktop */}
                        <p className="hidden sm:block mt-2 text-lg text-[#9a909d]">{description}</p>
                        
                        <div className="mt-1 sm:mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-1 sm:gap-2 text-[0.65rem] sm:text-lg">
                            <MapPin size={10} className="text-gray-400 sm:text-[#6e646f] sm:w-[18px] sm:h-[18px]" />
                            <span className="font-medium text-gray-400 sm:text-[#9a909d]">Address :</span>
                            <span className="break-words font-medium text-gray-800 tracking-wide sm:tracking-normal sm:text-[#3e3a3d]">
                                {address}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
