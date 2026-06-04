import { handleApiRequest, AppError } from "../utils/apiResponse.js";
import AppReferralConfig from "../model/appReferralConfig.model.js";
import AppReferralTransaction from "../model/appReferralTransaction.model.js";
import userModel from "../model/user.model.js";

export default class AppReferralController {
  // ================= ADMIN APIS =================

  static async getConfig(req, res) {
    return handleApiRequest(req, res, async () => {
      let config = await AppReferralConfig.findOne();
      if (!config) {
        config = await AppReferralConfig.create({});
      }
      return [{ data: config }, "Referral config fetched successfully"];
    });
  }

  static async updateConfig(req, res) {
    return handleApiRequest(req, res, async () => {
      let config = await AppReferralConfig.findOne();
      if (!config) {
        config = await AppReferralConfig.create(req.body);
      } else {
        Object.assign(config, req.body);
        await config.save();
      }
      return [{ data: config }, "Referral config updated successfully"];
    });
  }

  static async getTransactions(req, res) {
    return handleApiRequest(req, res, async () => {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const transactions = await AppReferralTransaction.find()
        .populate("referrerId", "firstName lastName email number")
        .populate("referredUserId", "firstName lastName email number")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await AppReferralTransaction.countDocuments();

      return [
        {
          data: transactions,
          pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        },
        "Referral transactions fetched successfully",
      ];
    });
  }

  // ================= USER APIS =================

  static async getMyStats(req, res) {
    return handleApiRequest(req, res, async () => {
      const userId = req.user._id;

      const user = await userModel.findById(userId).select("referralCode");
      let referralCode = user?.referralCode;

      // Auto-generate if missing
      if (!referralCode) {
        const crypto = await import("crypto");
        referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
        await userModel.findByIdAndUpdate(userId, { referralCode });
      }

      const transactions = await AppReferralTransaction.find({ referrerId: userId })
        .populate("referredUserId", "firstName lastName createdAt")
        .sort({ createdAt: -1 })
        .lean();

      let totalEarned = 0;
      const referrals = transactions.map((t) => {
        totalEarned += t.referrerCoinsAwarded || 0;
        return {
          id: t._id,
          referredUser: t.referredUserId ? `${t.referredUserId.firstName} ${t.referredUserId.lastName}` : "Unknown",
          dateJoined: t.referredUserId?.createdAt,
          status: t.status, // PENDING or REWARDED
          coinsAwarded: t.referrerCoinsAwarded,
        };
      });

      return [
        {
          data: {
            referralCode,
            totalReferrals: transactions.length,
            totalEarned,
            referrals,
          },
        },
        "My referral stats fetched",
      ];
    });
  }

  // Generate Firebase Dynamic Link (Optional utility if frontend needs it)
  static async generateDynamicLink(req, res) {
    return handleApiRequest(req, res, async () => {
      const userId = req.user._id;
      const user = await userModel.findById(userId).select("referralCode");

      const config = await AppReferralConfig.findOne();
      if (!config || !config.dynamicLinkDomain) {
        throw new AppError("Dynamic link configuration is missing from admin panel.", 400);
      }

      const domain = config.dynamicLinkDomain; // e.g. https://yourapp.page.link
      const apn = config.androidPackageName; // e.g. com.yourapp.android
      const fallbackUrl = `https://dsmelectro.com/signup?ref=${user.referralCode}`;

      // Typical Firebase dynamic link format without using the REST API (manual construction):
      // https://[domain]/?link=[your_link]&apn=[package_name]
      const dynamicLink = `${domain}/?link=${encodeURIComponent(fallbackUrl)}&apn=${apn}`;

      return [{ data: { link: dynamicLink } }, "Dynamic link generated"];
    });
  }
}
