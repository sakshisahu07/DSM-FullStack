'use client';
import Image from 'next/image';
import React, { useState, useCallback, useEffect } from 'react';
import { ProfileSidebar, MobileProfileLayout } from '@/components/profile';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchWallet, fetchTransactions } from '@/redux/slices/walletSlice';
import { getPointsBalance } from '@/redux/slices/membershipSlice';

import { BASE_URL } from '@/redux/slices/apiConfig';

/* ─── Load Razorpay script ─── */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ─── Add Money Modal ─── */
function AddMoneyModal({
  onClose,
  onConfirm,
  loading,
}: {
  onClose: () => void;
  onConfirm: (amount: number) => void;
  loading: boolean;
}) {
  const [amount, setAmount] = useState('');
  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold text-[#222] mb-1">Add Money to Wallet</h3>
        <p className="text-sm text-gray-400 mb-6">Powered by Razorpay — safe & secure</p>

        {/* Quick select */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {quickAmounts.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(String(q))}
              className={`py-2 rounded-xl border text-sm font-semibold transition-all ${
                amount === String(q)
                  ? 'border-[#E47B25] bg-[#EE9C24] text-[#E47B25]'
                  : 'border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
            >
              ₹{q}
            </button>
          ))}
        </div>

        {/* Custom amount input */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
          <input
            type="number"
            min={1}
            placeholder="Enter custom amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-[#222] font-semibold focus:outline-none focus:ring-2 focus:ring-[#E47B25]/30 focus:border-[#E47B25] transition"
          />
        </div>

        <button
          disabled={!amount || Number(amount) <= 0 || loading}
          onClick={() => onConfirm(Number(amount))}
          className="w-full py-3.5 bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white font-bold rounded-xl shadow-lg hover:shadow-orange-200/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            `Add ₹${amount || '0'} to Wallet`
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function PaymentsWalletPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { balance: walletData, transactions, historyLoading } = useSelector((state: RootState) => state.wallet);

  const [activeTab, setActiveTab] = useState<'earn' | 'recent' | 'points'>('earn');
  const [showModal, setShowModal] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [pointsData, setPointsData] = useState<any>(null);
  const [pointsLoading, setPointsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchWallet());
    dispatch(fetchTransactions());
    
    // Fetch Membership Points Balance
    setPointsLoading(true);
    dispatch(getPointsBalance())
      .unwrap()
      .then((data) => {
        setPointsData(data);
        setPointsLoading(false);
      })
      .catch(() => {
        setPointsLoading(false);
      });
  }, [dispatch]);

  /* ─── Wallet stat cards data ─── */
  const walletCards = [
    {
      icon: "/coin2.png",
      label: 'Purchase Point',
      amount: pointsData?.points_balance || walletData?.coins || 0,
      isMoney: false,
    },
    {
      icon: "/coin3.png",
      label: 'Direct Added',
      amount: walletData?.balance || 0,
      isMoney: true,
    },
    {
      icon: "/coin1.png",
      label: 'Referrals Point',
      amount: walletData?.referralBalance || 0,
      isMoney: true,
    },
  ];

  /* ─── Razorpay flow ─── */
  const handleAddMoney = useCallback(async (amount: number) => {
    setRazorpayLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      // Step 1: Create order
      const orderRes = await fetch(`${BASE_URL}/wallet/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        toast.error(orderData.message || 'Failed to create order');
        setRazorpayLoading(false);
        return;
      }

      const { razorpayOrderId, amount: orderAmount, razorpayKey } = orderData.data;

      // Step 2: Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Razorpay SDK failed to load. Check your connection.');
        setRazorpayLoading(false);
        return;
      }

      // Step 3: Open Razorpay checkout
      const options = {
        key: razorpayKey,
        amount: orderAmount * 100, // paise
        currency: 'INR',
        name: 'DSM Electro',
        description: 'Wallet Top-up',
        order_id: razorpayOrderId,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // Step 4: Verify payment
          try {
            const verifyRes = await fetch(`${BASE_URL}/wallet/topup/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              toast.success(`₹${verifyData.data.balance} added to your wallet! 🎉`);
              setShowModal(false);
              dispatch(fetchWallet());
              dispatch(fetchTransactions());
            } else {
              toast.error(verifyData.message || 'Payment verification failed');
            }
          } catch {
            toast.error('Verification error. Contact support.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: { color: '#E47B25' },
        modal: {
          ondismiss: () => {
            setRazorpayLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        toast.error(`Payment failed: ${resp.error.description}`);
        setRazorpayLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setRazorpayLoading(false);
    }
  }, [dispatch]);

  /* ─── Earn items ─── */
  const earnItems = [
    {
      icon: (
        <div>
          <Image src="/pay1.png" alt="" width={40} height={40} />
        </div>
      ),
      title: 'DSM Coin',
      desc: 'Earn DSM Coin and exchange them To purchase your favorite product',
      hasLink: true,
      coinLine: true,
      btnLabel: 'Shopping',
      onBtnClick: () => {},
    },
    {
      icon: (
        <div>
          <Image src="/pay2.png" alt="" width={40} height={40} />
        </div>
      ),
      title: 'Add Direct Money  From Your Account',
      desc: 'Add funds instantly via secure Razorpay payment gateway',
      hasLink: false,
      coinLine: false,
      btnLabel: 'Add money',
      onBtnClick: () => setShowModal(true),
    },
    {
      icon: (
        <div>
          <Image src="/pay3.png" alt="" width={40} height={40} />
        </div>
      ),
      title: 'Refer & Earn More Coins',
      desc: 'Send Invite And Earn More Money',
      hasLink: false,
      coinLine: false,
      btnLabel: 'Send Invite',
      onBtnClick: () => {},
    },
  ];

  return (
    <>
      <main className="hidden lg:block bg-white py-4 sm:py-6 md:py-8 min-h-screen">
        {/* Add Money Modal */}
        {showModal && (
          <AddMoneyModal
            onClose={() => setShowModal(false)}
            onConfirm={handleAddMoney}
            loading={razorpayLoading}
          />
        )}

        <div className="container-main py-4 sm:py-6 md:py-8">
          {/* Breadcrumb */}
          <p className="text-xs sm:text-sm text-gray-400 mb-4 uppercase">
            HOME &gt; MY ACCOUNT &gt;{' '}
            <span className="text-primary-500 uppercase">PAYMENTS &amp; WALLET</span>
          </p>

          <div className="mb-5 md:mb-7">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#000000]">My Account</h1>
            <div className="w-40 sm:w-48 h-1 bg-gradient-to-r from-[#E47B25] to-[#B3520A] rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-3">
              <ProfileSidebar activeItem="Payments & Wallet" />
            </div>

            {/* Main Content */}
            <div className="col-span-12 lg:col-span-9">
              <div className="bg-[#FAFAFA] rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 min-h-[600px]">

                {/* ── Header ── */}
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#000000]">My Wallet</h2>
                  <div className="w-32 sm:w-44 h-1 bg-gradient-to-r from-[#E47B25] to-[#B3520A] rounded-full mt-3" />
                </div>

                {/* ── Wallet Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {walletCards.map((card, idx) => (
                    <div
                      key={card.label}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                      <div className="h-1 bg-gradient-to-r from-[#E47B25] to-[#B3520A]" />
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Image src={card.icon} alt={card.label} width={60} height={60} />
                          <div>
                            <p className="text-2xl font-bold text-[#222222]">
                                {card.isMoney ? `₹${card.amount}` : card.amount}
                            </p>
                            <p className="text-xs text-[#888888]">{card.label}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-[#555555] mb-0.5">Summary</p>
                            <p className="text-xs font-semibold text-[#34C759]">Updated</p>
                          </div>
                          <div className="text-right">
                             <p className="text-xs text-[#555555] mb-0.5">Method</p>
                             <p className="text-xs font-semibold text-gray-500">{idx === 1 ? 'Bank' : 'Earned'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Tabs ── */}
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setActiveTab('earn')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                      activeTab === 'earn'
                        ? 'border-[#E47B25] text-[#E47B25] bg-white shadow-sm'
                        : 'border-gray-200 text-[#555555] bg-white hover:border-gray-300'
                    }`}
                  >
                    <Image src="/gift.png" alt="" width={20} height={20} />
                    Earn Money
                  </button>
                  <button
                    onClick={() => setActiveTab('recent')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                      activeTab === 'recent'
                        ? 'border-[#E47B25] text-[#E47B25] bg-white shadow-sm'
                        : 'border-gray-200 text-[#555555] bg-white hover:border-gray-300'
                    }`}
                  >
                    <Image src="/recent.png" alt="" width={20} height={20} /> Recent Transaction
                  </button>
                  <button
                    onClick={() => setActiveTab('points')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                      activeTab === 'points'
                        ? 'border-[#E47B25] text-[#E47B25] bg-white shadow-sm'
                        : 'border-gray-200 text-[#555555] bg-white hover:border-gray-300'
                    }`}
                  >
                    <Image src="/coin2.png" alt="" width={20} height={20} /> Points Ledger
                  </button>
                </div>

                {/* ── Earn Money Tab ── */}
                {activeTab === 'earn' && (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-[#222222] mb-2">Earn  Money</h3>
                    {earnItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {item.icon}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#222222]">{item.title}</p>
                            <p className="text-xs text-[#888888] mt-0.5">
                              {item.desc}
                              {item.hasLink && (
                                <>
                                  {' | '}
                                  <span className="text-[#E47B25] font-medium cursor-pointer hover:underline">
                                    Go to Shopping
                                  </span>
                                </>
                              )}
                            </p>
                            {item.coinLine && (
                              <div className="flex items-center gap-2 mt-3 pl-3 border-l-4 border-[#E47B25]">
                                <span className="text-sm font-semibold text-[#333333]">DSM Coin</span>
                                <span className="text-xs text-[#888888] flex items-center gap-1">
                                  <span>🪙</span> {walletData?.coinConversionRate || 100} coins = ₹1
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={item.onBtnClick}
                          className="shrink-0 px-6 py-2.5 bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white text-sm font-bold rounded-lg shadow hover:shadow-md transition-all active:scale-95"
                        >
                          {item.btnLabel}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Recent Transactions Tab ── */}
                {activeTab === 'recent' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-[#222222] mb-2">Recent Transaction</h3>
                    {historyLoading ? (
                      <div className="flex justify-center items-center py-10">
                        <span className="w-8 h-8 border-4 border-orange-100 border-t-[#E47B25] rounded-full animate-spin"></span>
                      </div>
                    ) : transactions?.length > 0 ? (
                      transactions.map((txn, idx) => (
                        <div
                          key={txn._id || `txn-desktop-${idx}`}
                          className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex items-center justify-between gap-4 hover:border-orange-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 shrink-0">
                              <Image src="/balance.png" alt="wallet" width={40} height={40} />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <p className="text-sm font-semibold text-[#222222] capitalize">
                                  {txn.description || txn.type?.toLowerCase().replace('_', ' ') || 'Transaction'}
                                </p>
                                <span
                                  className={`text-[11px] px-2 py-0.5 rounded capitalize ${
                                    txn.credit ? 'bg-[#34C7591A] text-[#34C759]' : 'bg-[#FF3B301A] text-[#FF3B30]'
                                  }`}
                                >
                                  {txn.type === 'TOPUP' ? 'Added from Bank' : (txn.bucket === 'coins' ? 'Coins' : (txn.bucket === 'referralBalance' ? 'Referral' : 'Wallet'))}
                                </span>
                              </div>
                              <p className="text-xs text-[#888888] mt-1">
                                {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-1.5">
                            <span
                              className={`text-sm font-medium ${
                                txn.credit ? 'text-[#34C759]' : 'text-[#222222]'
                              }`}
                            >
                              {txn.credit ? 'Credit' : 'Debit'}
                            </span>
                            <span
                              className={`text-base font-bold ${
                                txn.credit ? 'text-[#34C759]' : 'text-[#FF3B30]'
                              }`}
                            >
                              {txn.credit ? '+' : '-'}₹{txn.amount}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                        No recent transactions found.
                      </div>
                    )}
                  </div>
                )}

                {/* ── Points Ledger Tab ── */}
                {activeTab === 'points' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-[#222222] mb-2">Points Ledger</h3>
                    {pointsLoading ? (
                      <div className="flex justify-center items-center py-10">
                        <span className="w-8 h-8 border-4 border-orange-100 border-t-[#E47B25] rounded-full animate-spin"></span>
                      </div>
                    ) : pointsData?.history?.length > 0 ? (
                      pointsData.history.map((txn: any, idx: number) => (
                        <div
                          key={txn._id || `ptxn-desktop-${idx}`}
                          className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex items-center justify-between gap-4 hover:border-orange-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 shrink-0 bg-orange-50 rounded-full flex items-center justify-center">
                              <Image src="/coin2.png" alt="points" width={24} height={24} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#222222] capitalize">
                                {txn.description || 'Points Transaction'}
                              </p>
                              <p className="text-xs text-[#888888] mt-1">
                                {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-1.5">
                            <span
                              className={`text-sm font-medium ${
                                txn.type === 'EARN' ? 'text-[#34C759]' : 'text-[#FF3B30]'
                              }`}
                            >
                              {txn.type === 'EARN' ? 'Earned' : 'Redeemed'}
                            </span>
                            <span
                              className={`text-base font-bold ${
                                txn.type === 'EARN' ? 'text-[#34C759]' : 'text-[#FF3B30]'
                              }`}
                            >
                              {txn.type === 'EARN' ? '+' : '-'}{txn.points} pts
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                        No points history found.
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileProfileLayout title="DSM wallet">
        <div className="flex flex-col gap-6 -mt-2">
          {/* Welcome Header */}
          <div className="flex items-center gap-4 px-1 py-2">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm ring-4 ring-orange-50">
              <Image src="/Images/user-profile.png" alt="Profile" width={64} height={64} className="object-cover" />
            </div>
            <div className="space-y-1">
              <h2 className="text-[17px] font-black text-gray-800 leading-tight">Your Wallet</h2>
              <p className="text-gray-400 text-[11px] font-medium leading-relaxed max-w-[200px]">Track your earnings and points in one place</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-4">
            {walletCards.map((card, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)] relative overflow-hidden group">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center p-1 relative z-10">
                      <Image src={card.icon} alt={card.label} width={45} height={45} className="object-contain" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-800 tracking-tight">
                          {card.isMoney ? `₹${card.amount}` : card.amount}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div>
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Status</p>
                      <p className="text-[10px] font-black text-[#34C759]">Active</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Update</p>
                      <p className="text-[10px] font-black text-gray-400">Today</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('earn')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border-2 transition-all font-black text-xs ${activeTab === 'earn' ? 'border-[#EE9C24] bg-white text-[#EE9C24] shadow-md shadow-orange-100' : 'border-gray-100 bg-white text-gray-400'}`}
            >
              <Image src="/gift.png" alt="" width={16} height={16} className={activeTab === 'earn' ? '' : 'opacity-40 grayscale'} />
              Earn Money
            </button>
            <button 
              onClick={() => setActiveTab('recent')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border-2 transition-all font-black text-xs ${activeTab === 'recent' ? 'border-[#EE9C24] bg-white text-[#EE9C24] shadow-md shadow-orange-100' : 'border-gray-100 bg-white text-gray-400'}`}
            >
              <Image src="/recent.png" alt="" width={16} height={16} className={activeTab === 'recent' ? '' : 'opacity-40 grayscale'} />
              Recent Transaction
            </button>
            <button 
              onClick={() => setActiveTab('points')}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border-2 transition-all font-black text-[10px] sm:text-xs ${activeTab === 'points' ? 'border-[#EE9C24] bg-white text-[#EE9C24] shadow-md shadow-orange-100' : 'border-gray-100 bg-white text-gray-400'}`}
            >
              <Image src="/coin2.png" alt="" width={16} height={16} className={activeTab === 'points' ? '' : 'opacity-40 grayscale'} />
              Points
            </button>
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {activeTab === 'earn' ? (
              <div className="space-y-4">
                <h3 className="text-base font-black text-gray-800 px-1">Earn Money</h3>
                {earnItems.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center p-2.5 shrink-0">
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-gray-800">{item.title}</p>
                        <p className="text-[10px] font-medium text-gray-400 leading-relaxed pr-2">
                          {item.desc} {item.hasLink && <span className="text-[#EE9C24] underline ml-1 cursor-pointer">Go to Shopping</span>}
                        </p>
                      </div>
                    </div>
                    {item.coinLine && (
                      <div className="bg-[#FFF8F1] rounded-2xl p-3 flex items-center justify-between border border-orange-50/50">
                        <div className="flex items-center gap-2">
                           <div className="w-1 h-8 bg-orange-200 rounded-full" />
                           <div>
                             <p className="text-[11px] font-black text-gray-800">DSM Coin</p>
                             <p className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                                🪙 {walletData?.coinConversionRate || 100} coins = ₹1
                             </p>
                           </div>
                        </div>
                        <button 
                          onClick={item.onBtnClick}
                          className="px-8 py-2.5 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white text-[11px] font-black rounded-xl shadow-lg shadow-orange-100 active:scale-95 transition-all"
                        >
                          {item.btnLabel}
                        </button>
                      </div>
                    )}
                    {!item.coinLine && (
                      <div className="flex justify-end">
                        <button 
                          onClick={item.onBtnClick}
                          className="px-8 py-2.5 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white text-[11px] font-black rounded-xl shadow-lg shadow-orange-100 active:scale-95 transition-all"
                        >
                          {item.btnLabel}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : activeTab === 'recent' ? (
              <div className="space-y-4">
                 <h3 className="text-base font-black text-gray-800 px-1">Recent Transaction</h3>
                {historyLoading ? (
                  <div className="flex justify-center p-10">
                    <span className="w-8 h-8 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></span>
                  </div>
                ) : transactions?.length > 0 ? (
                  transactions.slice(0, 10).map((txn, idx) => (
                    <div key={txn._id || `txn-mobile-${idx}`} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex items-center justify-between gap-3 group active:bg-orange-50/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center p-2.5 group-active:bg-orange-100/50 transition-colors">
                          <Image src="/balance.png" alt="" width={30} height={30} className="opacity-80" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-800 capitalize leading-tight">
                            {txn.description || txn.type?.toLowerCase().replace('_', ' ') || 'Transaction'}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                            {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider mb-1.5 ${
                          txn.credit ? 'bg-[#E8F8EE] text-[#34C759]' : 'bg-[#FFF0F0] text-[#FF3B30]'
                        }`}>
                          {txn.type === 'TOPUP' ? 'Bank Account' : (txn.bucket === 'referralBalance' ? 'Referral' : (txn.bucket === 'coins' ? 'Coins' : 'Wallet'))}
                        </span>
                        <p className={`text-sm font-black ${txn.credit ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                          {txn.credit ? '+' : '-'}₹{txn.amount}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm font-medium italic">No transactions record yet</p>
                  </div>
                )}
              </div>
            ) : activeTab === 'points' ? (
              <div className="space-y-4">
                 <h3 className="text-base font-black text-gray-800 px-1">Points Ledger</h3>
                {pointsLoading ? (
                  <div className="flex justify-center p-10">
                    <span className="w-8 h-8 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></span>
                  </div>
                ) : pointsData?.history?.length > 0 ? (
                  pointsData.history.slice(0, 10).map((txn: any, idx: number) => (
                    <div key={txn._id || `ptxn-mobile-${idx}`} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex items-center justify-between gap-3 group active:bg-orange-50/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center p-2.5 group-active:bg-orange-100/50 transition-colors">
                          <Image src="/coin2.png" alt="" width={24} height={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-800 capitalize leading-tight">
                            {txn.description || 'Points Transaction'}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                            {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider mb-1.5 ${
                          txn.type === 'EARN' ? 'bg-[#E8F8EE] text-[#34C759]' : 'bg-[#FFF0F0] text-[#FF3B30]'
                        }`}>
                          {txn.type === 'EARN' ? 'Earned' : 'Redeemed'}
                        </span>
                        <p className={`text-sm font-black ${txn.type === 'EARN' ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
                          {txn.type === 'EARN' ? '+' : '-'}{txn.points} pts
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm font-medium italic">No points record yet</p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </MobileProfileLayout>
    </>
  );
}
