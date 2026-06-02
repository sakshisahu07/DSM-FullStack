import InvoiceService from "../services/invoiceServices.js";
import { handleApiRequest } from "../utils/apiResponse.js";
import Invoice from "../model/invoice.model.js";

export default class InvoiceController {
  static async generateInvoice(req, res) {
    return handleApiRequest(req, res, async () => {
      const { orderId } = req.params;
      const { type } = req.query; // ORDER or CANCELLATION
      const invoice = await InvoiceService.generateInvoice(orderId, type);
      return [{ data: invoice }, "Invoice generated successfully"];
    });
  }

  static async getInvoiceByOrder(req, res) {
    return handleApiRequest(req, res, async () => {
      const { orderId } = req.params;
      const invoice = await Invoice.findOne({ orderId }).sort({ createdAt: -1 });
      if (!invoice) return [null, "Invoice not found", 404];

      // Secure access: regular users can only view their own invoices
      const isAdmin = req.user.role?.name === "Super Admin" || req.user.role?.isSystemRole === true;
      if (!isAdmin && String(invoice.customerId) !== String(req.user._id)) {
        return [null, "Forbidden: You are not authorized to view this invoice", 403];
      }

      return [{ data: invoice }, "Invoice fetched"];
    });
  }

  static async getAllInvoices(req, res) {
    return handleApiRequest(req, res, async () => {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const isAdmin = req.user.role?.name === "Super Admin" || req.user.role?.isSystemRole === true;
      const filter = isAdmin ? {} : { customerId: req.user._id };

      const [data, total] = await Promise.all([
        Invoice.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("customerId", "firstName lastName email")
          .populate("orderId", "_id status"),
        Invoice.countDocuments(filter),
      ]);

      return [{
        data,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit),
        }
      }, "Invoices fetched"];
    });
  }

  static async updateInvoice(req, res) {
    return handleApiRequest(req, res, async () => {
      const { id } = req.params;
      const invoice = await InvoiceService.updateInvoice(id, req.body);
      return [{ data: invoice }, "Invoice updated successfully"];
    });
  }
}
