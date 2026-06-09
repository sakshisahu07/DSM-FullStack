import Razorpay from "razorpay";
import companyModel from "../model/company.model.js";

const getRazorpayInstance = async () => {
  const company = await companyModel.findOne();
  
  const key_id = company?.razorpayKeyId?.trim() || (process.env.RAZORPAY_KEY_ID || "").trim();
  const key_secret = company?.razorpayKeySecret?.trim() || (process.env.RAZORPAY_KEY_SECRET || "").trim();
  
  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials are not configured in Company Settings or environment variables.");
  }
  
  return new Razorpay({ key_id, key_secret });
};

export { getRazorpayInstance };