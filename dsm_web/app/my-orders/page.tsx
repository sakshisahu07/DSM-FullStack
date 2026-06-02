'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import OrderCard from '@/components/OrderCard';
import { ProfileSidebar, MobileProfileLayout } from '@/components/profile';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchOrders } from '@/redux/slices/orderSlice';
import { Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

const tabData = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'shipping', label: 'On Shipping' },
  { id: 'arrived', label: 'Arrived' },
  { id: 'canceled', label: 'Cancel' },
];

export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading } = useSelector((state: RootState) => state.order);
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Print token to console for debugging as requested by user
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    console.log("=================== DSM ELECTRO DEBUG ===================");
    console.log("Logged In User Info:", auth?.user);
    console.log("Current Auth Token (localStorage):", token);
    console.log("Redux State Auth Token:", auth?.token);
    console.log("=========================================================");

    // Fetch all user orders on mount
    dispatch(fetchOrders());
  }, [dispatch, auth]);


  // Map backend orders data schema to OrderCard props structure dynamically
  const mappedOrders = (orders || []).map((o: any) => {
    let mappedStatus: 'pending' | 'shipping' | 'arrived' | 'canceled' = 'pending';
    let statusText = 'Pending';
    
    if (o.status === 'ORDERED' || o.status === 'PENDING') {
      mappedStatus = 'pending';
      statusText = 'Pending';
    } else if (o.status === 'SHIPPED' || o.status === 'ARRIVING') {
      mappedStatus = 'shipping';
      statusText = o.status === 'SHIPPED' ? 'Shipped' : 'Out for Delivery';
    } else if (o.status === 'DELIVERED') {
      mappedStatus = 'arrived';
      statusText = 'Delivered';
    } else if (o.status === 'CANCELLED') {
      mappedStatus = 'canceled';
      statusText = 'Cancelled';
    }

    const products = (o.product || []).map((p: any) => {
      const isCombo = p.itemType === 'combo';
      const name = isCombo ? p.comboId?.name || 'Special Combo Pack' : p.productId?.name || 'Product Item';
      const desc = isCombo ? 'Curated Bundle Offer' : (p.variantId?.size ? `Size: ${p.variantId.size}` : 'High-Quality Component');
      const price = p.price || 0;
      const originalPrice = isCombo ? p.comboId?.comboPrice : p.variantId?.mrp;
      const image = isCombo ? p.comboId?.icon || '/placeholder.png' : p.productId?.icon || '/placeholder.png';
      
      return {
        id: p._id || Math.random().toString(),
        name,
        description: desc,
        price,
        originalPrice,
        image,
      };
    });

    const destinationDetail = o.address 
      ? [
          o.address.street, 
          o.address.city?.name || o.address.city, 
          o.address.state?.name || o.address.state, 
          o.address.country?.name || o.address.country, 
          o.address.pincode?.code || o.address.pincode
        ].filter(Boolean).join(', ')
      : o.customerSnapshot?.phone ? `Snapshot Delivery: ${o.customerSnapshot.firstName || ''} - ${o.customerSnapshot.phone}` : 'Customer Address';

    // Calculate dynamic estimated arrival date based on shippingMode and createdAt
    let dynamicEstArrival = '3-5 Working Days';
    if (o.status === 'DELIVERED') {
      if (o.deliveredDate) {
        dynamicEstArrival = `Delivered on ${new Date(o.deliveredDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      } else {
        dynamicEstArrival = 'Delivered';
      }
    } else if (o.status === 'CANCELLED') {
      dynamicEstArrival = 'Cancelled';
    } else {
      const orderDate = new Date(o.createdAt);
      const daysToAdd = o.shippingMode === 'air' ? 3 : 7;
      orderDate.setDate(orderDate.getDate() + daysToAdd);
      dynamicEstArrival = orderDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    return {
      id: o._id,
      status: mappedStatus,
      statusText: statusText,
      paymentStatus: o.paymentStatus, // Pass database payment status
      origin: o.shippingMode === 'air' ? 'DSM Warehouse (Air Cargo)' : 'DSM Warehouse (Road Transport)',
      originDetail: o.shippingMode === 'air' ? 'DSM Warehouse (Delhi Air Cargo)' : 'DSM Warehouse (Delhi Hub Road)',
      destination: o.address?.city?.name || o.address?.city || 'Customer Hub',
      destinationDetail,
      estimatedArrival: dynamicEstArrival,
      products,
      orderDate: new Date(o.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      subtotal: o.orderTotal - (o.shippingCharge || 0),
      gst: 0,
      total: o.orderTotal
    };
  });

  // Create tabs with dynamic counts based on mappedOrders
  const tabsWithCounts = tabData.map(tab => {
    let count = null;
    if (tab.id !== 'all') {
      count = mappedOrders.filter(order => order.status === tab.id).length;
    }
    return { ...tab, count };
  });

  // Filter orders based on activeTab in memory (incredibly fast & optimized!)
  const filteredOrders = activeTab === 'all' 
    ? mappedOrders 
    : mappedOrders.filter(order => order.status === activeTab);

  return (
    <>
      <main className="hidden lg:block bg-white py-4 sm:py-6 md:py-8">
        <div className="container-main py-4 sm:py-6 md:py-8">
          {/* Breadcrumb */}
          <p className="text-xs sm:text-sm text-gray-400 mb-4">
            HOME &gt; MY ACCOUNT &gt;{" "}
            <span className="text-primary-500 uppercase">MY ORDERS</span>
          </p>

          <div className="mb-5 md:mb-7">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
              My Account
            </h1>
            <div className="w-40 sm:w-48 h-1 bg-gradient-to-r from-[#E47B25] to-[#B3520A] rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-3">
              <ProfileSidebar activeItem="My Order" />
            </div>

            <div className="col-span-12 lg:col-span-9">
              <div className="bg-[#FAFAFA] rounded-xl p-6 sm:p-8 md:p-10 shadow-sm border border-gray-100 min-h-[500px]">
                {/* Internal Header Section */}
                <div className="mb-8 md:mb-10">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
                    My Order
                  </h2>
                  <div className="w-32 sm:w-40 h-1 bg-gradient-to-r from-[#E47B25] to-[#B3520A] rounded-full mt-4" />
                </div>

                {/* Tabs Section */}
                <div className="flex flex-nowrap items-center gap-4 sm:gap-6 md:gap-10 mb-10 overflow-x-auto no-scrollbar pb-2">
                  {tabsWithCounts.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-10 py-1 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-[#F5F5F5] text-[#000000] border-2 border-[#E47B25]'
                          : 'bg-transparent text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {tab.label}
                      {tab.count !== null && (
                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${
                          activeTab === tab.id ? 'bg-[#E47B25] text-white' : 'bg-[#d26c1a] text-white'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Loading / Orders List */}
                {loading && orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#E47B25]" />
                    <p className="text-gray-500 text-sm font-medium">Fetching your orders from database...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {filteredOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                )}

                {!loading && filteredOrders.length === 0 && (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h3>
                    <p className="text-gray-500">Your shopping cart is waiting for you!</p>
                    <Link href="/allproduct">
                      <button className="mt-8 bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white px-10 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95">
                        Start Shopping
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile view */}
      <MobileProfileLayout title="My Order">
        <div className="bg-white sticky top-[60px] z-[5] py-3 -mx-4 px-4 overflow-x-auto no-scrollbar mb-4 mt-2">
          <div className="flex flex-nowrap items-center gap-6 pb-2 min-w-max">
            {tabData.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`transition-all whitespace-nowrap text-xs font-bold ${
                  activeTab === tab.id
                    ? 'px-4 py-1.5 rounded-xl border border-[#E47B25] text-[#E47B25]'
                    : 'text-[#333333] px-2 py-1.5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#E47B25]" />
            <p className="text-gray-400 text-xs">Loading orders...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {!loading && filteredOrders.length === 0 && (
              <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 italic text-gray-400">
                No orders found
              </div>
            )}
          </div>
        )}
        
        {/* Mobile Membership Banner */}
        <div className="mt-8 mb-4 w-full flex justify-center">
          <Image 
            src="/membership.png" 
            alt="Membership" 
            width={500} 
            height={200}
            className="w-full h-auto object-contain"
          />
        </div>
      </MobileProfileLayout>
    </>
  );
}
