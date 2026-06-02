'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProfileSidebar, MobileProfileLayout } from '@/components/profile';
import Image from 'next/image';
import { ArrowLeft, Loader2, FileText } from 'lucide-react';
import { BASE_URL } from '@/redux/slices/apiConfig';

/* ─────────────────────────── Invoice List Card ─────────────────── */
function InvoiceCard({
  invoice,
  onView,
}: {
  invoice: any;
  onView: () => void;
}) {
  const isActive = invoice.paymentStatus === 'PAID';
  const displayId = invoice.orderId?._id 
    ? `ORDR-${invoice.orderId._id.slice(-6).toUpperCase()}` 
    : 'ORDER';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm transition-all hover:border-orange-100 hover:shadow-md">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Image src="/order.png" alt="Order" width={28} height={28} />
          <div>
            <p className="text-base font-bold text-[#333333]">{displayId}</p>
            <p className="text-xs text-[#666666]">Invoice No. {invoice.invoiceNumber}</p>
          </div>
        </div>
        <div
          className={`px-5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
            isActive ? 'bg-[#34C7591A] text-[#34C759]' : 'bg-[#E47B251A] text-[#E47B25]'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#34C759]' : 'bg-[#E47B25]'}`} />
          {invoice.paymentStatus || 'PENDING'}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mb-4" />

      {/* Date row */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm text-[#666666]">Invoice Date &amp; Time</span>
        <span className="text-sm text-[#999999] font-medium text-right">
          {new Date(invoice.issuedAt || invoice.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onView}
          className="px-10 py-2.5 border border-gray-300 rounded-sm text-sm font-semibold text-[#333333] hover:bg-gray-50 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => {
            if (invoice.pdfUrl) {
              window.open(invoice.pdfUrl, '_blank');
            } else {
              alert('PDF not available for this invoice');
            }
          }}
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
    <div className="flex items-center justify-between py-1">
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
  invoice: any;
  onBack: () => void;
}) {
  const isActive = invoice.paymentStatus === 'PAID';
  const displayId = invoice.orderId?._id 
    ? `ORDR-${invoice.orderId._id.slice(-6).toUpperCase()}` 
    : 'ORDER';

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
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Image src="/order.png" alt="Order" width={28} height={28} />
            <div>
              <p className="text-base font-bold text-[#333333]">{displayId}</p>
              <p className="text-xs text-[#666666]">Invoice No. {invoice.invoiceNumber}</p>
            </div>
          </div>
          <div
            className={`px-5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              isActive ? 'bg-[#34C7591A] text-[#34C759]' : 'bg-[#E47B251A] text-[#E47B25]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#34C759]' : 'bg-[#E47B25]'}`} />
            {invoice.paymentStatus || 'PENDING'}
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
          <span className="text-sm text-[#666666]">Invoice Date &amp; Time</span>
          <span className="text-sm text-[#999999] font-medium">
            {new Date(invoice.issuedAt || invoice.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* ── Billing Details ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-base font-bold text-[#222222] mb-4">Billing Details</h3>
        <div className="space-y-2 text-sm text-[#333333]">
          <p><span className="font-semibold text-gray-500">Customer Name:</span> {invoice.customerId?.firstName || ''} {invoice.customerId?.lastName || ''}</p>
          <p><span className="font-semibold text-gray-500">Email Address:</span> {invoice.customerId?.email || 'N/A'}</p>
        </div>
      </div>

      {/* ── Order Summary ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-2">
        <h3 className="font-bold text-[#222222] mb-2">Order Summary</h3>
        <SectionRow label="Subtotal" value={`₹${invoice.totals?.subtotal?.toFixed(2) || '0.00'}`} />
        {invoice.totals?.discount > 0 && (
          <SectionRow label="Discount" value={`-₹${invoice.totals.discount.toFixed(2)}`} valueClass="text-[#FF3B30] font-semibold" />
        )}
        {invoice.totals?.couponDiscount > 0 && (
          <SectionRow label="Coupon Discount" value={`-₹${invoice.totals.couponDiscount.toFixed(2)}`} valueClass="text-[#FF3B30] font-semibold" />
        )}
        {invoice.totals?.shippingCharge > 0 && (
          <SectionRow label="Shipping Charge" value={`₹${invoice.totals.shippingCharge.toFixed(2)}`} />
        )}
        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <span className="text-base font-bold text-[#222222]">Grand Total</span>
          <span className="text-base font-bold text-[#222222]">₹{invoice.totals?.grandTotal?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      {/* ── Tax Details ── */}
      {invoice.taxes?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-1">
          <h3 className="text-base font-bold text-[#222222] mb-2">Tax Details</h3>
          {invoice.taxes.map((tax: any, idx: number) => (
            <SectionRow key={idx} label={tax.name} value={`₹${tax.amount?.toFixed(2) || '0.00'}`} />
          ))}
        </div>
      )}

      {/* ── Paid With ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-base font-bold text-[#222222] mb-3">Payment Details</h3>
        <SectionRow label="Payment Method" value={invoice.metadata?.paymentMethod || 'ONLINE'} valueClass="font-semibold text-[#E47B25]" />
        {invoice.metadata?.cancellationReason && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 text-xs rounded-lg font-medium">
            Cancellation Reason: {invoice.metadata.cancellationReason}
          </div>
        )}
      </div>

      {/* ── Download Button ── */}
      <div className="flex justify-center pb-4">
        <button
          onClick={() => {
            if (invoice.pdfUrl) {
              window.open(invoice.pdfUrl, '_blank');
            } else {
              alert('PDF not available for this invoice');
            }
          }}
          className="px-12 py-3 bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
        >
          Download PDF Invoice
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── Page ─────────────────────────────── */
export default function ViewInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${BASE_URL}/invoice/all?page=1&limit=50`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch invoices');
      }
      setInvoices(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#E47B25] mb-3" />
          <p className="text-sm text-gray-500">Loading invoices...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <p className="text-red-500 font-semibold mb-3">{error}</p>
          <button
            onClick={fetchInvoices}
            className="px-6 py-2 bg-[#E47B25] text-white text-xs font-bold rounded-lg shadow active:scale-95 transition"
          >
            Retry Fetch
          </button>
        </div>
      );
    }

    if (selectedInvoice) {
      return (
        <InvoiceDetail
          invoice={selectedInvoice}
          onBack={() => setSelectedInvoice(null)}
        />
      );
    }

    if (invoices.length === 0) {
      return (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 p-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm italic">No invoices found for your orders.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {invoices.map((invoice) => (
          <InvoiceCard
            key={invoice._id}
            invoice={invoice}
            onView={() => setSelectedInvoice(invoice)}
          />
        ))}
      </div>
    );
  };

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

                {renderContent()}
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
        {renderContent()}
      </MobileProfileLayout>
    </>
  );
}
