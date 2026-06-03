/**
 * Diagnostic script to check why hotDeals, flashSales, specialOffers are empty in /home API
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URL || process.env.MONGO_URI || process.env.MONGODB_URI;

const variantSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId },
  hotDeal: { type: Boolean, default: false },
  flashSale: { type: Boolean, default: false },
  specialOffer: { type: Boolean, default: false },
  disable: { type: Boolean, default: false },
  mrp: Number,
  finalPrice: Number,
  discount: Number,
}, { timestamps: true });

const hotDealSchema = new mongoose.Schema({
  title: String,
  type: String,
  products: [mongoose.Schema.Types.ObjectId],
  variants: [mongoose.Schema.Types.ObjectId],
  combos: [mongoose.Schema.Types.ObjectId],
  discountType: String,
  discountValue: Number,
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
}, { timestamps: true });

const flashSaleSchema = new mongoose.Schema({
  title: String,
  products: [mongoose.Schema.Types.ObjectId],
  variants: [mongoose.Schema.Types.ObjectId],
  combos: [mongoose.Schema.Types.ObjectId],
  discountType: String,
  discountValue: Number,
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
}, { timestamps: true });

const specialOfferSchema = new mongoose.Schema({
  title: String,
  products: [mongoose.Schema.Types.ObjectId],
  variants: [mongoose.Schema.Types.ObjectId],
  discountType: String,
  discountValue: Number,
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
}, { timestamps: true });

const Variant = mongoose.model("variant", variantSchema);
const HotDeal = mongoose.model("hotDeal", hotDealSchema);
const FlashSale = mongoose.model("flashSale", flashSaleSchema);
const SpecialOffer = mongoose.model("specialOffer", specialOfferSchema);

async function main() {
  console.log("Connecting to:", MONGO_URI?.substring(0, 40) + "...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  // 1. Check variants with flags
  const hotDealVariants = await Variant.find({ hotDeal: true }).lean();
  const flashSaleVariants = await Variant.find({ flashSale: true }).lean();
  const specialOfferVariants = await Variant.find({ specialOffer: true }).lean();
  
  console.log(`🔥 Variants with hotDeal=true: ${hotDealVariants.length}`);
  console.log(`⚡ Variants with flashSale=true: ${flashSaleVariants.length}`);
  console.log(`🌟 Variants with specialOffer=true: ${specialOfferVariants.length}`);

  // 2. Check disabled status
  const hotDealEnabled = hotDealVariants.filter(v => !v.disable);
  const flashSaleEnabled = flashSaleVariants.filter(v => !v.disable);
  const specialOfferEnabled = specialOfferVariants.filter(v => !v.disable);
  
  console.log(`\n✅ After filtering disable=false:`);
  console.log(`   hotDeal: ${hotDealEnabled.length} variants`);
  console.log(`   flashSale: ${flashSaleEnabled.length} variants`);
  console.log(`   specialOffer: ${specialOfferEnabled.length} variants`);

  // 3. Check all HotDeals in DB
  const hotDeals = await HotDeal.find({}).lean();
  console.log(`\n📦 Total HotDeals in DB: ${hotDeals.length}`);
  hotDeals.forEach(d => {
    const now = new Date();
    const expired = d.endDate < now;
    console.log(`   title: "${d.title}", isActive: ${d.isActive}, products: ${d.products?.length || 0}, variants: ${d.variants?.length || 0}, expired: ${expired}`);
    console.log(`     startDate: ${d.startDate}, endDate: ${d.endDate}`);
  });

  // 4. Check all FlashSales in DB
  const flashSales = await FlashSale.find({}).lean();
  console.log(`\n📦 Total FlashSales in DB: ${flashSales.length}`);
  flashSales.forEach(d => {
    const now = new Date();
    const expired = d.endDate < now;
    console.log(`   title: "${d.title}", isActive: ${d.isActive}, products: ${d.products?.length || 0}, variants: ${d.variants?.length || 0}, expired: ${expired}`);
    console.log(`     startDate: ${d.startDate}, endDate: ${d.endDate}`);
  });

  // 5. Check all SpecialOffers in DB
  const specialOffers = await SpecialOffer.find({}).lean();
  console.log(`\n📦 Total SpecialOffers in DB: ${specialOffers.length}`);
  specialOffers.forEach(d => {
    const now = new Date();
    const expired = d.endDate < now;
    console.log(`   title: "${d.title}", isActive: ${d.isActive}, products: ${d.products?.length || 0}, variants: ${d.variants?.length || 0}, expired: ${expired}`);
    console.log(`     startDate: ${d.startDate}, endDate: ${d.endDate}`);
  });

  // 6. Total variants
  const totalVariants = await Variant.countDocuments();
  console.log(`\n📊 Total variants in DB: ${totalVariants}`);
  
  // Show a sample variant
  const sampleVariant = await Variant.findOne({}).lean();
  if (sampleVariant) {
    console.log(`\n🔍 Sample variant fields:`, JSON.stringify(sampleVariant, null, 2));
  }

  await mongoose.disconnect();
  console.log("\n✅ Done");
}

main().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
