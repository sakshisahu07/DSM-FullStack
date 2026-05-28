import Image from "next/image";

const features = [
    {
        title: "Genuine Components",
        desc: "100% Original Products",
        icon: "/icons/genuine-components-icon.png",
    },
    {
        title: "Bulk Order Support",
        desc: "Special Pricing for Quantity",
        icon: "/icons/bulk-order-support-icon.png",
    },
    {
        title: "Technical Assistance",
        desc: "Expert Help Available",
        icon: "/icons/technical-assistance-icon.png",
    },
    {
        title: "Secure Payments",
        desc: "Safe & Encrypted Checkout",
        icon: "/icons/secure-payments-icon.png",
    },
];

export default function FeatureHighlights() {
    return (
        <section className="px-4 md:px-14">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {features.map((item, i) => (
                        <div key={i} className="bg-white border border-[var(--border-light)] rounded-[14px] sm:rounded-[16px] md:rounded-[20px] overflow-hidden shadow-sm flex flex-col items-center text-center pb-4 sm:pb-5 md:pb-6">
                            {/* Top Orange Background with centered icon overlapping */}
                            <div className="w-full h-10 sm:h-12 md:h-16 bg-primary-gradient relative flex justify-center">
                                <div className="absolute -bottom-5 sm:-bottom-6 md:-bottom-8 flex items-center justify-center">
                                    <Image
                                        src={item.icon}
                                        width={56}
                                        height={56}
                                        alt={item.title}
                                        className="object-contain drop-shadow-md w-[36px] h-[36px] sm:w-[44px] sm:h-[44px] md:w-[56px] md:h-[56px]"
                                    />
                                </div>
                            </div>

                            {/* Bottom Content */}
                            <div className="pt-8 sm:pt-10 md:pt-12 px-2 sm:px-3 md:px-4">
                                <p className="text-[#D26D19] font-bold text-[11px] sm:text-[13px] md:text-[15px] mb-1 sm:mb-1.5">{item.title}</p>
                                <p className="text-[#4B5563] text-[9px] sm:text-[10px] md:text-[11px] font-medium">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
