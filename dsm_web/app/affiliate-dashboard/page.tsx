'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchAffiliateDashboard, resetAffiliateState } from '@/redux/slices/affiliateSlice';
import { ProfileSidebar, MobileProfileLayout } from '@/components/profile';
import { LayoutDashboard, Wallet, ReceiptText, Landmark, Award, ShoppingCart, ShoppingBag, Edit3, Info, Circle, ChevronRight, Loader2 } from 'lucide-react';
import AffiliateRegistrationForm from '@/components/affiliate/AffiliateRegistrationForm';

export default function AffiliateDashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboardData, loading, error, otpVerified } = useSelector((state: RootState) => state.affiliate);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const router = require('next/navigation').useRouter();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedPayment, setSelectedPayment] = useState('upi');
  // Track whether OTP was verified in this session — used to force-show registration form
  const [justVerified, setJustVerified] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else {
      dispatch(fetchAffiliateDashboard());
    }
  }, [dispatch, token, router]);

  // When OTP is verified in the registration form inside this page, re-fetch dashboard
  // so the backend status (not_registered) is refreshed with the new AFFILIATE role token.
  useEffect(() => {
    if (otpVerified) {
      setJustVerified(true);
      // Re-fetch with a slight delay to ensure the new token is stored
      setTimeout(() => dispatch(fetchAffiliateDashboard()), 300);
    }
  }, [otpVerified, dispatch]);

  const summary = dashboardData?.summary || {
    totalClicks: 0,
    totalOrders: 0,
    totalEarned: 0,
    walletBalance: 0
  };

  const recentTransactions = dashboardData?.recentTransactions || [];

  const tabs = [
    { name: 'Dashboard', icon: <Image src="/icon4.png" alt="" width={18} height={18} /> },
    { name: 'Earnings', icon: <Image src="/icon3.png" alt="" width={18} height={18} /> },
    { name: 'Recent Transaction', icon: <Image src="/icon2.png" alt="" width={18} height={18} /> },
    { name: 'Withdraw Funds', icon: <Image src="/icon2.png" alt="" width={18} height={18} /> },
  ];

  const stats = [
    { label: 'Total Clicks', value: summary.totalClicks.toLocaleString(), icon: <Image src="/coin1.png" alt="" width={50} height={50} /> },
    { label: 'Total Orders', value: summary.totalOrders.toLocaleString(), icon: <Image src="/coin2.png" alt="" width={50} height={50} /> },
    { label: 'Total Earnings', value: `₹${summary.totalEarned.toLocaleString()}`, icon: <Image src="/coin3.png" alt="" width={50} height={50} /> },
    { label: 'Available For Withdrawal', value: `₹${summary.walletBalance.toLocaleString()}`, icon: <Image src="/coin1.png" alt="" width={50} height={50} /> },
  ];

  const chartData = dashboardData?.chartData || [];
  
  const generateChartPath = (width: number, height: number, isArea: boolean = false) => {
    if (chartData.length < 2) return "";
    const maxVal = Math.max(...chartData.map((d: any) => d.earned), 10);
    const points = chartData.map((d: any, i: number) => {
      const x = (i / (chartData.length - 1)) * width;
      const y = height - (d.earned / maxVal) * (height * 0.8);
      return `${x},${y}`;
    });

    const path = `M${points[0]} L${points.slice(1).join(' L')}`;
    return isArea ? `${path} L${width},${height} L0,${height} Z` : path;
  };

  // Extract status: backend returns 'not_registered' at root, but 'approved'/'pending' inside summary
  const currentStatus = dashboardData?.summary?.status || dashboardData?.status;

  // A robust check to see if we actually have an active affiliate dashboard
  const isActiveAffiliate = dashboardData && 
                            currentStatus === 'approved' &&
                            dashboardData.summary;
  
  const hasPendingApplication = currentStatus === 'pending' || currentStatus === 'rejected';

  // Show registration form if: not active, no data, backend returned not_registered, or there's an error.
  // If justVerified is true, always show registration form (OTP was just verified in this session).
  const isNotRegistered = !dashboardData || currentStatus === 'not_registered';
  // Show registration/status form for any non-active state (not registered, pending review, rejected)
  const showRegistrationForm = !isActiveAffiliate;

  // Determine the correct initial view for the embedded registration form:
  // - If application is pending/rejected → show 'success' view
  // - Otherwise → show 'registration' (bypassing OTP since user is already logged in)
  const embeddedFormInitialView = hasPendingApplication ? 'success' : 'registration';

  // Standard Profile/Dashboard Shell (Always shown)
  const DashboardShell = ({ children, title = "Affiliate Dashboard", subtitle }: any) => (
    <main className="bg-white py-4 sm:py-6 md:py-8 min-h-screen font-sans">
      <div className="container-main py-4 sm:py-6 md:py-8">
        <p className="text-xs sm:text-sm text-gray-400 mb-4 uppercase">
          HOME &gt; MY ACCOUNT &gt; <span className="text-[#EE9C24] uppercase">AFFILIATE DASHBOARD</span>
        </p>

        <div className="mb-5 md:mb-7">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#000000]">My Account</h1>
          <div className="w-40 sm:w-48 h-1 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] rounded-full mt-3" />
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="hidden lg:block lg:col-span-3">
            <ProfileSidebar activeItem="Affiliate Dashboard" />
          </div>
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-[#FAFAFA] rounded-2xl p-4 sm:p-8 shadow-sm border border-gray-100 min-h-[600px]">
              {subtitle && (
                 <div className="mb-8 ">
                    <h2 className="text-2xl font-black text-gray-900 mb-2">{title}</h2>
                    <p className="text-gray-500 text-sm font-medium">{subtitle}</p>
                 </div>
              )}
              {children}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Layout Fallback */}
      <div className="lg:hidden">
         <MobileProfileLayout title="Affiliate Dashboard">
            <div className="bg-white rounded-2xl p-4 shadow-sm min-h-[500px]">
               {children}
            </div>
         </MobileProfileLayout>
      </div>
    </main>
  );

  // If we are definitely loading and have no data, show loader within shell
  if (loading && !isActiveAffiliate) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-[#EE9C24] animate-spin mb-4" />
          <p className="text-gray-500 font-bold animate-pulse">Checking your affiliate status...</p>
        </div>
      </DashboardShell>
    );
  }

  // If no dashboard data is found or the account isn't active, show the form/status page INSIDE the shell
  if (showRegistrationForm) {
    const shellTitle = hasPendingApplication ? "Application Status" : "Become a DSM Affiliate";
    const shellSubtitle = hasPendingApplication ? "Your application is currently under review" : "Complete your KYC to start earning commissions";
    
    return (
      <DashboardShell 
        title={shellTitle}
        subtitle={shellSubtitle}
      >
        <div className="relative overflow-hidden">
           <AffiliateRegistrationForm 
              initialView={embeddedFormInitialView as 'landing' | 'registration' | 'success'} 
              isAlreadyReview={currentStatus === 'pending' || currentStatus === 'rejected'} 
           />
        </div>
      </DashboardShell>
    );
  }

  return (
    <>
      <main className="hidden lg:block bg-white py-4 sm:py-6 md:py-8 min-h-screen font-sans">
        <div className="container-main py-4 sm:py-6 md:py-8">
          {/* Breadcrumb */}
          <p className="text-xs sm:text-sm text-gray-400 mb-4 uppercase">
            HOME &gt; MY ACCOUNT &gt;{" "}
            <span className="text-[#EE9C24] uppercase">AFFILIATE DASHBOARD</span>
          </p>

          <div className="mb-5 md:mb-7">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
              My Account
            </h1>
            <div className="w-40 sm:w-48 h-1 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar */}
            <div className="hidden lg:block lg:col-span-3">
              <ProfileSidebar activeItem="Affiliate Dashboard" />
            </div>

            <div className="col-span-12 lg:col-span-9">
              {/* Dashboard Container */}
              <div className="bg-[#FAFAFA] rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 min-h-[600px]">
                {/* specialized Tabs and rest of the content */}
                {/* ... existing dashboard content ... */}

                {/* Specialized Tabs */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.name;
                    return (
                      <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${isActive
                            ? 'border-[#EE9C24] text-[#B8420E] bg-[#FAFAFA] shadow-sm ring-1 ring-[#EE9C24]/10 font-semibold'
                            : 'border-gray-200 text-[#0D0C0D] bg-[#FAFAFA] hover:border-[#EE9C24]/50 hover:bg-gray-50'
                          }`}
                      >
                        <span className={isActive ? 'text-[#EE9C24]' : 'text-gray-400'}>
                          {tab.icon}
                        </span>
                        <span className="text-sm">{tab.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Page Heading */}
                <div className="mb-8 px-2 group cursor-default">
                  <h2 className="text-2xl font-medium text-[#000000] mb-1.5 tracking-tight flex items-center gap-3">
                    Affiliate Dashboard
                  </h2>
                  <div className="relative w-54 h-1">
                    <div className="absolute inset-0 bg-[#EE9C24] rounded-full w-full" />
                  </div>
                </div>

                {/* Welcome Banner */}
                <div className="bg-white rounded-full p-3 pl-10 border border-gray-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8 flex items-center gap-6 relative overflow-hidden group">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#EE9C24]/20 shrink-0 shadow-sm">
                    <Image
                      src="/Images/user-profile.png"
                      alt="User"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-0.5 relative z-10">
                    <h3 className="text-2xl font-bold text-[#000000]">
                      Welcome back, {user?.firstName || 'Affiliate'}!
                    </h3>
                    <p className="text-[#9C939D] text-sm font-medium">
                      Track your referrals and grow your earnings
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                {activeTab === 'Dashboard' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-[24px] p-6 border-t-[5px] border-t-[#EE9C24] border border-gray-100 shadow-[0_10px_40px_rgb(0,0,0,0.03)] transition-all hover:translate-y-[-4px] hover:shadow-md group"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-50 shrink-0 transition-all group-hover:scale-110">
                            {stat.icon}
                          </div>
                          <div className="space-y-1">
                            <div className="text-2xl font-bold text-[#333333] tracking-normal">
                              {stat.value}
                            </div>
                            <div className="text-[11px] font-bold text-gray-400 ">
                              {stat.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Earnings Overview Section */}
                {(activeTab === 'Dashboard' || activeTab === 'Earnings') && (
                  <div className="mt-8 bg-white rounded-[40px] p-6 border border-gray-50 shadow-[0_10px_40px_rgb(0,0,0,0.02)] relative group/chart overflow-hidden">
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                      <div className="space-y-1">
                        <h2 className="text-xl font-bold text-[#333333]">Earnings Overview</h2>
                        <p className="text-gray-400 text-xs font-medium tracking-tight">Manage your details with ease.</p>
                      </div>
                    </div>

                    <div className="relative w-full h-[220px] pb-6 px-2 transition-all">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 220" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#EE9C24" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#EE9C24" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d={generateChartPath(1000, 200, true)}
                          fill="url(#chartGradient)"
                        />
                        <path
                          d={generateChartPath(1000, 200, false)}
                          fill="none"
                          stroke="#EE9C24"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Recent Transactions Table Section */}
                {(activeTab === 'Dashboard' || activeTab === 'Recent Transaction') && (
                  <div className="mt-8 bg-white rounded-[40px] p-6 border border-gray-50 shadow-[0_10px_40px_rgb(0,0,0,0.02)]">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-6 px-2">
                      <div className="space-y-1">
                        <h2 className="text-[1.6rem] font-bold text-[#333333]">Recent Transactions Table</h2>
                        <p className="text-gray-400 text-[1rem] font-medium tracking-tight">Manage your Recent Transaction details with ease.</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-[24px] border border-gray-50">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E]">
                            <th className="p-2 px-6 text-white font-medium text-sm rounded-tl-[24px]">Date</th>
                            <th className="p-2 px-6 text-white font-medium text-sm">Order ID</th>
                            <th className="p-2 px-6 text-white font-medium text-sm">Customer Name</th>
                            <th className="p-2 px-6 text-white font-medium text-sm text-center">Order Amount</th>
                            <th className="p-2 px-6 text-white font-medium text-sm text-center">Commission</th>
                            <th className="p-2 px-6 text-white font-medium text-sm text-center rounded-tr-[24px]">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {recentTransactions.length > 0 ? recentTransactions.map((row: any, i: number) => (
                            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                              <td className="p-2 px-6 text-[#333333] font-medium text-xs sm:text-sm">{new Date(row.createdAt).toLocaleDateString()}</td>
                              <td className="p-2 px-6 text-[#333333] font-medium text-xs sm:text-sm">{row.orderId || row._id}</td>
                              <td className="p-2 px-6 text-[#333333] font-medium text-xs sm:text-sm">{row.customerName || 'N/A'}</td>
                              <td className="p-2 px-6 text-[#000000] font-medium text-xs sm:text-sm text-center">₹{row.orderAmount || 0}</td>
                              <td className="p-2 px-6 text-[#333333] font-medium text-xs sm:text-sm text-center">{row.commissionPercent || 0}%</td>
                              <td className={`p-2 px-6 text-xs sm:text-sm text-center ${row.status === 'paid' ? 'text-[#34C759]' : 'text-[#FF383C]'}`}>{row.status}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={6} className="p-10 text-center text-gray-400 font-bold">No transactions found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Withdraw Funds Section */}
                {activeTab === 'Withdraw Funds' && (
                  <div className="mt-8 bg-white rounded-[40px] p-6 lg:p-8 border border-gray-50 shadow-[0_10px_40px_rgb(0,0,0,0.02)] relative">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                      <div className="space-y-1">
                        <h2 className="text-[1.6rem] font-bold text-[#333333]">Available for Withdrawal</h2>
                        <p className="text-gray-400 text-[1rem] font-medium tracking-tight">Manage your Recent Transaction details with ease.</p>
                      </div>
                      <div className="flex items-center gap-3 px-6 py-2.5 border border-[#EE9C24]/30 rounded-xl shadow-sm bg-white shrink-0">
                        <Image src="/coin1.png" alt="Coin" width={38} height={38} className="rounded-full" />
                        <div className="flex flex-col">
                          <span className="font-bold text-[#333333] text-lg leading-none">₹{summary.walletBalance.toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400 font-semibold mt-0.5">Amount</span>
                        </div>
                      </div>
                    </div>
                    {/* ... other parts similar ... */}
                    <div className="relative mb-12 group">
                      <div className="absolute -top-[10px] left-6 z-10 bg-white px-3 flex items-center">
                        <span className="text-xs font-bold text-[#666666]">Withdrawal Amount</span>
                      </div>
                      <div className="w-full bg-white border border-[#EE9C24] rounded-xl px-5 py-4 flex items-center justify-between shadow-sm">
                        <input type="text" placeholder="Enter Withdrawal Amount" className="w-full outline-none text-[#333333] font-medium text-base bg-transparent" />
                        <Edit3 size={20} className="text-gray-400" />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2 pb-2">
                      <button className="bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white font-medium py-3 px-8 rounded-xl shadow-md">
                        Request Withdrawal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileProfileLayout title="Affiliate Dashboard">
        <div className="flex flex-col gap-6 -mt-2 pb-10">
          {/* Mobile Optimized Tabs */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 pt-1 sticky top-0 bg-[#FAFAFA] z-20 -mx-4 px-4 border-b border-gray-100">
            {tabs.map((tab) => {
              const isActive = activeTab === (tab.name === 'Withdraw Funds' ? 'Recent Transaction' : tab.name); // Mapping for simplicity in this draft
              // Actually, I'll use a better tab logic
              const currentActive = activeTab;
              const isTabActive = currentActive === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap text-[11px] font-black transition-all border-2 ${isTabActive ? 'border-[#EE9C24] bg-white text-[#EE9C24] shadow-md shadow-[#EE9C24]' : 'border-gray-100 bg-white text-gray-400'}`}
                >
                  <div className={`w-4 h-4 ${isTabActive ? '' : 'opacity-40 grayscale'}`}>
                    {tab.icon}
                  </div>
                  {tab.name}
                </button>
              );
            })}
          </div>

          {(activeTab === 'Dashboard' || activeTab === 'Earnings' || activeTab === 'Recent Transaction') && (
             <div className="flex items-center gap-4 px-1 py-2">
               <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm ring-4 ring-orange-50">
                 <Image src="/Images/user-profile.png" alt="Profile" width={64} height={64} className="object-cover" />
               </div>
               <div className="space-y-1">
                 <h2 className="text-[17px] font-black text-gray-800 leading-tight">Welcome back, {user?.firstName || 'Affiliate'}!</h2>
                 <p className="text-gray-400 text-[11px] font-medium leading-relaxed max-w-[200px]">Track your referrals and grow your earnings</p>
               </div>
             </div>
          )}

          {activeTab === 'Dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm transition-all active:scale-95">
                    <div className="w-12 h-12 bg-orange-50/50 rounded-2xl flex items-center justify-center mb-4 p-1">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-800 tracking-tight leading-none mb-1.5">{stat.value}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Earnings History */}
              <div className="bg-white rounded-[40px] p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-[15px] font-black text-gray-800">Earning Overview</h3>
                    <p className="text-[10px] text-gray-400 font-medium">Manage your Recent Transaction details with ease.</p>
                  </div>
                  <select className="bg-gray-50 border-0 text-[10px] font-bold rounded-xl px-3 py-2 text-gray-600 outline-none">
                    <option>Last 30 Days</option>
                    <option>Last 7 Days</option>
                  </select>
                </div>
                
                {/* SVG Area Chart */}
                <div className="relative h-44 w-full mt-4">
                   <div className="absolute left-0 bottom-0 top-0 flex flex-col justify-between text-[10px] font-black text-gray-300">
                      <span>₹800</span>
                      <span>₹600</span>
                      <span>₹400</span>
                      <span>₹200</span>
                   </div>
                   <div className="ml-10 h-full flex flex-col justify-between">
                     <div className="flex-1 relative">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                           <defs>
                              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#EE9C24" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#EE9C24" stopOpacity="0" />
                              </linearGradient>
                           </defs>
                           <path d={generateChartPath(100, 100, true)} fill="url(#areaGrad)" />
                           <path d={generateChartPath(100, 100, false)} fill="none" stroke="#EE9C24" strokeWidth="2.5" />
                        </svg>
                     </div>
                     <div className="flex justify-between text-[10px] font-black text-[#EE9C24] py-2">
                        <span>1d</span><span>2d</span><span>3d</span><span>4d</span><span>5d</span><span>6d</span><span>7d</span>
                     </div>
                   </div>
                </div>
              </div>

              {/* Transactions Table Snippet */}
              <div className="bg-white rounded-[40px] p-6 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-[15px] font-black text-gray-800">Recent Transactions Table</h3>
                    <p className="text-[10px] text-gray-400 font-medium">Manage your Recent Transaction details with ease.</p>
                  </div>
                  <button onClick={() => setActiveTab('Recent Transaction')} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-[10px] font-bold text-gray-500 shadow-sm active:bg-gray-50">View All</button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                   <div className="grid grid-cols-12 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] p-3 text-[10px] font-black text-white uppercase tracking-wider">
                      <div className="col-span-1">S. No</div>
                      <div className="col-span-7 pl-6">Customer Name</div>
                      <div className="col-span-4 text-center">Action</div>
                   </div>
                   <div className="divide-y divide-gray-50">
                      {recentTransactions.length > 0 ? recentTransactions.slice(0, 4).map((row: any, i: number) => (
                        <div key={i} className="grid grid-cols-12 items-center p-3 py-4 bg-white active:bg-orange-50/10 transition-colors">
                           <div className="col-span-1 text-xs font-bold text-gray-400">{i+1}</div>
                           <div className="col-span-7 flex items-center gap-3 pl-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shrink-0">
                                <Image src="/Images/user-profile.png" alt="" width={40} height={40} />
                              </div>
                              <div>
                                <p className="text-xs font-black text-gray-800 leading-none mb-1">{row.customerName || 'Customer'}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Order Id - {row.orderId || row._id}</p>
                              </div>
                           </div>
                           <div className="col-span-4 text-center">
                              <button className="text-[10px] font-black text-gray-800 flex items-center justify-center gap-1 mx-auto group">
                                 View Transaction <div className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-[#EE9C24]" />
                              </button>
                           </div>
                        </div>
                      )) : (
                        <div className="p-6 text-center text-gray-400 text-xs font-bold">No recent transactions</div>
                      )}
                   </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'Earnings' && (
             <div className="space-y-6">
                <div className="bg-white rounded-[40px] p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-[15px] font-black text-gray-800">Earnings Overview</h3>
                      <p className="text-[10px] text-gray-400 font-medium">Manage your Recent Transaction details with ease.</p>
                    </div>
                    <select className="bg-gray-50 border-0 text-[10px] font-bold rounded-xl px-3 py-2 text-gray-600 outline-none">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                    </select>
                  </div>
                  
                  {/* Larger Chart for Earnings Tab */}
                  <div className="relative h-64 w-full mt-4">
                     <div className="absolute left-0 bottom-0 top-0 flex flex-col justify-between text-[10px] font-black text-gray-300">
                        <span>₹800</span><span>₹600</span><span>₹400</span><span>₹200</span>
                     </div>
                     <div className="ml-10 h-full flex flex-col justify-between">
                       <div className="flex-1 relative">
                          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                             <path d={generateChartPath(100, 100, true)} fill="url(#areaGrad)" />
                             <path d={generateChartPath(100, 100, false)} fill="none" stroke="#EE9C24" strokeWidth="2" />
                          </svg>
                       </div>
                       <div className="flex justify-between text-[6px] font-black text-[#EE9C24] py-2 overflow-x-auto no-scrollbar gap-1">
                          {Array.from({length: 30}, (_, i) => i + 1).map(d => (
                            <span key={d}>{d}</span>
                          ))}
                       </div>
                     </div>
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'Recent Transaction' && (
             <div className="space-y-6">
                <div className="bg-white rounded-[40px] p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-[15px] font-black text-gray-800">Recent Transactions Table</h3>
                      <p className="text-[10px] text-gray-400 font-medium">Manage your Recent Transaction details with ease.</p>
                    </div>
                    <button className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-[10px] font-bold text-gray-500 shadow-sm">View All</button>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                     <div className="grid grid-cols-12 bg-gradient-to-r from-[#EE9C24] to-[#B8420E] p-3 text-[10px] font-black text-white uppercase tracking-wider">
                        <div className="col-span-1">S. No</div>
                        <div className="col-span-7 pl-6">Customer Name</div>
                        <div className="col-span-4 text-center">Action</div>
                     </div>
                     <div className="divide-y divide-gray-50">
                        {recentTransactions.map((txn: any, i: number) => (
                           <div key={i} className="flex flex-col bg-white">
                              <div className="grid grid-cols-12 items-center p-3 py-4 active:bg-[#EE9C24] transition-colors">
                                 <div className="col-span-1 text-xs font-bold text-gray-400">{i+1}</div>
                                 <div className="col-span-7 flex items-center gap-3 pl-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shrink-0">
                                      <Image src="/Images/user-profile.png" alt="" width={40} height={40} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-black text-gray-800 leading-none mb-1 truncate">{txn.name}</p>
                                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter truncate">Order Id - {txn.id}</p>
                                    </div>
                                    {i === 0 && (
                                       <div className="w-max ml-1">
                                          <div className="flex items-center gap-1 bg-[#E8F8EE] text-[#34C759] text-[7px] font-black px-2 py-0.5 rounded-full uppercase">
                                             <div className="w-1 h-1 bg-[#34C759] rounded-full" /> Active
                                          </div>
                                       </div>
                                    )}
                                 </div>
                                 <div className="col-span-4 text-center">
                                    <button className="text-[10px] font-black text-gray-800 flex items-center justify-center gap-1 mx-auto group">
                                       View Transaction <div className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-[#EE9C24]" />
                                    </button>
                                 </div>
                              </div>
                              {i === 0 && (
                                 <div className="mx-3 mb-3 p-3 bg-gray-50 rounded-2xl grid grid-cols-3 gap-2">
                                    <div>
                                       <p className="text-[8px] text-gray-400 font-black uppercase">Date</p>
                                       <p className="text-[10px] font-black text-gray-800">{txn.date}</p>
                                    </div>
                                    <div>
                                       <p className="text-[8px] text-gray-400 font-black uppercase">Order Amount</p>
                                       <p className="text-[10px] font-black text-gray-800">{txn.amount}</p>
                                    </div>
                                    <div>
                                       <p className="text-[8px] text-gray-400 font-black uppercase">Commission</p>
                                       <p className="text-[10px] font-black text-gray-800">{txn.comm}</p>
                                    </div>
                                 </div>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'Withdraw Funds' && (
             <div className="space-y-6">
                <div className="flex items-center gap-4 px-1 py-2">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm ring-4 ring-orange-50">
                    <Image src="/Images/user-profile.png" alt="Profile" width={64} height={64} className="object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-[17px] font-black text-gray-800 leading-tight">Welcome back, {user?.firstName || 'Affiliate'}!</h2>
                    <p className="text-gray-400 text-[11px] font-medium leading-relaxed max-w-[200px]">Track your referrals and grow your earnings</p>
                  </div>
                </div>

                <div className="bg-white rounded-[40px] p-6 shadow-sm border border-orange-50 relative overflow-hidden">
                  <div className="mb-6">
                    <h3 className="text-[15px] font-black text-gray-800">Available for Withdrawal</h3>
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">Manage your Recent Transaction details with ease.</p>
                  </div>
                  
                  <div className="bg-[#FFF8F1] rounded-[32px] p-5 border border-orange-100 flex items-center gap-4 shadow-sm">
                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-inner">
                        <Image src="/coin2.png" alt="" width={45} height={45} />
                     </div>
                     <div>
                        <p className="text-2xl font-black text-gray-800 tracking-tight leading-none mb-1">₹{summary.walletBalance.toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Available For Withdrawal</p>
                     </div>
                  </div>
                </div>

                <div className="bg-white rounded-[40px] p-6 shadow-sm border border-gray-50">
                   <div className="space-y-6">
                      <div className="relative group">
                        <div className="absolute -top-[10px] left-6 z-10 bg-white px-3 flex items-center">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Withdrawal Amount</span>
                        </div>
                        <div className="w-full bg-white border border-[#EE9C24] rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
                          <input type="text" placeholder="Enter Your Amount" className="w-full outline-none text-[#333333] font-black text-sm bg-transparent placeholder:text-gray-300" />
                          <Edit3 size={16} className="text-gray-300" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-gray-800">Payment Option</h3>
                          <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px] text-gray-400">i</div>
                        </div>
                        
                        <div className="space-y-3">
                          {[
                            { id: 'upi', label: 'UPI | Wallets | EMI | Amazon Pay', icon: '/pay2.png', desc: 'Offer - Get Extra 10% discount on UPI Payment' },
                            { id: 'card', label: 'Net Banking | Credit | Debit Card', icon: '/pay3.png', desc: 'Offer - Get Extra 10% discount on Cards Payment', fee: '150' },
                            { id: 'cod', label: 'Cash On Delivery', icon: '/pay1.png', desc: 'Offer - Get 5% discount on Pre-paid', fee: '150' },
                            { id: 'wallet', label: 'DSM Wallet', icon: '/wallet.png', desc: 'Offer - Use your DSM wallet balance' },
                          ].map((opt) => (
                            <label key={opt.id} className="flex items-center gap-4 bg-white border border-gray-50 rounded-3xl p-4 shadow-sm active:bg-orange-50/30 transition-colors cursor-pointer border-collapse last:mb-0">
                              <input type="radio" name="payment" className="w-5 h-5 accent-[#EE9C24] shrink-0" defaultChecked={opt.id === 'upi'} />
                              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden p-2.5">
                                 <Image src={opt.icon} alt={opt.label} width={40} height={40} className="object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                  <p className="text-[11px] font-black text-gray-800 truncate">{opt.label}</p>
                                  {opt.id === 'upi' && <Image src="/upi.png" alt="UPI" width={30} height={10} />}
                                </div>
                                <p className="text-[8px] text-gray-400 font-medium">{opt.desc}</p>
                              </div>
                              {opt.fee && (
                                <div className="text-right shrink-0">
                                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">Fee</p>
                                  <p className="text-[11px] font-black text-gray-800">₹{opt.fee}</p>
                                </div>
                              )}
                            </label>
                          ))}
                        </div>
                      </div>

                      <button className="w-full bg-gradient-to-r from-[#EE9C24] to-[#B8420E] text-white py-4.5 rounded-[24px] font-black text-xs shadow-lg shadow-orange-100 active:scale-95 transition-all">
                         Submit Request
                      </button>
                   </div>
                </div>
             </div>
          )}
        </div>
      </MobileProfileLayout>
    </>
  );
}
