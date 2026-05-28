'use client';

import React, { useState, useCallback } from 'react';
import { ProfileSidebar, MobileProfileLayout } from '@/components/profile';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

/* ──────────────── Invoice PDF Download Helper ──────────────────── */
function downloadInvoice(invoice: typeof mockInvoices[0]) {
  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Invoice ${invoice.invoiceNo}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#333;padding:40px;max-width:800px;margin:auto}
  .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #E47B25;padding-bottom:20px;margin-bottom:30px}
  .logo{font-size:28px;font-weight:800;background:linear-gradient(135deg,#E47B25,#B3520A);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .logo-sub{font-size:11px;color:#888;margin-top:2px}
  .invoice-title{text-align:right}
  .invoice-title h1{font-size:26px;color:#E47B25;text-transform:uppercase;letter-spacing:2px}
  .invoice-title p{font-size:13px;color:#666;margin-top:4px}
  .badge{display:inline-block;padding:4px 16px;border-radius:20px;font-size:12px;font-weight:600;margin-top:6px}
  .badge.active{background:#e8f8ec;color:#34C759}
  .badge.completed{background:#e3f1ff;color:#0088FF}
  .meta{display:flex;justify-content:space-between;margin-bottom:28px}
  .meta-box{width:48%}
  .meta-box h4{font-size:13px;color:#E47B25;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:700}
  .meta-box p{font-size:13px;color:#444;line-height:1.7}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  th{background:#f8f8f8;text-align:left;padding:10px 14px;font-size:12px;text-transform:uppercase;color:#666;border-bottom:2px solid #eee}
  td{padding:10px 14px;font-size:13px;border-bottom:1px solid #f0f0f0}
  .text-right{text-align:right}
  .summary{width:320px;margin-left:auto;margin-bottom:28px}
  .summary-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px}
  .summary-row.total{border-top:2px solid #E47B25;margin-top:8px;padding-top:12px;font-size:16px;font-weight:700;color:#222}
  .discount{color:#FF3B30}
  .saved{color:#34C759}
  .tax-section{background:#fafafa;border-radius:8px;padding:16px;margin-bottom:24px;font-size:13px}
  .tax-section h4{font-size:13px;font-weight:700;margin-bottom:8px;color:#E47B25}
  .payment{border:1px solid #eee;border-radius:8px;padding:14px;margin-bottom:28px;font-size:13px}
  .notes{background:#fffaf5;border-left:3px solid #E47B25;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:30px}
  .notes p{font-size:12px;color:#666;line-height:1.8}
  .footer{text-align:center;border-top:2px solid #f0f0f0;padding-top:20px;font-size:11px;color:#999}
  @media print{body{padding:20px}}
</style>
</head><body>
  <div class="header">
    <div><div class="logo">DSM Store</div><div class="logo-sub">Electronics & Components</div></div>
    <div class="invoice-title">
      <h1>Invoice</h1>
      <p><strong>Order:</strong> ${invoice.id}</p>
      <p><strong>Invoice #:</strong> ${invoice.invoiceNo}</p>
      <p><strong>Date:</strong> ${invoice.dateTime}</p>
      <span class="badge ${invoice.statusType}">${invoice.status}</span>
    </div>
  </div>

  <div class="meta">
    <div class="meta-box">
      <h4>Bill To</h4>
      <p><strong>Aisha Sheikh</strong><br/>aisha@email.com<br/>+91 XXXXX XXXXX<br/>House No XX, Area Name<br/>Bhopal, MP – 4620XX India</p>
    </div>
    <div class="meta-box">
      <h4>Ship To</h4>
      <p>Same as Billing Address</p>
      <br/>
      <h4>Delivery</h4>
      <p>3–5 Business Days<br/>Mode: By Air | Weight: 1.8 kg</p>
    </div>
  </div>

  <table>
    <thead><tr><th>#</th><th>Product</th><th>Description</th><th class="text-right">MRP</th><th class="text-right">Price</th></tr></thead>
    <tbody>
      <tr><td>1</td><td>Bluetooth HC-05 Module</td><td>Bluetooth 4.0 NRF51822</td><td class="text-right">₹473</td><td class="text-right">₹273</td></tr>
      <tr><td>2</td><td>Bluetooth HC-05 Module</td><td>Bluetooth 4.0 NRF51822</td><td class="text-right">₹473</td><td class="text-right">₹273</td></tr>
      <tr><td>3</td><td>Bluetooth HC-05 Module</td><td>Bluetooth 4.0 NRF51822</td><td class="text-right">₹473</td><td class="text-right">₹273</td></tr>
    </tbody>
  </table>

  <div class="summary">
    <div class="summary-row"><span>Items Total (incl. GST)</span><span>₹1,365.00</span></div>
    <div class="summary-row"><span>Items Quantity</span><span>4 items</span></div>
    <div class="summary-row"><span>Discount</span><span class="discount">-₹1,365.00</span></div>
    <div class="summary-row"><span>Coupon Applied</span><span class="discount">-₹1,365.00</span></div>
    <div class="summary-row"><span>Saved</span><span class="saved">+₹200</span></div>
    <div class="summary-row"><span><strong>Subtotal</strong></span><span><strong>₹1,365.00</strong></span></div>
    <div class="summary-row"><span>Delivery Fee</span><span>₹150.00</span></div>
    <div class="summary-row total"><span>Grand Total</span><span>₹1,515.78</span></div>
  </div>

  <div class="tax-section">
    <h4>Tax Details</h4>
    <div class="summary-row"><span>CGST (9%)</span><span>₹71.28</span></div>
    <div class="summary-row"><span>SGST (9%)</span><span>₹71.28</span></div>
    <p style="margin-top:8px"><strong>GSTIN:</strong> 23XXXXXXXXXX1Z5</p>
  </div>

  <div class="payment"><strong>Paid With:</strong> Google Pay (10% Discount Applied)</div>

  <div class="notes">
    <p>• All prices include applicable GST.<br/>• Products sold are genuine and quality tested.<br/>• Warranty applicable as per product policy.<br/>• This is a computer-generated invoice.</p>
  </div>

  <div class="footer">
    <p>Thank you for shopping with DSM Store!</p>
    <p style="margin-top:4px">For queries, contact support@dsmstore.com</p>
  </div>
</body></html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
  }
}

/* ─────────────────────────── mock data ─────────────────────────── */
const mockInvoices = [
  { id: 'ORDR-12345', invoiceNo: '123', status: 'Active',    statusType: 'active',    dateTime: '30 July 2026 | 15:30 PM' },
  { id: 'ORDR-12346', invoiceNo: '124', status: 'Completed', statusType: 'completed', dateTime: '30 July 2026 | 15:30 PM' },
  { id: 'ORDR-12347', invoiceNo: '125', status: 'Active',    statusType: 'active',    dateTime: '30 July 2026 | 15:30 PM' },
  { id: 'ORDR-12348', invoiceNo: '126', status: 'Completed', statusType: 'completed', dateTime: '30 July 2026 | 15:30 PM' },
  { id: 'ORDR-12349', invoiceNo: '127', status: 'Active',    statusType: 'active',    dateTime: '30 July 2026 | 15:30 PM' },
  { id: 'ORDR-12350', invoiceNo: '128', status: 'Completed', statusType: 'completed', dateTime: '30 July 2026 | 15:30 PM' },
];

const mockProducts = [
  {
    id: 1,
    name: 'Bluetooth HC-05 Wireless UART Module',
    description: 'Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ipsume.lorem...',
    price: 273,
    originalPrice: 473,
    image: '/bluetooth.png',
  },
  {
    id: 2,
    name: 'Bluetooth HC-05 Wireless UART Module',
    description: 'Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ipsume.lorem...',
    price: 273,
    originalPrice: 473,
    image: '/bluetooth.png',
  },
  {
    id: 3,
    name: 'Bluetooth HC-05 Wireless UART Module',
    description: 'Bluetooth 4.0 Module NRF51822 lrem ipsume lrem ipsume.lorem...',
    price: 273,
    originalPrice: 473,
    image: '/bluetooth.png',
  },
];

/* ─────────────────────────── Invoice List Card ─────────────────── */
function InvoiceCard({
  invoice,
  onView,
}: {
  invoice: typeof mockInvoices[0];
  onView: () => void;
}) {
  const isActive = invoice.statusType === 'active';
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Image src="/order.png" alt="Order" width={28} height={28} />
          <div>
            <p className="text-base font-bold text-[#333333]">{invoice.id}</p>
            <p className="text-xs text-[#666666]">Invoice No. {invoice.invoiceNo}</p>
          </div>
        </div>
        <div
          className={`px-5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
            isActive ? 'bg-[#34C7591A] text-[#34C759]' : 'bg-[#0088FF1A] text-[#0088FF]'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#34C759]' : 'bg-[#0088FF]'}`} />
          {invoice.status}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mb-4" />

      {/* Date row */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm text-[#666666]">Invoice Date &amp; Time</span>
        <span className="text-sm text-[#999999] font-medium">{invoice.dateTime}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onView}
          className="px-10 py-2.5 border border-gray-300 rounded-sm text-sm font-semibold text-[#333333] hover:bg-gray-50 transition-colors"
        >
          View
        </button>
        <button
          onClick={() => downloadInvoice(invoice)}
          className="px-8 py-2.5 bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white rounded-sm text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          Download Invoice
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────── Section divider helper ────────────────── */
function SectionRow({ label, value, valueClass = 'text-[#333333]' }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#555555]">{label}</span>
      <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}

/* ─────────────────────── Invoice Detail View ───────────────────── */
function InvoiceDetail({
  invoice,
  onBack,
}: {
  invoice: typeof mockInvoices[0];
  onBack: () => void;
}) {
  const isActive = invoice.statusType === 'active';

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-[#E47B25] hover:opacity-80 transition mb-2"
      >
        <ArrowLeft size={16} /> Back to Invoices
      </button>

      {/* ── Header Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Image src="/order.png" alt="Order" width={28} height={28} />
            <div>
              <p className="text-base font-bold text-[#333333]">{invoice.id}</p>
              <p className="text-xs text-[#666666]">Invoice No. {invoice.invoiceNo}</p>
            </div>
          </div>
          <div
            className={`px-5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              isActive ? 'bg-[#34C7591A] text-[#34C759]' : 'bg-[#0088FF1A] text-[#0088FF]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#34C759]' : 'bg-[#0088FF]'}`} />
            {invoice.status}
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
          <span className="text-sm text-[#666666]">Invoice Date &amp; Time</span>
          <span className="text-sm text-[#999999] font-medium">{invoice.dateTime}</span>
        </div>
      </div>

      {/* ── Billing Details ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
        <h3 className="text-base font-bold text-[#222222] mb-4">Billing Details</h3>
        <div className="space-y-1 text-sm text-[#333333]">
          <p><span className="font-semibold">Customer Name:</span> Aisha Sheikh</p>
          <p><span className="font-semibold">Email:</span> aisha@email.com</p>
          <p><span className="font-semibold">Phone:</span> +91 XXXXX XXXXX</p>
        </div>
        <div className="mt-4 space-y-1 text-sm text-[#333333]">
          <p className="font-semibold">Billing Address:</p>
          <p>House No XX, Area Name</p>
          <p>Bhopal, Madhya Pradesh – 4620XX India</p>
        </div>
        <div className="mt-4 space-y-1 text-sm text-[#333333]">
          <p className="font-semibold">Shipping Address:</p>
          <p>Same as Billing Address</p>
        </div>
        <div className="mt-4 text-sm text-[#333333]">
          <span className="font-semibold">Estimated Delivery:</span> 3–5 Business Days
        </div>
      </div>

      {/* ── Order Summary ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
        <h3 className=" font-bold text-[#222222] ">Order Summary</h3>
        <SectionRow label="Items total(incl. GST)" value="₹1365.00" />
        <SectionRow label="Items Quantity" value="4  items" />
        <SectionRow label="Discount" value="₹1365.00" valueClass="text-[#FF3B30] font-semibold" />
        <SectionRow label="Coupon Applied:" value="-₹1365.00" valueClass="text-[#FF3B30] font-semibold" />
        <SectionRow label="Saved" value="+₹200" valueClass="text-[#34C759] font-semibold" />
        <div className="flex items-center justify-between ">
          <span className="text-sm font-bold text-[#222222]">Subtotal</span>
          <span className="text-sm font-bold text-[#222222]">₹1365.00</span>
        </div>
      </div>

      {/* ── Shipping Details ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
        <h3 className="text-base font-bold text-[#222222] mb-2">Shipping Details</h3>
        <SectionRow label="1.8 kg" value="" />
        <SectionRow label="Delivery Fee" value="₹150.00" />
        <SectionRow label="Delivery Mode" value="By Air" />
      </div>

      {/* ── Tax Details ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
        <h3 className="text-base font-bold text-[#222222] mb-2">Tax Details</h3>
        <SectionRow label="CGST(9%)" value="₹71.28" />
        <SectionRow label="SGST(9%)" value="₹71.28" />
        <div className="pt-3 mt-1 text-sm text-[#333333]">
          <span className="font-semibold">GSTIN:</span> 23XXXXXXXXXX1Z5
        </div>
      </div>

      {/* ── Grand Total ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-[#222222]">Grand Total</p>
          <p className="text-xs text-[#666666]">Including GST</p>
        </div>
        <p className="text-xl font-bold text-[#222222]">₹1,515.78</p>
      </div>

      {/* ── Paid With ── */}
      <h3 className="text-base font-bold text-[#222222] mb-4">Paid With</h3>
      <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
        
        <div className="flex items-center gap-4 border border-gray-100 rounded-xl p-4">
          {/* Google Pay logo using coloured circles */}
         <Image src="/gpay.png" alt="gpay" width={40} height={40} />
          <div>
            <p className="text-sm font-semibold text-[#333333]">Google Pay</p>
            <p className="text-xs text-[#E47B25] font-medium">Got Discount 10%</p>
          </div>
        </div>
      </div>

      {/* ── Review Order ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-base font-bold text-[#222222] mb-4">Review Order</h3>
        <div className="space-y-4">
          {mockProducts.map((product) => (
            <div key={product.id} className="flex items-center gap-4 border border-gray-100 rounded-xl p-4">
              <div className="w-24 h-20 rounded-lg bg-gray-50 border border-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#222222] mb-1">{product.name}</p>
                <p className="text-xs text-[#888888] mb-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#E47B25]">₹{product.price}</span>
                  <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Note ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <p className="text-sm font-semibold text-[#333333] mb-2">Note :</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-[#555555]">
          <li>All prices include applicable GST.</li>
          <li>Products sold are genuine and quality tested.</li>
          <li>Warranty applicable as per product policy.</li>
          <li>This is a computer-generated invoice.</li>
        </ul>
      </div>

      {/* ── Download Button ── */}
      <div className="flex justify-center pb-4">
        <button
          onClick={() => downloadInvoice(invoice)}
          className="px-12 py-3 bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          Download Invoice
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── Page ─────────────────────────────── */
export default function ViewInvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<typeof mockInvoices[0] | null>(null);

  return (
    <>
      {/* Desktop view */}
      <main className="hidden lg:block bg-white py-4 sm:py-6 md:py-8">
        <div className="container-main py-4 sm:py-6 md:py-8">
          {/* Breadcrumb */}
          <p className="text-xs sm:text-sm text-gray-400 mb-4">
            HOME &gt; MY ACCOUNT &gt;{' '}
            <span className="text-primary-500 uppercase">VIEW INVOICES</span>
          </p>

          <div className="mb-5 md:mb-7">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#000000]">My Account</h1>
            <div className="w-40 sm:w-48 h-1 bg-gradient-to-r from-[#E47B25] to-[#B3520A] rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-3">
              <ProfileSidebar activeItem="View Invoices" />
            </div>

            {/* Main Content */}
            <div className="col-span-12 lg:col-span-9">
              <div className="bg-[#FAFAFA] rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                {/* Header */}
                <div className="mb-6 pt-2">
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#000000]">
                    View Invoices
                  </h2>
                  <div className="w-40 sm:w-52 h-1 bg-gradient-to-r from-[#E47B25] to-[#B3520A] rounded-full mt-4" />
                </div>

                {/* List or Detail */}
                {selectedInvoice ? (
                  <InvoiceDetail
                    invoice={selectedInvoice}
                    onBack={() => setSelectedInvoice(null)}
                  />
                ) : (
                  <div className="space-y-4">
                    {mockInvoices.map((invoice) => (
                      <InvoiceCard
                        key={invoice.id}
                        invoice={invoice}
                        onView={() => setSelectedInvoice(invoice)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile view */}
      <MobileProfileLayout title="View Invoices">
        <div className="mb-6 pt-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#000000]">
            View Invoices
          </h2>
          <div className="w-40 sm:w-52 h-1 bg-gradient-to-r from-[#E47B25] to-[#B3520A] rounded-full mt-4" />
        </div>
        {selectedInvoice ? (
          <InvoiceDetail
            invoice={selectedInvoice}
            onBack={() => setSelectedInvoice(null)}
          />
        ) : (
          <div className="space-y-4">
            {mockInvoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onView={() => setSelectedInvoice(invoice)}
              />
            ))}
          </div>
        )}
      </MobileProfileLayout>
    </>
  );
}
