import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import AffiliateService from './src/services/affiliateServices.js';
import affiliateModel from './src/model/affiliate.model.js';
import affiliateTierModel from './src/model/affiliateTier.model.js';

async function testAffiliateTiers() {
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

        console.log("Found Affiliate:", profile.affiliateCode);
        
        // 2. Setup a tier
        await affiliateTierModel.deleteMany({});
        const tier = await affiliateTierModel.create({
            name: "Gold Tier",
            minSales: 1, // Any sale will match this tier
            commissionAmount: 150, // Flat ₹150
            benefits: ["Testing benefit"],
            isActive: true
        });
        console.log("Created Gold Tier with ₹150 flat commission");

        // 3. Simulate an order commission
        console.log("Simulating order commission (order amount = 50)...");
        const res = await AffiliateService.recordCommission({
            affiliateCode: profile.affiliateCode,
            orderId: new mongoose.Types.ObjectId(), // Fake order ID
            buyerId: new mongoose.Types.ObjectId(), // Fake buyer ID
            orderAmount: 50,
            itemType: 'variant',
            itemId: new mongoose.Types.ObjectId()
        });
        
        console.log("recordCommission result:", res ? {
            commissionAmount: res.commissionAmount,
            status: res.status
        } : "NULL");

        // 4. Check wallet
        const updatedProfile = await affiliateModel.findById(profile._id);
        console.log("New Wallet Balance: Rs.", updatedProfile.walletBalance);
        console.log("Current Tier ID:", updatedProfile.currentTierId);
        
        if (updatedProfile.currentTierId && updatedProfile.currentTierId.toString() === tier._id.toString()) {
            console.log("Tier successfully updated to Gold Tier!");
        }

        process.exit(0);
    } catch (e) {
        console.error("Test failed:", e);
        process.exit(1);
    }
}

testAffiliateTiers();
