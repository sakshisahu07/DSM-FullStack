import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import AffiliateService from './src/services/affiliateServices.js';
import affiliateModel from './src/model/affiliate.model.js';
import affiliateTierModel from './src/model/affiliateTier.model.js';
import categoryModel from './src/model/category.model.js';
import productModel from './src/model/product.model.js';
import variantModel from './src/model/variant.model.js';

async function testAffiliateCategoryTiers() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB");

        // 1. Get an approved affiliate
        const profile = await affiliateModel.findOne({ status: 'approved' });
        if (!profile) {
            console.log("No approved affiliate found.");
            process.exit(0);
        }
        
        // Remove current tier tracking to simulate fresh start
        profile.currentTierId = null;
        profile.tierGraceExpiresAt = null;
        profile.commissionPercent = null;
        await profile.save();

        // 2. Find an existing variant, product, and category
        const variant = await variantModel.findOne({});
        if (!variant) throw new Error("No variant found");
        const prod = await productModel.findById(variant.productId);
        if (!prod) throw new Error("No product found");
        const cat = await categoryModel.findById(prod.categoryId);
        if (!cat) throw new Error("No category found");

        // 3. Setup a tier with a default FLAT commission, but a PERCENTAGE category override
        await affiliateTierModel.deleteMany({});
        const tier = await affiliateTierModel.create({
            name: "Gold Tier",
            minSales: 1, 
            commissionType: "flat",
            commissionAmount: 150, // Default is Flat 150
            categories: [
                {
                    categoryId: cat._id,
                    commissionType: "percentage",
                    commissionAmount: 10, // 10%
                    maxCap: 50 // Cap at 50
                }
            ],
            isActive: true
        });

        console.log("Simulating order on the custom category (order amount = 1000)...");
        // 10% of 1000 is 100. Max cap is 50. So it should pay out exactly 50!
        const res = await AffiliateService.recordCommission({
            affiliateCode: profile.affiliateCode,
            orderId: new mongoose.Types.ObjectId(), 
            buyerId: new mongoose.Types.ObjectId(), 
            orderAmount: 1000,
            itemType: 'variant',
            itemId: variant._id
        });
        
        console.log("Category Override Result:", res ? {
            commissionAmount: res.commissionAmount,
            status: res.status
        } : "NULL");

        if (res && res.commissionAmount === 50) {
            console.log("SUCCESS! Category override and maxCap correctly applied.");
        } else {
            console.error("FAILED! Expected 50, got", res?.commissionAmount);
        }

        // Cleanup
        // No cleanup needed since we used existing DB items.

        process.exit(0);
    } catch (e) {
        console.error("Test failed:", e);
        process.exit(1);
    }
}

testAffiliateCategoryTiers();
