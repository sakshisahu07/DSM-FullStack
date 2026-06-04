import mongoose from "mongoose";

const appReferralConfigSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      default: true,
    },
    referrerRewardCoins: {
      type: Number,
      default: 500, // E.g. 500 coins = 50 Rs
    },
    referredRewardCoins: {
      type: Number,
      default: 100, // E.g. 100 coins = 10 Rs
    },
    referrerSignupWalletReward: {
      type: Number,
      default: 0,
    },
    referredSignupWalletReward: {
      type: Number,
      default: 0,
    },
    dynamicLinkDomain: {
      type: String,
      default: "", // E.g. "your_domain.page.link"
    },
    androidPackageName: {
      type: String,
      default: "", // E.g. "com.yourapp.android"
    },
  },
  { timestamps: true }
);

export default mongoose.model("appReferralConfig", appReferralConfigSchema);
