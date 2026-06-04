import Image from "next/image";

const features = [
  {
    id: 1,
    title: "Genuine Components",
    subtitle: "100% Original Products",
    image: "/feature1.png",
  },
  {
    id: 2,
    title: "Bulk Order Support",
    subtitle: "Special Pricing for Quantity",
    image: "/feature2.png",
  },
  {
    id: 3,
    title: "Technical Assistance",
    subtitle: "Expert Help Available",
    image: "/feature3.png",
  },
  {
    id: 4,
    title: "Secure Payments",
    subtitle: "Safe & Encrypted Checkout",
    image: "/feature4.png",
  }
];

export default function FeatureHighlights() {
  return (
    <section className="px-4 md:px-14 pb-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-4 md:gap-8 mb-16">
          <div className="h-[2px] bg-[#E47B25] flex-1 max-w-[60px] md:max-w-[150px]" />
          <h2 className="text-xl md:text-2xl font-semibold text-[#000000] whitespace-nowrap">Why DSM Electro</h2>
          <div className="h-[2px] bg-[#E47B25] flex-1 max-w-[60px] md:max-w-[150px]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="relative bg-white rounded-2xl shadow-[0_3px_0_0_#f0fdf4,0_6px_0_0_#dcfce7,0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden flex flex-col items-center pb-6 text-center transition-all hover:-translate-y-1 hover:shadow-[0_3px_0_0_#f0fdf4,0_6px_0_0_#dcfce7,0_8px_25px_-4px_rgba(0,0,0,0.15)] group"
            >
              {/* Top Gradient Bar */}
              <div className="w-full h-[40px] bg-gradient-to-b from-[#E47B25] to-[#B3520A]" />

              {/* Icon Circle */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[68px] h-[68px] rounded-full flex items-center justify-center z-10 shadow-sm bg-white overflow-hidden">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-contain p-[2px]"
                />
              </div>

              {/* Text Content */}
              <div className="mt-[44px] px-4 space-y-1">
                <h3 className="text-[#E47B25] font-semibold text-[17px]">
                  {feature.title}
                </h3>
                <p className="text-[#1a1a1a] text-[11px] font-medium">
                  {feature.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
