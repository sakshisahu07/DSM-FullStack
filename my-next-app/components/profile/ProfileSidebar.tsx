"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import toast from "react-hot-toast";

type MenuItem = {
    label: string;
    icon: string;
    href?: string;
};

const menu: MenuItem[] = [
    { label: "Profile", icon: "/icons/profile-icons.png", href: "/profile" },
    { label: "View Invoices", icon: "/icons/view-incvoices-icon.png", href: "/view-invoices" },
    { label: "My Wishlist", icon: "/icons/mywishlist-icon.png", href: "/my-wishlist" },
    { label: "My Order", icon: "/icons/myorder-icon.png", href: "/my-orders" },
    { label: "Track My Order", icon: "/icons/track-order-icon.png", href: "/track-order" },
    { label: "Refer & Earn", icon: "/icons/refer-earn-icon.png", href: "/refer-earn" },
    { label: "Affiliate Dashboard", icon: "/icons/affiliate-dashboard-icon.png", href: "/affiliate-dashboard" },
    { label: "Membership", icon: "/icons/membership-icon.png", href: "/membership" },
    { label: "Payments & Wallet", icon: "/icons/payments-wallet-icon.png", href: "/payments-wallet" },
    { label: "Log Out", icon: "/icons/logout-icon.png" },
];

interface ProfileSidebarProps {
    activeItem?: string;
}

export default function ProfileSidebar({
    activeItem = "Profile",
}: ProfileSidebarProps) {
    const router = useRouter();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        toast.success("Logged out successfully!");
        router.push("/");
    };

    return (
        <div className="card p-4 sm:p-5 md:p-6 h-full flex flex-col">
            <ul className="space-y-1 sm:space-y-2">
                {menu.map((item, i) => {
                    const isActive = activeItem === item.label;
                    const itemClassName = `flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 px-3 sm:px-5 rounded-[10px] sm:rounded-[12px] text-xs sm:text-sm font-medium transition ${isActive
                            ? "bg-primary-gradient text-white shadow-md"
                            : "text-body hover:bg-gray-100"
                        }`;

                    const content = (
                        <>
                            <div className={`flex items-center justify-center shrink-0 ${isActive ? "brightness-0 invert" : ""}`}>
                                <Image
                                    src={item.icon}
                                    width={18}
                                    height={18}
                                    alt={item.label}
                                    className="w-[16px] h-[16px] sm:w-[20px] sm:h-[20px]"
                                />
                            </div>
                            {item.label}
                        </>
                    );

                    return (
                        <li key={i}>
                            {item.href ? (
                                <Link href={item.href} className={itemClassName}>
                                    {content}
                                </Link>
                            ) : (
                                <button 
                                    type="button" 
                                    className={`${itemClassName} w-full text-left cursor-pointer`}
                                    onClick={() => {
                                        if (item.label === "Log Out") {
                                            handleLogout();
                                        }
                                    }}
                                >
                                    {content}
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>

            {/* Membership Banner */}
            <div className="mt-auto pt-4 sm:pt-6">
                <Image
                    src="/images/poster.png"
                    width={300}
                    height={150}
                    alt="membership"
                    className="rounded-xl w-full h-auto"
                />
            </div>
        </div>
    );
}
