"use client";

import { ChevronDown, SquarePen } from "lucide-react";

interface SelectOption {
    label: string;
    value: string;
}

interface ProfileFormFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: "text" | "email" | "tel" | "select";
    placeholder?: string;
    multiline?: boolean;
    options?: SelectOption[];
    showEditIcon?: boolean;
    className?: string;
}

const shellClassName =
    "relative rounded-lg sm:rounded-[18px] border border-[#EE9C24] sm:border-[#ea8a3f] bg-white transition focus-within:border-[#d76b21] focus-within:shadow-[0_0_0_2px_rgba(237,154,35,0.08)] sm:focus-within:shadow-[0_0_0_4px_rgba(237,154,35,0.12)]";

const controlClassName =
    "w-full bg-transparent px-3 sm:px-5 pb-2 sm:pb-4 pt-3 sm:pt-6 text-xs sm:text-base text-gray-800 sm:text-heading outline-none placeholder:text-gray-300 sm:placeholder:text-[#a5a5a5]";

export default function ProfileFormField({
    id,
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    multiline = false,
    options = [],
    showEditIcon = false,
    className = "",
}: ProfileFormFieldProps) {
    return (
        <label className={`relative block ${className}`}>
            <span className="absolute left-3 sm:left-4 top-0 z-10 -translate-y-1/2 bg-white sm:bg-[var(--bg-card)] px-1 sm:px-2 text-[10px] sm:text-[15px] font-bold sm:font-medium text-gray-900 sm:text-heading">
                {label}
            </span>
            <div className={shellClassName}>
                {multiline ? (
                    <textarea
                        id={id}
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        placeholder={placeholder}
                        rows={4}
                        className={`${controlClassName} resize-none pr-5`}
                    />
                ) : type === "select" ? (
                    <div className="relative">
                        <select
                            id={id}
                            value={value}
                            onChange={(event) => onChange(event.target.value)}
                            className={`${controlClassName} appearance-none pr-14`}
                        >
                            <option value="" disabled>
                                {placeholder}
                            </option>
                            {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            className="pointer-events-none absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 text-[#8f8f8f] h-4 w-4 sm:h-5 sm:w-5"
                        />
                    </div>
                ) : (
                    <div className="relative">
                        <input
                            id={id}
                            type={type}
                            value={value}
                            onChange={(event) => onChange(event.target.value)}
                            placeholder={placeholder}
                            className={`${controlClassName} ${showEditIcon ? "pr-10 sm:pr-14" : "pr-3 sm:pr-5"}`}
                        />
                        {showEditIcon ? (
                            <SquarePen
                                className="pointer-events-none absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 text-[#a5a5a5] h-4 w-4 sm:h-[22px] sm:w-[22px]"
                            />
                        ) : null}
                    </div>
                )}
            </div>
        </label>
    );
}
