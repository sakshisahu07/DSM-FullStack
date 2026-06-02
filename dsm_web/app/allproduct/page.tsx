"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronRight, Star, ChevronLeft, Eye, ArrowUpRight, Search, LayoutGrid, SlidersHorizontal, ArrowUpDown, Heart, ShoppingCart, X } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { fetchCategories, fetchSubcategories, fetchBrands } from "@/redux/slices/categorySlice";
import { fetchProducts } from "@/redux/slices/productSlice";

// ── Category data ─────────────────────────────────────────────────
type CategoryKey = "All Categories" | "Communication" | "Arduino" | "Raspberry Pi" | "Motors" | "Label";

const categoryContent: Record<CategoryKey, {
  sidebarTitle: string;
  subcategories: string[];
  subTabs: string[];
  banner: string;
  breadcrumb: string[];
  deals: { label: string; enabled: boolean }[];
  description: string[];
}> = {
  "All Categories": {
    sidebarTitle: "All Categories",
    subcategories: [],
    subTabs: [],
    banner: "/hero2.png",
    breadcrumb: ["All Category", "All Products"],
    deals: [
      { label: "Hot Deals", enabled: true },
      { label: "Top Deals", enabled: false },
    ],
    description: [
      "Discover a complete range of electronics components, development boards, sensors, modules, and robotics parts all in one place. Whether you're a student, hobbyist, maker, or professional engineer, DSM Electro offers high-quality products to support every stage of your project—from learning and prototyping to final deployment.",
      "Our extensive collection includes Arduino boards, Raspberry Pi accessories, sensors, motors, power modules, wireless communication modules, robotics kits, and electronic components. These products are perfect for applications such as robotics, IoT, home automation, embedded systems, drone projects, and industrial automation.",
      "At DSM Electro, we focus on genuine components, competitive pricing, fast dispatch, and reliable customer support. With a wide variety of categories and trusted products, you can easily find the right parts to power your next innovation.",
    ],
  },
  "Communication": {
    sidebarTitle: "Communication",
    subcategories: ["Bluetooth", "Wi-Fi Modules", "RF Modules", "GSM/GPRS", "Zigbee"],
    subTabs: ["All Product", "Bluetooth", "Wi-Fi", "RF", "GSM", "Zigbee"],
    banner: "/hero2.png",
    breadcrumb: ["Category", "Communication"],
    deals: [{ label: "Hot Deals", enabled: true }, { label: "Top Deals", enabled: false }, { label: "Deals", enabled: false }],
    description: [
      "Explore our wide range of communication modules including Bluetooth, Wi-Fi, RF, GSM/GPRS, and Zigbee modules for all your wireless connectivity needs.",
      "These modules are ideal for IoT projects, home automation, remote monitoring, and industrial control applications.",
      "At DSM Electro, we stock only genuine communication modules at competitive prices with fast dispatch.",
    ],
  },
  "Arduino": {
    sidebarTitle: "Arduino",
    subcategories: ["Arduino Uno", "Arduino Nano", "Arduino Mega", "Arduino Shield", "Arduino Kit"],
    subTabs: ["All Product", "Uno", "Nano", "Mega", "Shield", "Kit"],
    banner: "/hero2.png",
    breadcrumb: ["Category", "Arduino"],
    deals: [{ label: "Hot Deals", enabled: true }, { label: "Top Deals", enabled: false }, { label: "Deals", enabled: false }],
    description: [
      "Shop the complete range of Arduino boards — Uno, Nano, Mega, and more — along with shields, sensors, and starter kits for every skill level.",
      "Arduino is the go-to platform for students, hobbyists, and engineers building interactive electronics projects.",
      "DSM Electro provides genuine Arduino boards and accessories at the best prices with reliable customer support.",
    ],
  },
  "Raspberry Pi": {
    sidebarTitle: "Raspberry Pi",
    subcategories: ["Pi camera", "Pi Board", "Pi Display", "Pi Module", "Pi Accessories"],
    subTabs: ["All Product", "Pi Camera", "Pi Display", "Pi Board", "Pi Module", "Pi Accessories"],
    banner: "/hero2.png",
    breadcrumb: ["Category", "Raspberry Pi Boards"],
    deals: [{ label: "Hot Deals", enabled: true }, { label: "Top Deals", enabled: false }, { label: "Deals", enabled: false }],
    description: [
      "Explore a wide range of Raspberry Pi boards designed for students, hobbyists, developers, and professional engineers. Whether you're building IoT devices, home automation systems, media centers, or robotics projects, Raspberry Pi offers powerful, compact, and energy-efficient computing solutions.",
      "Our collection includes popular models such as Raspberry Pi 4, Raspberry Pi 5, Raspberry Pi Zero, and Raspberry Pi Pico, along with essential accessories and compatible modules. These boards support multiple operating systems and programming languages, making them ideal for embedded systems, AI projects, coding education, and DIY electronics.",
      "At DSM Electro, we provide genuine Raspberry Pi boards at competitive prices, ensuring reliable performance for both learning and professional applications. Browse our Raspberry Pi collection and start building smart, innovative projects today.",
    ],
  },
  "Motors": {
    sidebarTitle: "Motors",
    subcategories: ["DC Motors", "Servo Motors", "Stepper Motors", "Motor Driver", "Gear Motor"],
    subTabs: ["All Product", "DC Motors", "Servo", "Stepper", "Driver", "Gear"],
    banner: "/banner.png",
    breadcrumb: ["Category", "Motors"],
    deals: [{ label: "Hot Deals", enabled: true }, { label: "Top Deals", enabled: false }, { label: "Deals", enabled: false }],
    description: [
      "Find the right motor for your robotics and automation projects — DC motors, servo motors, stepper motors, gear motors, and motor driver modules.",
      "Our motors are used in robotics kits, drones, CNC machines, 3D printers, and industrial automation systems.",
      "DSM Electro stocks quality motors and drivers at competitive prices to power your next build.",
    ],
  },
  "Label": {
    sidebarTitle: "Label",
    subcategories: ["Sub Label 1", "Sub Label 2", "Sub Label 3"],
    subTabs: ["All Product", "Sub Label 1", "Sub Label 2", "Sub Label 3"],
    banner: "/banner.png",
    breadcrumb: ["Category", "Label"],
    deals: [{ label: "Hot Deals", enabled: true }, { label: "Top Deals", enabled: false }, { label: "Deals", enabled: false }],
    description: [
      "Explore our Label category products.",
      "Find the best components for your project.",
      "DSM Electro — quality products, competitive prices.",
    ],
  },
};

const sidebarCategories: CategoryKey[] = ["All Categories", "Communication", "Arduino", "Raspberry Pi", "Motors", "Label", "Label"];

// ── Products (9 items) ────────────────────────────────────────────
const allProducts = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  title: "Bluetooth 4.0 Module NRF51822",
  price: 447,
  oldPrice: 599,
  discount: 25,
  image: "/images/product-image.png",
}));

// ── SubFilter panel shown when a subcategory is selected ──────────
function SubcategoryFilterPanel() {
  const [priceMin, setPriceMin] = useState(447);
  const [priceMax, setPriceMax] = useState(4347);
  const [filterTab, setFilterTab] = useState<"price" | "color">("price");
  const [selectedRating, setSelectedRating] = useState(5);
  const [brandToggles, setBrandToggles] = useState([true, false]);

  return (
    <div className="bg-white rounded-2xl mx-1.5 mb-3 border border-gray-100 shadow-sm overflow-hidden">
      {/* Price / Color Filter tabs */}
      <div className="flex bg-[#F8F8F8]">
        <button
          onClick={() => setFilterTab("price")}
          className={`flex-1 py-3 text-[13px] font-bold transition-all ${filterTab === "price" ? "bg-white text-heading shadow-[0_-2px_10px_rgba(0,0,0,0.02)] rounded-t-xl" : "text-gray-400"}`}
        >
          Price Filter
        </button>
        <button
          onClick={() => setFilterTab("color")}
          className={`flex-1 py-3 text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${filterTab === "color" ? "bg-white text-heading shadow-[0_-2px_10px_rgba(0,0,0,0.02)] rounded-t-xl" : "text-gray-400"}`}
        >
          <span className="bg-[#EE9C24] text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">2</span>
          Color Filter
        </button>
      </div>

      <div className="p-4">
        {filterTab === "price" && (
          <div>
            {/* Range slider track */}
            <div className="relative h-1 bg-gray-200 rounded-full mb-6 mt-4 mx-2">
              <div
                className="absolute h-full bg-[#EE9C24] rounded-full"
                style={{ left: "0%", right: "40%" }}
              />
              {/* Custom handles */}
              <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#EE9C24] rounded-full shadow-sm flex items-center justify-center">
                <div className="w-1 h-1 bg-[#EE9C24] rounded-full" />
              </div>
              <div className="absolute right-[38%] top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#EE9C24] rounded-full shadow-sm flex items-center justify-center">
                <div className="w-1 h-1 bg-[#EE9C24] rounded-full" />
              </div>
            </div>

            <div className="flex gap-3 mb-5">
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 mb-1.5 font-medium">From :</p>
                <div className="bg-[#F6F6F6] rounded-xl px-3 py-2.5 text-[15px] font-bold text-heading">₹{priceMin.toLocaleString()}</div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 mb-1.5 font-medium">To :</p>
                <div className="bg-[#F6F6F6] rounded-xl px-3 py-2.5 text-[15px] font-bold text-heading">₹{priceMax.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button className="flex-1 border border-gray-200 text-gray-500 text-sm py-2 rounded-full font-bold hover:bg-gray-50 transition-colors">Cancel</button>
              <button className="flex-1 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white text-sm py-2 rounded-full font-bold shadow-[0_4px_12px_rgba(238,156,36,0.3)]">Apply</button>
            </div>
          </div>
        )}

        {filterTab === "color" && (
          <div className="py-2 text-sm text-gray-500 font-medium">Color options coming soon...</div>
        )}

        {/* Brands Section */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-[15px] font-extrabold text-heading mb-4">Brands</p>
          <div className="flex flex-col gap-3.5">
            {["Hot Deals", "Deals"].map((label, i) => (
              <label
                key={i}
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => setBrandToggles(prev => { const next = [...prev]; next[i] = !next[i]; return next; })}
              >
                <span className="text-sm font-bold text-heading transition-colors">{label}</span>
                <div className={`relative w-10 h-5.5 rounded-full transition-all duration-300 ${brandToggles[i] ? "bg-[#EE9C24]" : "bg-gray-200"}`}>
                  <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform duration-300 ${brandToggles[i] ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Brands Radio Buttons */}
        <div className="mt-4 pb-2">
          <div className="flex flex-col gap-3">
            {["All", "All", "All", "All"].map((b, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative w-4.5 h-4.5 flex-shrink-0">
                  <input
                    type="radio"
                    name="brand_radio"
                    defaultChecked={i === 0}
                    className="peer appearance-none w-full h-full border-2 border-gray-200 rounded-full checked:border-[#EE9C24] transition-all"
                  />
                  <div className="absolute inset-0 m-auto w-2 h-2 bg-[#EE9C24] rounded-full scale-0 peer-checked:scale-100 transition-transform" />
                </div>
                <span className="text-[15px] font-bold text-heading group-hover:text-[#EE9C24] transition-colors">{b}</span>
              </label>
            ))}
          </div>
        </div>

        {/* feature Section */}
        <div className="mt-2 pt-4">
          <p className="text-[15px] font-bold text-heading mb-4">feature</p>
          <div className="flex flex-col gap-3.5">
            {[
              { label: "Deals", checked: true },
              { label: "Deals", checked: false },
              { label: "Deals", checked: false }
            ].map((f, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-3.5 h-3.5 rotate-45 border-2 flex-shrink-0 transition-all ${f.checked ? "bg-[#EE9C24] border-[#EE9C24]" : "border-gray-200 group-hover:border-[#EE9C24]"}`} />
                <span className="text-[15px] font-bold text-heading">{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating Section */}
        <div className="mt-6 pt-4">
          <p className="text-[15px] font-bold text-heading mb-4">Rating</p>
          <div className="flex flex-col gap-3">
            {[5, 4, 3, 2, 1].map((r) => (
              <label key={r} onClick={() => setSelectedRating(r)} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-3.5 h-3.5 rotate-45 border-2 flex-shrink-0 transition-all ${selectedRating === r ? "bg-[#EE9C24] border-[#EE9C24]" : "border-gray-200 group-hover:border-[#EE9C24]"}`} />
                <div className="flex items-center gap-1.5 ml-0.5">
                  <span className="text-[15px] font-bold text-heading mr-1">{r}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} className={s <= r ? "fill-[#FFC107] text-[#FFC107]" : "fill-gray-200 text-gray-200"} />
                    ))}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function AllProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, subcategories: allSubcategories, brands, loading: categoryLoading } = useSelector((state: RootState) => state.category);
  const { products, loading: productLoading } = useSelector((state: RootState) => state.product);

  const [activeCategory, setActiveCategory] = useState<string>("All Categories");
  const [activeSubTab, setActiveSubTab] = useState("All Product");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"categories" | "search_categories" | "subcategories" | "products">("categories");
  const [mobileHeaderTitle, setMobileHeaderTitle] = useState("Product Categories");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [showFilterChips, setShowFilterChips] = useState(false);
  const [dealToggles, setDealToggles] = useState<boolean[]>([true, false]);
  const [mobileFilterToggles, setMobileFilterToggles] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSubcategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  // Reset deal toggles when category changes
  useEffect(() => {
    const deals = activeCategory === "All Categories"
      ? categoryContent["All Categories"].deals
      : [{ label: "Hot Deals", enabled: true }];
    setDealToggles(deals.map(d => d.enabled));
  }, [activeCategory]);

  useEffect(() => {
    let params = "";
    if (activeCategory !== "All Categories") {
      const cat = categories.find(c => c.title === activeCategory);
      if (cat) {
        params += `category=${cat._id}`;
      }
    }
    if (activeSubcategory) {
      const sub = allSubcategories.find(s => s.title === activeSubcategory);
      if (sub) {
        if (params) params += "&";
        params += `subcategory=${sub._id}`;
      }
    }
    dispatch(fetchProducts(params));
  }, [dispatch, activeCategory, activeSubcategory, categories, allSubcategories]);

  const currentCategoryData = categories.find(c => c.title === activeCategory);

  // Create dynamic content based on selected category
  const content = activeCategory === "All Categories" ? categoryContent["All Categories"] : {
    sidebarTitle: activeCategory,
    subcategories: allSubcategories.filter(s => s.category?.title === activeCategory).map(s => s.title),
    subTabs: ["All Product", ...allSubcategories.filter(s => s.category?.title === activeCategory).map(s => s.title)],
    banner: currentCategoryData?.icon || "/hero2.png",
    breadcrumb: ["Category", activeCategory],
    deals: [{ label: "Hot Deals", enabled: true }],
    description: [currentCategoryData?.description || `Explore our ${activeCategory} collection.`]
  };

  const isSubcatActive = activeSubcategory !== null;

  function handleCategoryClick(catTitle: string) {
    setActiveCategory(catTitle);
    setActiveSubTab("All Product");
    setActiveSubcategory(null);
  }

  function handleSubcategoryClick(sub: string) {
    setActiveSubcategory(sub);
    setActiveSubTab(sub);
  }

  // Split subcategories: selected one and the rest
  const subcategoryList = content.subcategories || [];
  const selectedSubIdx = isSubcatActive
    ? subcategoryList.indexOf(activeSubcategory!)
    : -1;
  const subsBeforeSelected = isSubcatActive
    ? subcategoryList.slice(0, selectedSubIdx + 1)
    : subcategoryList;
  const subsAfterSelected = isSubcatActive
    ? subcategoryList.slice(selectedSubIdx + 1)
    : [];

  // Products to show
  const visibleProducts = products;

  // Section heading
  const productHeading = isSubcatActive
    ? `${activeSubcategory} Product`
    : "All Products";

  const dynamicMobileCategories = categories.map(cat => ({
    name: cat.title,
    items: '0 items', // This could be dynamic if API provided counts
    icon: cat.icon || '/navImg.png'
  }));

  const activeMobileCategories = dynamicMobileCategories.length > 0 ? dynamicMobileCategories : [];

  return (
    <main className="bg-white min-h-screen">
      {/* Mobile View */}
      <div className="block md:hidden">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-[#D26D19] to-[#E47B25] px-4 py-5 flex items-center justify-between text-white sticky top-0 z-[110]">
          <div className="flex items-center gap-4">
            <button onClick={() => {
              if (mobileView === "products") {
                setMobileView("subcategories");
                setMobileHeaderTitle("Communication");
              } else if (mobileView === "subcategories" || mobileView === "search_categories") {
                setMobileView("categories");
                setMobileHeaderTitle("Product Categories");
              } else {
                window.history.back();
              }
            }}>
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">{mobileHeaderTitle}</h1>
          </div>
          {mobileView === "subcategories" && <LayoutGrid size={24} />}
          {mobileView === "products" && (
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSortOpen(true)}>
                <ArrowUpDown size={20} />
              </button>
              <button onClick={() => setIsFilterOpen(true)}>
                <SlidersHorizontal size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Global Tabs */}
        {(mobileView === "subcategories" || mobileView === "products") && (
          <>
            <div className="flex gap-4 overflow-x-auto px-4 py-3 no-scrollbar scroll-smooth">
              {categories.slice(0, 10).map((cat, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleCategoryClick(cat.title);
                    setMobileHeaderTitle(cat.title);
                  }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full border shrink-0 transition-all ${cat.title === (mobileHeaderTitle || activeCategory) ? "border-[#EE9C24] text-[#EE9C24] bg-[#EE9C24]" : "border-gray-200 text-gray-700"}`}
                >
                  <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden text-gray-500">
                    <Image src={cat.icon || "/hero2.png"} alt="icon" width={16} height={16} className="object-cover" />
                  </div>
                  <span className="text-[13px] font-bold">{cat.title}</span>
                </button>
              ))}
            </div>

            {/* Filter Chips */}
            {mobileView === "products" && showFilterChips && (
              <div className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar animate-in slide-in-from-left-4 duration-300">
                {["Newest First", "Hot Deal", "Brand", "5 Rating"].map((chip, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white shadow-sm shrink-0">
                    <span className="text-[11px] font-bold text-gray-800">{chip}</span>
                    <button onClick={() => i === 0 && setShowFilterChips(false)}><X size={12} className="text-gray-400" /></button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {mobileView === "categories" ? (
          /* View 1: Main Categories (SS 1) */
          <div className="p-4 space-y-4">
            {activeMobileCategories.map((cat, i) => (
              <div key={i} className="flex items-center bg-white border border-gray-100 rounded-3xl p-3 shadow-sm gap-3">
                <div className="w-20 h-20 bg-[#F8F8F8] rounded-2xl flex items-center justify-center shrink-0 border border-gray-50 text-gray-300">
                  <Image src={cat.icon} alt={cat.name} width={60} height={60} className="object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[17px] font-bold text-gray-900 leading-tight">{cat.name}</h3>
                  <p className="text-[14px] text-gray-500 mt-1">{cat.items}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 px-1">
                  <div className="w-[1px] h-12 bg-gray-100 mx-1" />
                  <div onClick={() => setMobileView("search_categories")} className="flex flex-col items-center gap-1.5 cursor-pointer">
                    <div className="w-10 h-10 bg-[#D26D19] rounded-full flex items-center justify-center text-white shadow-sm">
                      <Eye size={18} />
                    </div>
                    <span className="text-[8px] font-bold text-gray-800 text-center whitespace-nowrap">View Product</span>
                  </div>
                  <div className="w-[1px] h-12 bg-gray-100 mx-1" />
                  <div onClick={() => {
                    setMobileView("subcategories");
                    setMobileHeaderTitle(cat.name);
                  }} className="flex flex-col items-center gap-1.5 cursor-pointer">
                    <div className="w-10 h-10 bg-[#D26D19] rounded-full flex items-center justify-center text-white shadow-sm">
                      <ArrowUpRight size={18} />
                    </div>
                    <span className="text-[8px] font-bold text-gray-800 text-center whitespace-nowrap">View Subcategories</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : mobileView === "search_categories" ? (
          /* View 2: Searchable Categories (SS 3) */
          <>
            <div className="p-4 flex items-center gap-3 text-white">
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  placeholder="Search categories here"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 pr-12 text-[15px] placeholder:text-gray-400 focus:outline-none text-gray-900"
                />
                <button className="absolute right-1.5 bg-[#D26D19] p-1.5 rounded-md text-white">
                  <Search size={18} />
                </button>
              </div>
              <button
                onClick={() => setMobileView("categories")}
                className="text-gray-900 font-medium text-[15px]"
              >
                Cancel
              </button>
            </div>

            <div className="p-4 space-y-4">
              {activeMobileCategories.map((cat, i) => (
                <div key={i} className="flex items-center bg-white border border-gray-100 rounded-3xl p-3 shadow-md gap-3">
                  <div className="w-20 h-20 bg-[#F8F8F8] rounded-2xl flex items-center justify-center shrink-0 border border-gray-50 text-gray-300">
                    <Image src={cat.icon} alt={cat.name} width={60} height={60} className="object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[17px] font-bold text-gray-900 leading-tight">{cat.name}</h3>
                    <p className="text-[14px] text-gray-400 font-medium mt-0.5">{cat.items}</p>
                    <button onClick={() => setMobileView("products")} className="text-[14px] font-bold text-gray-800 underline mt-1.5 inline-block">View Product</button>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 px-1 h-full">
                    <div className="w-[1.5px] h-14 bg-gray-100 mx-2" />
                    <div onClick={() => {
                      setMobileView("subcategories");
                      setMobileHeaderTitle(cat.name);
                    }} className="flex flex-col items-center gap-1.5 cursor-pointer">
                      <div className="w-11 h-11 bg-[#D26D19] rounded-full flex items-center justify-center text-white shadow-md">
                        <ArrowUpRight size={22} strokeWidth={2.5} />
                      </div>
                      <span className="text-[9px] font-bold text-gray-800 text-center whitespace-nowrap">View Subcategories</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : mobileView === "subcategories" ? (
          /* View 3: Subcategories (SS 2) */
          <>
            <div className="p-4 flex items-center gap-3">
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  placeholder="Search categories here"
                  className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 pr-12 text-[15px] placeholder:text-gray-400 focus:outline-none"
                />
                <button className="absolute right-1.5 bg-[#D26D19] p-1.5 rounded-md text-white">
                  <Search size={18} />
                </button>
              </div>
              <button
                onClick={() => setMobileView("categories")}
                className="text-gray-900 font-medium text-[15px]"
              >
                Cancel
              </button>
            </div>

            <div className="px-4 space-y-4 pb-20">
              {allSubcategories.filter(s => s.category?.title === mobileHeaderTitle).map((sub, i) => (
                <div key={i} className="flex items-center bg-white border border-gray-100 rounded-3xl p-3 shadow-md gap-3">
                  <div className="w-20 h-20 bg-[#F8F8F8] rounded-2xl flex items-center justify-center shrink-0 border border-gray-50 text-gray-300">
                    <Image src={sub.icon || "/navImg.png"} alt={sub.title} width={60} height={60} className="object-contain opacity-50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[17px] font-bold text-gray-900 leading-tight">{sub.title}</h3>
                    <p className="text-[13px] text-gray-400 font-medium mt-0.5">0 items</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 px-1 h-full">
                    <div className="w-[1.5px] h-14 bg-gray-100 mx-1.5" />
                    <div onClick={() => {
                      setMobileView("products");
                      setMobileHeaderTitle(sub.title);
                      handleSubcategoryClick(sub.title);
                    }} className="flex flex-col items-center gap-1.5 cursor-pointer">
                      <div className="w-11 h-11 bg-[#D26D19] rounded-full flex items-center justify-center text-white shadow-md">
                        <ArrowUpRight size={22} strokeWidth={2.5} />
                      </div>
                      <span className="text-[9px] font-bold text-gray-800 text-center whitespace-nowrap">view Product</span>
                    </div>
                  </div>
                </div>
              ))}
              {allSubcategories.filter(s => s.category?.title === mobileHeaderTitle).length === 0 && (
                <div className="text-center py-10 text-gray-400 font-bold">No subcategories found for this category.</div>
              )}
            </div>
          </>
        ) : (
          /* View 4: Product Grid (SS 5) */
          <div className="p-4">
            {productLoading ? (
              <div className="grid grid-cols-2 gap-3 pb-24">
                {Array(6).fill(0).map((_, idx) => (
                  <ProductCardSkeleton key={`skeleton-mobile-${idx}`} />
                ))}
              </div>
            ) : visibleProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 pb-24">
                {visibleProducts.map((p, i) => (
                  <ProductCard key={p._id || i} product={p} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Image src="/cart.png" alt="Empty" width={80} height={80} className="opacity-20 grayscale" />
                <p className="text-gray-400 font-bold">No products found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheets (Filter & Sort) */}
      <div className="md:hidden">
        {/* Backdrop */}
        {(isFilterOpen || isSortOpen) && (
          <div
            className="fixed inset-0 bg-black/40 z-[1000] animate-in fade-in duration-300"
            onClick={() => { setIsFilterOpen(false); setIsSortOpen(false); }}
          />
        )}

        {/* Filter Sheet */}
        <div className={`fixed bottom-0 left-0 right-0 bg-white z-[1001] rounded-t-[40px] transition-transform duration-500 transform ${isFilterOpen ? "translate-y-0" : "translate-y-full"} max-h-[90vh] overflow-y-auto`}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200">
                <SlidersHorizontal size={14} className="text-gray-500" />
                <span className="text-xs font-bold text-gray-800">Filters</span>
              </div>
              <button onClick={() => setIsFilterOpen(false)} className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                <X size={20} />
              </button>
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <h3 className="text-[15px] font-bold text-gray-900 mb-4">Select Price Range</h3>
              <div className="relative w-full h-1 bg-gray-100 rounded-full mb-8">
                <div className="absolute left-[5%] right-[50%] h-full bg-[#D26D19]" />
                <div className="absolute left-[5%] -top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#D26D19] shadow-md" />
                <div className="absolute right-[50%] -top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#D26D19] shadow-md" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-gray-50 rounded-2xl p-3">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">From :</span>
                  <div className="text-[15px] font-bold text-gray-900 mt-1 italic">₹447</div>
                </div>
                <div className="flex-1 bg-gray-50 rounded-2xl p-3">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">To :</span>
                  <div className="text-[15px] font-bold text-gray-900 mt-1 italic">₹447</div>
                </div>
              </div>
            </div>

            {/* Deals & Brands Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-[15px] font-bold text-gray-900">Deals</h3>
                {["Hot Deals", "Deals", "Deals"].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setMobileFilterToggles(prev => { const next = [...prev]; next[i] = !next[i]; return next; })}
                  >
                    <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${mobileFilterToggles[i] ? "bg-[#EE9C24]" : "bg-gray-200"}`}>
                      <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${mobileFilterToggles[i] ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                    <span className="text-[14px] font-bold text-gray-800">{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="text-[15px] font-bold text-gray-900">Brands</h3>
                {brands.length > 0 ? brands.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${i === 0 ? "border-[#D26D19]" : "border-gray-200"}`}>
                      {i === 0 && <div className="w-2.5 h-2.5 bg-[#D26D19] rounded-full" />}
                    </div>
                    <span className="text-[14px] font-bold text-gray-800">{item.title}</span>
                  </div>
                )) : (
                  ["All", "Generic", "Other"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${i === 0 ? "border-[#D26D19]" : "border-gray-200"}`}>
                        {i === 0 && <div className="w-2.5 h-2.5 bg-[#D26D19] rounded-full" />}
                      </div>
                      <span className="text-[14px] font-bold text-gray-800">{item}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Rating & Feature Grid */}
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wide">Rating</h3>
                {[5, 4, 3, 2, 1].map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center rotate-45 ${i === 0 ? "bg-[#D46C15] border-[#D46C15]" : "border-gray-200"}`}>
                      {i === 0 && <ChevronRight size={14} className="text-white -rotate-45" />}
                    </div>
                    <span className="text-[14px] font-bold text-gray-800">{r}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, s) => <Star key={s} size={14} className={s < r ? "fill-[#FFC107] text-[#FFC107]" : "text-gray-200"} />)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="text-[15px] font-bold text-gray-900 italic">feature</h3>
                {["Deals", "Deals", "Deals"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center rotate-45 ${i === 0 ? "bg-[#D46C15] border-[#D46C15]" : "border-gray-200"}`}>
                      {i === 0 && <ChevronRight size={14} className="text-white -rotate-45" />}
                    </div>
                    <span className="text-[14px] font-bold text-gray-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => { setShowFilterChips(false); setIsFilterOpen(false); }}
                className="flex-1 py-3 rounded-full border border-gray-200 text-gray-500 font-bold text-[14px]"
              >
                Reset
              </button>
              <button
                onClick={() => { setShowFilterChips(true); setIsFilterOpen(false); }}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#D26D19] to-[#E47B25] text-white font-bold text-[14px] shadow-lg shadow-orange-200/50"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Sort Sheet */}
        <div className={`fixed bottom-0 left-0 right-0 bg-white z-[1001] rounded-t-[40px] transition-transform duration-500 transform ${isSortOpen ? "translate-y-0" : "translate-y-full"} max-h-[80vh]`}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200">
                <ArrowUpDown size={14} className="text-gray-500" />
                <span className="text-xs font-bold text-gray-800">Sort</span>
              </div>
              <button onClick={() => setIsSortOpen(false)} className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                <X size={20} />
              </button>
            </div>

            {/* Sort Options */}
            <div className="space-y-6 mb-10">
              {[
                "Latest First",
                "Oldest First",
                "Price: Low to High",
                "Price: High to Low",
                "Popular",
                "Top Rated"
              ].map((opt, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer" onClick={() => { }}>
                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${i === 0 ? "bg-[#D46C15] border-[#D46C15] rotate-45" : "border-gray-200 rounded-lg group-hover:border-orange-300"}`}>
                    {i === 0 && <ChevronRight size={16} className="text-white -rotate-45" />}
                  </div>
                  <span className={`text-[17px] font-bold ${i === 0 ? "text-gray-900" : "text-gray-600"}`}>{opt}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => { setShowFilterChips(false); setIsSortOpen(false); }}
                className="flex-1 py-3 rounded-full border border-gray-200 text-gray-500 font-bold text-[14px]"
              >
                Reset
              </button>
              <button
                onClick={() => { setShowFilterChips(true); setIsSortOpen(false); }}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#D26D19] to-[#E47B25] text-white font-bold text-[14px] shadow-lg shadow-orange-200/50"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop View - Existing Section */}
      <section className="hidden md:block px-4 md:px-10 lg:px-10 py-6">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1 uppercase tracking-wide">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span>&gt;</span>
          <span className="hover:text-gray-600 cursor-pointer">{content.breadcrumb[0]}</span>
          <span>&gt;</span>
          <span className="text-[#EE9C24] font-semibold">{content.breadcrumb[1]}</span>
        </nav>

        {/* Page title (shows subcategory name when selected) */}
        {isSubcatActive && (
          <div className="mb-5">
            <h2 className="text-heading font-bold text-2xl">{activeSubcategory}</h2>
            <div className="w-14 h-0.5 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] mt-1 rounded-full" />
          </div>
        )}

        {/* Mobile Filter Button (Visible only on small screens) */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => {
              const el = document.getElementById("filter-sidebar");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full bg-white border border-gray-200 py-3.5 rounded-2xl flex items-center justify-between px-6 text-heading font-bold shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 flex flex-col justify-between items-center py-1">
                <div className="w-full h-0.5 bg-[#EE9C24] rounded-full" />
                <div className="w-2/3 h-0.5 bg-[#EE9C24] rounded-full" />
                <div className="w-full h-0.5 bg-[#EE9C24] rounded-full" />
              </div>
              <span>Filter & Categories</span>
            </div>
            <ChevronRight size={20} className="text-[#EE9C24]" strokeWidth={3} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* ── Sidebar ── */}
          <div id="filter-sidebar" className="w-full md:w-72 shrink-0 flex flex-col gap-6">
            <div className="bg-[#F8F8F8]/50 rounded-[2.5rem] border border-gray-100/50 shadow-sm overflow-hidden pb-8">

              {/* Category + subcategory list */}
              <ul className="mt-5 px-4">
                {["All Categories", ...categories.map(c => c.title)].map((catTitle, idx) => {
                  const isActive = (catTitle === activeCategory) || (catTitle === "All Categories" && activeCategory === "All Categories");
                  const hasSubcats = isActive && content.subcategories.length > 0;

                  return (
                    <li key={idx} className="mb-3 last:mb-0">
                      <button
                        onClick={() => handleCategoryClick(catTitle)}
                        className={`w-full flex items-center justify-between px-6 py-2 text-[15px] font-bold transition-all rounded-md ${isActive
                          ? "bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white shadow-xl shadow-orange-100"
                          : "text-heading hover:bg-white hover:shadow-md bg-transparent"
                          }`}
                      >
                        <span>{catTitle}</span>
                        <ChevronRight size={20} className={isActive ? "text-white" : "text-[#EE9C24]"} strokeWidth={3} />
                      </button>
                      {/* Subcategories when this category is active */}
                      {hasSubcats && (
                        <ul className="mt-4 space-y-2.5 px-1">
                          {subsBeforeSelected.map((sub) => (
                            <li key={sub}>
                              <button
                                onClick={() => handleSubcategoryClick(sub)}
                                className={`w-full flex items-center gap-3 px-6 py-1 text-[15px] font-bold transition-all rounded-md ${activeSubcategory === sub
                                  ? "border-2 border-[#EE9C24] bg-white text-heading shadow-md"
                                  : "text-gray-600 hover:text-[#EE9C24] bg-white/40 hover:bg-white transition-all shadow-sm"
                                  }`}
                              >
                                <span className={activeSubcategory === sub ? "text-[#EE9C24] text-xl font-black tracking-tighter" : "text-[#EE9C24]/60 text-xl font-black tracking-tighter"}>»</span>
                                {sub}
                              </button>
                            </li>
                          ))}

                          {/* Filter panel appears right after selected subcategory */}
                          {isSubcatActive && <SubcategoryFilterPanel />}

                          {/* Remaining subcategories after selected */}
                          {subsAfterSelected.map((sub) => (
                            <li key={sub}>
                              <button
                                onClick={() => handleSubcategoryClick(sub)}
                                className="w-full flex items-center gap-3 px-6 py-1 text-[15px] font-bold text-gray-600 hover:text-[#EE9C24] transition-all bg-white/40 hover:bg-white rounded-md shadow-sm"
                              >
                                <span className="text-[#EE9C24]/60 text-xl font-black tracking-tighter">»</span>
                                {sub}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Bottom Sections: Deals and Brands (when no subcategory is selected) */}
              {!isSubcatActive && (
                <div className="mt-6 space-y-2">
                  <div className="px-7 py-6 border-t border-gray-100">
                    <p className="text-[18px] font-extrabold text-heading mb-5">Deals</p>
                    <div className="flex flex-col gap-4">
                      {content.deals.map((deal, i) => (
                        <label
                          key={i}
                          className="flex items-center justify-between cursor-pointer group"
                          onClick={() => setDealToggles(prev => { const next = [...prev]; next[i] = !next[i]; return next; })}
                        >
                          <span className="text-[15px] font-bold text-heading group-hover:text-[#EE9C24] transition-colors">{deal.label}</span>
                          <div className={`relative w-12 h-6.5 rounded-full transition-all duration-300 ${dealToggles[i] ? "bg-[#EE9C24]" : "bg-gray-200"}`}>
                            <div className={`absolute top-0.5 w-5.5 h-5.5 bg-white rounded-full shadow-lg transition-transform duration-300 ${dealToggles[i] ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="px-7 py-6 border-t border-gray-100">
                    <p className="text-[18px] font-extrabold text-heading mb-5">Brands</p>
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className="relative w-5.5 h-5.5 flex-shrink-0">
                        <input
                          type="radio"
                          defaultChecked
                          className="peer appearance-none w-full h-full border-2 border-gray-300 rounded-full checked:border-[#EE9C24] transition-all duration-300"
                          name="main_brand_desktop"
                        />
                        <div className="absolute inset-0 m-auto w-2.5 h-2.5 bg-[#EE9C24] rounded-full scale-0 peer-checked:scale-100 transition-transform duration-300" />
                      </div>
                      <span className="text-[16px] font-bold text-heading group-hover:text-[#EE9C24] transition-colors">All</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Promo banners */}
            <div className="flex flex-col gap-5 hidden md:flex">
              <div className="rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <Image src="/membership.png" alt="Membership Promo" width={288} height={200} className="w-full object-cover" />
              </div>
              <div className="rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <Image src="/membership.png" alt="Membership Promo" width={288} height={200} className="w-full object-cover" />
              </div>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">

            {/* Sub-category tabs */}
            {content.subTabs.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-6">
                {content.subTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-bold transition-all shadow-sm ${activeSubTab === tab
                      ? "bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white border-transparent shadow-orange-100"
                      : "bg-white border-gray-100 text-gray-700 hover:border-orange-300 hover:text-[#EE9C24] hover:shadow"
                      }`}
                  >
                    <Image src="/hero2.png" alt={tab} width={18} height={18} className="object-contain opacity-80" />
                    {tab}
                  </button>
                ))}
              </div>
            )}

           

            {/* Hero Banner */}
            <div className="rounded-[2.5rem] overflow-hidden mb-8 shadow-sm">
              <Image
                src={content.banner}
                alt="Category Banner"
                width={900}
                height={320}
                className="w-full object-cover h-[30rem]"
                priority
              />
            </div>
             {/* Description (shown only when no subcategory selected) */}
            {!isSubcatActive && content.description && (
              <div className="mb-8 space-y-4 text-[15px] text-gray-600 leading-relaxed font-medium">
                {content.description.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}

            {/* Products Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-heading font-extrabold text-2xl tracking-tight">{productHeading}</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] mt-2 rounded-full" />
              </div>
              <div className="relative">
                <select className="appearance-none border border-gray-200 rounded-2xl px-5 py-3 text-sm text-heading font-bold pr-10 bg-white outline-none focus:ring-4 focus:ring-orange-50 cursor-pointer shadow-sm">
                  <option>Newest First</option>
                  <option>Oldest First</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Most Popular</option>
                </select>
                <ChevronRight size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#EE9C24] pointer-events-none rotate-90" strokeWidth={3} />
              </div>
            </div>

            {/* Cards grid — 6 default, 9 when subcategory active */}
            {productLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, idx) => (
                  <ProductCardSkeleton key={`skeleton-desktop-${idx}`} />
                ))}
              </div>
            ) : visibleProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 gap-6 border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/30">
                <Image src="/cart.png" alt="Empty" width={120} height={120} className="opacity-10 grayscale" />
                <div className="text-center">
                  <p className="text-gray-400 font-bold text-2xl mb-2">No products found matching your criteria</p>
                  <p className="text-gray-400/60 font-medium">Try adjusting your filters or selecting a different category</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
