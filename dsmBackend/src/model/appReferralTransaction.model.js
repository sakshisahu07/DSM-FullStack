import mongoose from "mongoose";

const appReferralTransactionSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true, // one referred user can only trigger a reward once
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
      default: null,
    },
    referrerCoinsAwarded: {
      type: Number,
      default: 0,
    },
    referredCoinsAwarded: {
      type: Number,
      default: 0,
    },
    referrerWalletAwarded: {
      type: Number,
      default: 0,
    },
    referredWalletAwarded: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "REWARDED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export default mongoose.model("appReferralTransaction", appReferralTransactionSchema);
