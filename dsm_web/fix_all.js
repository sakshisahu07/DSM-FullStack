const fs = require('fs');
const path = require('path');
const file = path.join('c:', 'Users', 'win 11', 'Desktop', 'DSM-FullStack', 'dsm_web', 'app', 'cart', 'page.tsx');
let c = fs.readFileSync(file, 'utf-8');

// 1. Fix Mobile "View Coupons" toggle to actually be an interactive dropdown.
const mobileViewCouponsToggleRegex = /<div className="text-right">\s*<button className="text-\[11px\] font-bold text-\[#333333\] underline">View Coupons<\/button>\s*<\/div>/;
const mobileViewCouponsReplacement = `<div className="text-right">
                                <button onClick={() => setShowCouponList(!showCouponList)} className="text-[11px] font-bold text-[#333333] underline">
                                    {showCouponList ? 'Hide Coupons' : 'View Coupons'}
                                </button>
                            </div>
                            
                            {showCouponList && (
                                <div className="bg-[#FBFAFA] rounded-3xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {apiCoupons.length > 0 ? apiCoupons.map((coupon, idx) => {
                                        const isExpired = !coupon.isActive || (new Date(coupon.endDate) < new Date());
                                        return (
                                        <div key={idx} className={\`bg-white rounded-2xl border flex overflow-hidden shadow-sm \${isExpired ? 'border-gray-100 opacity-60 grayscale' : 'border-[#FBE9D9]'}\`}>
                                            <div className="flex-1 p-4 space-y-1">
                                                <h4 className="font-bold text-[#E47B25] text-sm">{coupon.code}</h4>
                                                <p className="text-[#333333] text-[11px] font-medium">
                                                    {coupon.description || \`Get \${coupon.discountType === 'percentage' ? \`\${coupon.discountValue}% OFF\` : \`₹\${coupon.discountValue} OFF\`}\`}
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-medium">
                                                    {coupon.minPurchaseAmount > 0 ? \`Valid on orders above ₹\${coupon.minPurchaseAmount}\` : 'No minimum order'}
                                                </p>
                                                <p className="text-[9px] text-gray-400 italic">Valid until {new Date(coupon.endDate).toLocaleDateString()}</p>
                                            </div>
                                            {summary?.couponCode === coupon.code ? (
                                                <div className="relative w-24 flex items-center justify-center bg-[#FBE9D9]/50 border-l border-dashed border-[#FBE9D9]">
                                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FBFAFA] rounded-full" />
                                                    <span className="font-bold text-[#CD9264] text-sm">Applied</span>
                                                </div>
                                            ) : isExpired ? (
                                                <div className="relative w-24 flex items-center justify-center bg-gray-200 text-gray-500 border-l border-dashed border-gray-300">
                                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FBFAFA] rounded-full" />
                                                    <span className="font-bold text-sm">Expired</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleApplyCoupon(coupon.code)}
                                                    className="relative w-24 bg-gradient-to-b from-[#EE9C24] to-[#B3520A] flex items-center justify-center text-white border-l border-dashed border-white/20 active:scale-95 transition-all"
                                                >
                                                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FBFAFA] rounded-full" />
                                                    <span className="font-bold text-sm">Apply</span>
                                                </button>
                                            )}
                                        </div>
                                        );
                                    }) : (
                                        <div className="text-center p-4 text-gray-500 text-sm">
                                            No coupons available at the moment.
                                        </div>
                                    )}
                                </div>
                            )}`;

if(mobileViewCouponsToggleRegex.test(c)) {
    c = c.replace(mobileViewCouponsToggleRegex, mobileViewCouponsReplacement);
}

// 2. Add inline error message and styling to Desktop coupon input
const desktopInputRegex = /<div className="flex flex-col sm:flex-row gap-2">\s*<input\s*type="text"\s*placeholder="Enter code \(e\.g\. SAVE2026\)"[\s\S]*?Apply Coupon\s*<\/button>\s*<\/div>/;
const desktopInputReplacement = `<div className="flex flex-col gap-1.5">
                                            {isCouponError && (
                                                <span className="text-red-500 text-xs font-semibold px-1">Invalid or expired coupon code</span>
                                            )}
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter code (e.g. SAVE2026)"
                                                    value={couponInput}
                                                    onChange={(e) => {
                                                        setCouponInput(e.target.value.toUpperCase());
                                                        if (isCouponError) setIsCouponError(false);
                                                    }}
                                                    className={\`flex-1 text-[#333333] border \${isCouponError ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-100 focus:ring-[#EE9C24]/20'} rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2\`}
                                                />
                                                <button
                                                    onClick={() => handleApplyCoupon(couponInput)}
                                                    className="bg-gradient-to-b from-[#EE9C24] to-[#B3520A] text-white px-6 py-3 rounded-md font-bold text-sm shadow-sm hover:shadow-md transition-all active:scale-95 leading-none"
                                                >
                                                    Apply Coupon
                                                </button>
                                            </div>
                                        </div>`;
if(desktopInputRegex.test(c)) {
    c = c.replace(desktopInputRegex, desktopInputReplacement);
}

// 3. Add inline error message and styling to Mobile coupon input
const mobileInputRegex = /<div className="flex gap-2 h-12">\s*<input\s*type="text"\s*placeholder="Enter code \(e\.g\. SAVE2026\)"[\s\S]*?Apply Coupon\s*<\/button>\s*<\/div>/;
const mobileInputReplacement = `<div className="flex flex-col gap-1.5">
                                        {isCouponError && (
                                            <span className="text-red-500 text-[10px] font-semibold px-1">Invalid or expired coupon code</span>
                                        )}
                                        <div className="flex gap-2 h-12">
                                            <input
                                                type="text"
                                                placeholder="Enter code (e.g. SAVE2026)"
                                                value={couponInput}
                                                onChange={(e) => {
                                                    setCouponInput(e.target.value.toUpperCase());
                                                    if (isCouponError) setIsCouponError(false);
                                                }}
                                                className={\`flex-1 bg-white border \${isCouponError ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-100 focus:ring-[#EE9C24]/20'} rounded-md px-4 text-xs font-medium focus:outline-none focus:ring-1 text-[#333333]\`}
                                            />
                                            <button
                                                onClick={() => handleApplyCoupon(couponInput)}
                                                className="bg-gradient-to-r from-[#B3520A] to-[#EE9C24] text-white px-4 rounded-md font-bold text-xs shadow-sm active:scale-95 transition-transform"
                                            >
                                                Apply Coupon
                                            </button>
                                        </div>
                                    </div>`;

if(mobileInputRegex.test(c)) {
    c = c.replace(mobileInputRegex, mobileInputReplacement);
}

// 4. Move Desktop Coupon Section ABOVE Order Summary
const desktopCouponRegex = /\s*\{\/\* Coupon Section \*\/\}\s*<div className="pt-4 border-t border-gray-100 space-y-4 mb-8">[\s\S]*?\{\/\* Grand Total \*\/\}/;
const matchDesktop = c.match(desktopCouponRegex);
if (matchDesktop) {
    let desktopCouponBlock = matchDesktop[0].replace(/\s*\{\/\* Grand Total \*\/\}/, '');
    c = c.replace(desktopCouponBlock, '');
    const desktopOrderSummaryAnchor = '<h2 className="text-2xl font-bold text-[#333333] mb-2">Order Summary</h2>';
    c = c.replace(desktopOrderSummaryAnchor, desktopCouponBlock.trim() + '\n\n                                ' + desktopOrderSummaryAnchor);
}

// 5. Move Mobile Discount Section ABOVE Order Summary
const mobileDiscountRegex = /\s*<div className="space-y-3">\s*<h3 className="text-sm font-bold text-\[#333333\]">Discount<\/h3>[\s\S]*?\{\/\* Bottom Sticky-style Summary Card \*\/\}/;
const matchMobile = c.match(mobileDiscountRegex);
if (matchMobile) {
    let mobileDiscountBlock = matchMobile[0].replace(/\s*\{\/\* Bottom Sticky-style Summary Card \*\/\}/, '');
    c = c.replace(mobileDiscountBlock, '');
    const mobileOrderSummaryAnchor = '{/* Order Summary Table */}';
    c = c.replace(mobileOrderSummaryAnchor, mobileDiscountBlock.trim() + '\n\n                        ' + mobileOrderSummaryAnchor);
}

fs.writeFileSync(file, c, 'utf-8');
console.log("Successfully fixed app/cart/page.tsx");
