const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'win 11', 'Desktop', 'DSM-FullStack', 'dsm_web', 'app', 'cart', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Move Desktop Coupon Section
const desktopCouponStartTag = '{/* Coupon Section */}';
const desktopCouponEndStr = '                                    )}\r\n                                </div>';
// Wait, regex is safer.
const desktopCouponRegex = /\s*\{\/\* Coupon Section \*\/\}\s*<div className="pt-4 border-t border-gray-100 space-y-4 mb-8">[\s\S]*?\{\/\* Grand Total \*\/\}/;
const matchDesktop = content.match(desktopCouponRegex);
if (matchDesktop) {
    let desktopCouponBlock = matchDesktop[0].replace(/\s*\{\/\* Grand Total \*\/\}/, '');
    
    // Remove the block from its current location
    content = content.replace(desktopCouponBlock, '');
    
    // Insert it before "Order Summary" in Desktop View
    const desktopOrderSummaryAnchor = '<h2 className="text-2xl font-bold text-[#333333] mb-2">Order Summary</h2>';
    content = content.replace(desktopOrderSummaryAnchor, desktopCouponBlock + '\n\n                                ' + desktopOrderSummaryAnchor);
    console.log("Desktop coupon moved.");
} else {
    console.log("Desktop coupon block not found.");
}

// 2. Move Mobile Discount Section (Manual Coupon Input)
const mobileDiscountRegex = /\s*<div className="space-y-3">\s*<h3 className="text-sm font-bold text-\[#333333\]">Discount<\/h3>[\s\S]*?\{\/\* Bottom Sticky-style Summary Card \*\/\}/;
const matchMobile = content.match(mobileDiscountRegex);
if (matchMobile) {
    let mobileDiscountBlock = matchMobile[0].replace(/\s*\{\/\* Bottom Sticky-style Summary Card \*\/\}/, '');
    
    // Remove it from its current location
    content = content.replace(mobileDiscountBlock, '');
    
    // Insert it before "Order Summary" in Mobile View
    // The anchor in Mobile View is:
    // {/* Order Summary Table */}
    // <div className="space-y-4 pt-2">
    // <h2 className="text-xl font-bold text-[#333333]">Order Summary</h2>
    const mobileOrderSummaryAnchor = '{/* Order Summary Table */}';
    
    // We want to add it right before {/* Order Summary Table */}
    content = content.replace(mobileOrderSummaryAnchor, mobileDiscountBlock + '\n\n                        ' + mobileOrderSummaryAnchor);
    console.log("Mobile discount moved.");
} else {
    console.log("Mobile discount block not found.");
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Done");
