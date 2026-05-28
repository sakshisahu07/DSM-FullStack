"use client";

import React from "react";

interface ProfileCardWrapperProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}

export default function ProfileCardWrapper({
    title,
    description,
    children,
    action,
}: ProfileCardWrapperProps) {
    return (
        <div className="card min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:border-white sm:rounded-[28px] sm:p-6 md:p-9 sm:shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
            <div className="mb-4 flex flex-row items-start justify-between gap-2 sm:mb-6 sm:flex-row sm:items-start">
                <div>
                    <h3 className="text-heading text-[1.1rem] font-bold tracking-tight sm:text-[2rem] sm:font-semibold sm:tracking-[-0.02em]">
                        {title}
                    </h3>
                    {description && (
                        <p className="mt-0.5 text-[0.65rem] font-medium text-gray-400 sm:mt-1 sm:text-lg sm:text-[#9a909d]">
                            {description}
                        </p>
                    )}
                </div>

                {action && action}
            </div>

            {children}
        </div>
    );
}
