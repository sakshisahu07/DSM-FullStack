import userModel from "../model/user.model.js";
import AppReferralTransaction from "../model/appReferralTransaction.model.js";
import AppReferralConfig from "../model/appReferralConfig.model.js";
import WalletService from "../services/wallteServices.js";

export default class AppReferralService {
  static async processFirstOrderReward(userId, orderId, session) {
    try {
      const user = await userModel.findById(userId).session(session);
      if (!user) return;

      // Check if they have a referrer and haven't received a reward yet
      if (user.referredBy && !user.isReferralRewardGiven) {
        // Mark as given so we don't reward twice
        user.isReferralRewardGiven = true;
        await user.save({ session });

        // Get config
        const config = await AppReferralConfig.findOne().session(session);
        if (!config || !config.isActive) return;

        const referrerCoins = config.referrerRewardCoins || 0;
        const referredCoins = config.referredRewardCoins || 0;

        // Reward the Referrer
        if (referrerCoins > 0) {
          await WalletService.creditCoins(
            user.referredBy,
            referrerCoins,
            orderId,
            session
          );
        }

        // Reward the Referred User (welcome bonus)
        if (referredCoins > 0) {
          await WalletService.creditCoins(
            userId,
            referredCoins,
            orderId,
            session
          );
        }

        // Update the AppReferralTransaction to REWARDED
        await AppReferralTransaction.findOneAndUpdate(
          { referredUserId: userId, status: "PENDING" },
          {
            $set: {
              status: "REWARDED",
              orderId: orderId,
              referrerCoinsAwarded: referrerCoins,
              referredCoinsAwarded: referredCoins,
            },
          },
          { session }
        );
      }
    } catch (err) {
      console.error("Error processing first order referral reward:", err.message);
    }
  }
}
