import {
  LayoutDashboard, Package, Megaphone, ShoppingCart, Handshake, Users,
  Building2, FileText, Settings, Bell, FolderKanban, Headphones, Share2
} from "lucide-react";

export type NavItem = { title: string; url: string };
export type NavGroup = { title: string; icon: typeof LayoutDashboard; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    title: "Products", icon: Package, items: [
      { title: "Dashboard", url: "/products/dashboard" },
      { title: "All Products", url: "/products/all" },
      { title: "Categories", url: "/products/categories" },
      { title: "Subcategories", url: "/products/subcategories" },
      { title: "Brands", url: "/products/brands" },
      { title: "ATL Kits", url: "/products/atl-kits" },
      { title: "Best Selling", url: "/products/best-selling" },
      { title: "New Arrival", url: "/products/new-arrival" },
    ],
  },
  {
    title: "Projects", icon: FolderKanban, items: [
      { title: "Dashboard", url: "/projects/dashboard" },
      { title: "All Projects", url: "/projects/all" },
    ],
  },
  {
    title: "Marketing", icon: Megaphone, items: [
      { title: "Flash Sales", url: "/marketing/flash-sales" },
      { title: "Combo Offers", url: "/marketing/combo-offers" },
      { title: "Hot Products", url: "/marketing/hot-deals" },
      { title: "Trending", url: "/marketing/trending" },
      { title: "Banners", url: "/marketing/banners" },
      { title: "Special Offers", url: "/marketing/special-offers" },
    ],
  },
  {
    title: "Orders", icon: ShoppingCart, items: [
      { title: "All Orders", url: "/orders/all" },
      { title: "Order Tracker", url: "/orders/tracker" },
      { title: "Invoices", url: "/orders/invoices" },
      { title: "Returns & Refunds", url: "/orders/returns" },
    ],
  },
  {
    title: "Affiliate", icon: Handshake, items: [
      { title: "Dashboard", url: "/affiliate/dashboard" },
      { title: "All Affiliates", url: "/affiliate/all" },
      { title: "KYC Approvals", url: "/affiliate/kyc" },
      { title: "Commission Tiers", url: "/affiliate/commission-tiers" },
      { title: "Payouts", url: "/affiliate/payouts" },
      { title: "Referral Tracking", url: "/affiliate/referral-tracking" },
    ],
  },
  {
    title: "Refer & Earn", icon: Share2, items: [
      { title: "App Referrals", url: "/refer-earn" },
    ],
  },
  {
    title: "Users", icon: Users, items: [
      { title: "All Users", url: "/users/all" },
      { title: "Membership", url: "/users/membership" },
      { title: "Role Management", url: "/users/roles" },
    ],
  },
  {
    title: "B2B & Services", icon: Building2, items: [
      { title: "Bulk Inquiries", url: "/b2b/inquiries" },
      { title: "Careers", url: "/b2b/careers" },
    ],
  },
  {
    title: "Content", icon: FileText, items: [
      { title: "Video Gallery", url: "/content/video-gallery" },
      { title: "Tutorials", url: "/content/tutorials" },
      { title: "Blog/News", url: "/content/blog" },
      { title: "FAQs", url: "/content/faq" },
    ],
  },
  {
    title: "Settings", icon: Settings, items: [
      { title: "Company Info", url: "/settings/company" },
      { title: "Contact Details", url: "/settings/contact" },
      { title: "Social Links", url: "/settings/social" },
      { title: "SEO", url: "/settings/seo" },
      { title: "Legal", url: "/settings/legal" },
      { title: "Payments", url: "/settings/payments" },
    ],
  },
];

export const dashboardItem = { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard };
export const notificationsItem = { title: "Notifications", url: "/notifications", icon: Bell };
export const liveSupportItem = { title: "Live Support", url: "/support", icon: Headphones };

// Flat list for command palette
export const allRoutes: { title: string; group: string; url: string }[] = [
  { title: "Dashboard", group: "Main", url: "/dashboard" },
  { title: "Notifications", group: "Main", url: "/notifications" },
  { title: "Live Support", group: "Main", url: "/support" },
  ...navGroups.flatMap((g) => g.items.map((i) => ({ title: i.title, group: g.title, url: i.url }))),
];
