import Joi from "joi";

// ── Send OTP ──────────────────────────────────────────────────────────────────
export const sendOtpSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\d{10}$/)    // 10-digit number (any digits; use /^[6-9]\d{9}$/ for Indian mobile only)
    .required()
    .messages({
      "string.pattern.base": "Enter a valid 10-digit mobile number",
      "any.required": "Phone number is required",
    }),
});

// ── Verify OTP ────────────────────────────────────────────────────────────────
export const verifyOtpSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\d{10}$/)    // 10-digit number (any digits)
    .required(),
  otp: Joi.string().min(4).max(6).pattern(/^\d+$/).required().messages({
    "string.min": "OTP must be at least 4 digits",
    "string.max": "OTP must be at most 6 digits",
    "string.pattern.base": "OTP must be numeric",
  }),
});

// ── Register Affiliate ────────────────────────────────────────────────────────
export const registerAffiliateSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  // phone is optional here — already verified via OTP, service uses user.number as fallback
  phone: Joi.string()
    .trim()
    .pattern(/^\d{10}$/)
    .optional()
    .allow(null, ""),
  email: Joi.string().trim().email({ tlds: { allow: false } }).required(),
  dob: Joi.date().max("now").optional().allow(null, ""),
  gender: Joi.string()
    .valid("male", "female", "other")
    .optional()
    .allow(null, ""),

  // business - optional
  gstNumber: Joi.string()
    .trim().uppercase()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .optional()
    .allow(null, "")
    .messages({ "string.pattern.base": "Invalid GST number format" }),
  companyName: Joi.string().trim().max(100).optional().allow(null, ""),

  // KYC — auto-uppercase so users can enter lowercase
  panNumber: Joi.string()
    .trim().uppercase()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid PAN format. Expected format: ABCDE1234F",
    }),
  adharNumber: Joi.string()
    .trim()
    .pattern(/^\d{12}$/)
    .required()
    .messages({
      "string.pattern.base": "Aadhaar must be exactly 12 digits",
      "any.required": "Aadhaar number is required",
    }),

  // Bank
  accountNumber: Joi.string()
    .trim()
    .min(6)          // relaxed from 9 — some cooperative banks have short account numbers
    .max(18)
    .pattern(/^\d+$/)
    .required()
    .messages({ "string.pattern.base": "Account number must be numeric" }),
  ifscCode: Joi.string()
    .trim().uppercase()
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid IFSC format. Expected format: SBIN0001234",
    }),
  accountHolder: Joi.string().trim().min(2).max(100).required(),

  // Optional payout info
  upiId: Joi.string().trim().optional().allow(null, ""),
  dsmUserId: Joi.string().trim().optional().allow(null, ""),
});

// ── Withdrawal ────────────────────────────────────────────────────────────────
export const withdrawalSchema = Joi.object({
  amount: Joi.number().min(100).required().messages({
    "number.min": "Minimum withdrawal amount is ₹100",
  }),
  method: Joi.string().valid("upi", "bank", "dsm").required(),

  // UPI fields — required when method = upi
  upiId: Joi.when("method", {
    is: "upi",
    then: Joi.string()
      .required()
      .messages({ "any.required": "UPI ID is required" }),
    otherwise: Joi.optional().allow(null, ""),
  }),

  // Bank fields — required when method = bank
  accountNumber: Joi.when("method", {
    is: "bank",
    then: Joi.string().min(9).max(18).pattern(/^\d+$/).required(),
    otherwise: Joi.optional().allow(null, ""),
  }),
  ifscCode: Joi.when("method", {
    is: "bank",
    then: Joi.string()
      .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
      .required(),
    otherwise: Joi.optional().allow(null, ""),
  }),
  accountHolder: Joi.when("method", {
    is: "bank",
    then: Joi.string().min(2).max(100).required(),
    otherwise: Joi.optional().allow(null, ""),
  }),
  transferMode: Joi.when("method", {
    is: "bank",
    then: Joi.string().valid("IMPS", "NEFT", "RTGS").required(),
    otherwise: Joi.optional().allow(null, ""),
  }),

  // DSM fields — required when method = dsm
  dsmUserId: Joi.when("method", {
    is: "dsm",
    then: Joi.string()
      .required()
      .messages({ "any.required": "DSM User ID is required" }),
    otherwise: Joi.optional().allow(null, ""),
  }),
});

// ── Admin: process withdrawal ─────────────────────────────────────────────────
export const processWithdrawalSchema = Joi.object({
  action: Joi.string().valid("approve", "reject").required(),
  adminNote: Joi.string().max(500).optional().allow(null, ""),
});

// ── Admin: set commission ─────────────────────────────────────────────────────
export const commissionSchema = Joi.object({
  commissionPercent: Joi.number().min(0).max(100).allow(null).required(),
});

// ── Admin: reject affiliate ───────────────────────────────────────────────────
// ── Admin: reject affiliate ───────────────────────────────────────────────────
export const rejectSchema = Joi.object({
  reason: Joi.string().min(5).max(500).required().messages({
    "any.required": "Rejection reason is required",
  }),
});

// ── Admin: create tier ────────────────────────────────────────────────────────
export const createTierSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  minSales: Joi.number().min(0).required(),
  commissionAmount: Joi.number().min(0).required(),
  benefits: Joi.array().items(Joi.string().trim()).optional(),
  isActive: Joi.boolean().optional(),
  themeColor: Joi.string().optional().allow(null, ""),
});

// ── Admin: update tier ────────────────────────────────────────────────────────
export const updateTierSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  minSales: Joi.number().min(0).optional(),
  commissionAmount: Joi.number().min(0).optional(),
  benefits: Joi.array().items(Joi.string().trim()).optional(),
  isActive: Joi.boolean().optional(),
  themeColor: Joi.string().optional().allow(null, ""),
});
