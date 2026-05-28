'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import OrderCard from '@/components/OrderCard';
import { ProfileSidebar, MobileProfileLayout } from '@/components/profile';

const mockOrders: any[] = [
  {
    id: 'ORDR-12345',
    status: 'shipping',
    statusText: 'Shipping',
    origin: 'Delhi',
    originDetail: 'karolbagh,Delhi, India',
    destination: 'Bhopal',
    destinationDetail: 'indrapuri,Bhopal, M.P',
    estimatedArrival: '30 July 2026',
    products: [
      {
        id: 1,
        name: 'Bluetooth HC-05 Wireless UART Module',
        description: 'Bluetooth 4.0 Module NRF51822 Irem ipsume lrem ipsume.lorem ipsume lrem ipsume.lorem...',
        price: 273,
        originalPrice: 473,
        image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=200&h=200&fit=crop'
      }
    ],
    orderDate: 'Dec 20, 2024',
    subtotal: 2313,
    gst: 417,
    total: 2730
  },
  {
    id: 'ORDR-67890',
    status: 'pending',
    statusText: 'Pending',
    origin: 'Mumbai',
    originDetail: 'Andheri, Mumbai, India',
    destination: 'Pune',
    destinationDetail: 'Shivajinagar, Pune, M.H',
    estimatedArrival: '05 Aug 2026',
    products: [
      {
        id: 2,
        name: 'Arduino Uno R3',
        description: 'Microcontroller board based on the ATmega328P.',
        price: 599,
        originalPrice: 899,
        image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=200&h=200&fit=crop'
      }
    ],
    orderDate: 'Dec 22, 2024',
    subtotal: 540,
    gst: 59,
    total: 599
  },
  {
    id: 'ORDR-11223',
    status: 'arrived',
    statusText: 'Arrived',
    origin: 'Bangalore',
    originDetail: 'Whitefield, Bangalore, India',
    destination: 'Chennai',
    destinationDetail: 'Adyar, Chennai, T.N',
    estimatedArrival: '15 July 2026',
    products: [
      {
        id: 3,
        name: 'Raspberry Pi 4 Model B',
        description: 'High-performance 64-bit quad-core processor.',
        price: 3500,
        originalPrice: 4500,
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop'
      }
    ],
    orderDate: 'Dec 18, 2024',
    subtotal: 3100,
    gst: 400,
    total: 3500
  },
  {
    id: 'ORDR-44556',
    status: 'canceled',
    statusText: 'Canceled',
    origin: 'Kolkata',
    originDetail: 'Salt Lake, Kolkata, India',
    destination: 'Delhi',
    destinationDetail: 'Connaught Place, Delhi, India',
    estimatedArrival: 'N/A',
    products: [
      {
        id: 4,
        name: 'ESP32 Development Board',
        description: 'Dual-core WiFi and Bluetooth microcontroller.',
        price: 450,
        originalPrice: 650,
        image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=200&h=200&fit=crop'
      }
    ],
    orderDate: 'Dec 15, 2024',
    subtotal: 400,
    gst: 50,
    total: 450
  }
];

const tabData = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'shipping', label: 'On Shipping' },
  { id: 'arrived', label: 'Arrived' },
  { id: 'canceled', label: 'Cancel' },
];

export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  
  // Create tabs with dynamic counts based on mockOrders
  const tabsWithCounts = tabData.map(tab => {
    let count = null;
    if (tab.id !== 'all') {
      count = mockOrders.filter(order => order.status === tab.id).length;
    }
    return { ...tab, count };
  });

  // Filter orders based on activeTab
  const filteredOrders = activeTab === 'all' 
    ? mockOrders 
    : mockOrders.filter(order => order.status === activeTab);
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
              <div className="bg-[#FAFAFA] rounded-xl p-6 sm:p-8 md:p-10 shadow-sm border border-gray-100">
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
                      className={`flex items-center gap-2 px-10 py-1  rounded-full text-sm font-bold transition-all whitespace-nowrap ${
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
                
                {/* Orders List */}
                <div className="space-y-8">
                  {filteredOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>

                {filteredOrders.length === 0 && (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="text-6xl mb-6"></div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h3>
                    <p className="text-gray-500">Your shopping cart is waiting for you!</p>
                    <button className="mt-8 bg-gradient-to-r from-[#E47B25] to-[#B3520A] text-white px-10 py-3 rounded-full font-bold shadow-lg">
                      Start Shopping
                    </button>
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

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
          {filteredOrders.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 italic text-gray-400">
              No orders found
            </div>
          )}
        </div>
        
        {/* Mobile Membership Banner added at bottom - Visible only on mobile as it's within MobileProfileLayout */}
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
