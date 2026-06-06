"use client";

import { usePathname } from 'next/navigation';
import RelatedProducts from "@/components/products/RelatedProducts";
import FeatureHighlights from "@/components/shared/FeatureHighlights";

export default function GlobalBottomSections() {
    const pathname = usePathname() || '';

    // Do not show related products and features on the login page and ATL Kits page
    if (pathname === '/login' || pathname.startsWith('/atl-kits')) return null;

    const isProfileRoute = pathname.startsWith('/profile') || pathname === '/view-invoices' || pathname === '/my-wishlist' || pathname === '/my-orders' || pathname === '/track-order' || pathname === '/affiliate-dashboard' || pathname === '/refer-earn' || pathname === '/payments-wallet' || pathname.startsWith('/membership');
    const isCustomHeaderPage = pathname === '/faq' || pathname === '/about-us' || pathname === '/contact-us' || pathname === '/affiliate' || pathname === '/bulk-inquiry' || pathname === '/support-policy' || pathname === '/return-policy' || pathname === '/privacy-policy' || pathname === '/terms' || pathname === '/shipping-delivery';
    const isBlogListingRoute = pathname === '/blog';
    const isVideoGalleryRoute = pathname === '/video-gallery';
    const isProjectRoute = pathname === '/project';
    const isCareerRoute = pathname === '/career';
    const isCartRoute = pathname === '/cart';
    const isCheckoutRoute = pathname === '/checkout';
    const isBlogDetailRoute = pathname.startsWith('/blog/') && pathname.split('/').length === 3;
    const isProjectDetailRoute = pathname.startsWith('/project/') && pathname.split('/').length === 3;
    const isCareerDetailRoute = pathname.startsWith('/career/') && pathname.split('/').length === 3;

    return (
        <section className={`bg-white ${(isCustomHeaderPage || isProfileRoute || isBlogListingRoute || isVideoGalleryRoute || isProjectRoute || isCareerRoute || isCartRoute || isCheckoutRoute || isBlogDetailRoute || isProjectDetailRoute || isCareerDetailRoute) ? 'hidden md:block' : ''}`}>
            <div className="mb-12 md:mb-0">
                <RelatedProducts />
                <div className="mt-0 md:mt-16" />
                <FeatureHighlights />
            </div>
        </section>
    );
}
