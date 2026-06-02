
"use client";

import {
    FeatureHighlights,
    ProfileEditableSections,
    ProfileSidebar,
    RelatedProducts,
    MobileProfileLayout,
} from "@/components/profile";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/slices/authSlice";
import { ArrowLeft, MapPin, ChevronRight, User, FileText, Heart, Package, Truck, Smile, Users, CreditCard, Gift, LogOut, Headphones } from "lucide-react";

export default function ProfilePage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const mobileMenu = [
        { label: "Profile", icon: User, href: "/profile/edit" },
        { label: "View Invoices", icon: FileText, href: "/view-invoices" },
        { label: "My wishlist", icon: Heart, href: "/my-wishlist" },
        { label: "My Order", icon: Package, href: "/my-orders" },
        { label: "Track My Order", icon: Truck, href: "/track-order" },
        { label: "Affiliate Dashboard", icon: Smile, href: "/affiliate-dashboard" },
        { label: "Refer & earn", icon: Users, href: "/refer-earn" },
        { label: "Wallet", icon: Smile, href: "/payments-wallet" },
        { label: "Membership", icon: Gift, href: "/membership" },
        { label: "Live Support", icon: Headphones, href: "/profile/live-support" },
        { label: "Log Out", icon: LogOut, action: "logout" },
    ];

    const handleLogout = () => {
        dispatch(logout());
        router.push("/login");
    };

    return (
        <>
            <main className="bg-[#FAFAFA] lg:bg-white lg:py-4 sm:py-6 md:py-8 ">
            {/* <div className="max-w-7xl mx-auto px-4"> */}
            <div className="container-main lg:py-4 sm:py-6 md:py-8 px-0 lg:px-4">
                {/* Desktop Breadcrumb */}
                <p className="hidden lg:block text-xs sm:text-sm text-gray-400 mb-3 md:mb-4">
                    HOME &gt; MY ACCOUNT &gt;{" "}
                    <span className="text-[#EE9C24]">PROFILE</span>
                </p>

                {/* Desktop Grid Layout */}
                <div className="hidden lg:grid grid-cols-12 gap-4 md:gap-6">
                    {/* Sidebar */}
                    <div className="col-span-12 lg:col-span-3 min-w-0">
                        <ProfileSidebar activeItem="Profile" />
                    </div>

                    {/* Right Content */}
                    <div className="col-span-12 lg:col-span-9 min-w-0">
                        <div className="rounded-[28px] bg-[#f8f7f5] p-4 sm:p-6 md:rounded-xl md:p-8">
                            <div className="mb-1 md:mb-2">
                                <h1 className="text-heading inline-block min-w-[120px] max-w-full border-b-4 border-[#EE9C24] pb-2 text-2xl font-semibold md:min-w-[180px] md:text-[2.125rem]">
                                    Profile
                                </h1>
                            </div>
                            <ProfileEditableSections />
                        </div>
                    </div>
                </div>

            </div>
        </main>

        {/* Mobile Dashboard Layout */}
        <MobileProfileLayout title="Profile">
            {/* Interactive Profile Info Card */}
            <div className="bg-[#FFFDF9] rounded-2xl p-6 flex flex-col items-center justify-center border border-orange-50/50 shadow-[0_2px_15px_rgba(0,0,0,0.02)] mb-4 mt-2">
                <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center">
                    <Image
                        src="/Images/user-profile.png"
                        alt="User"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                        unoptimized
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerText = user?.firstName?.[0] || 'U';
                        }}
                    />
                </div>
                <h2 className="font-bold text-gray-900 text-lg mb-1 capitalize">
                    {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "Aisha sheikh"}
                </h2>
                <div className="text-gray-500 text-xs flex flex-col items-center text-center max-w-[250px]">
                    <span className="flex items-center gap-1 mb-1 text-[11px] font-medium text-gray-400">
                        <MapPin size={10} className="text-gray-400" /> Address :
                    </span>
                    <span className="text-gray-600 font-medium">
                        {user?.address || "2118 Thornridge Cir. Syracuse, Connecticut 35624"}
                    </span>
                </div>
            </div>

            {/* List Menu */}
            <div className="space-y-3">
                {mobileMenu.map((item, i) => {
                    const Icon = item.icon;
                    const content = (
                        <div className="flex items-center justify-between bg-white px-5 py-4 rounded-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-transform">
                            <div className="flex items-center gap-4">
                                <Icon size={20} className="text-[#EE9C24]" strokeWidth={1.5} />
                                <span className="font-semibold text-gray-800 text-[14px] tracking-wide">{item.label}</span>
                            </div>
                            <ChevronRight size={18} className="text-[#EE9C24]" strokeWidth={2.5} />
                        </div>
                    );

                    if (item.action === "logout") {
                        return (
                            <button key={i} onClick={handleLogout} className="w-full text-left">
                                {content}
                            </button>
                        );
                    }

                    return (
                        <Link href={item.href || '#'} key={i} className="block">
                            {content}
                        </Link>
                    );
                })}
            </div>
        </MobileProfileLayout>
    </>
);
}
