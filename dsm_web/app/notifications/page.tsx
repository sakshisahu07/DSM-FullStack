'use client';
import React, { useEffect } from 'react';
import { MobileProfileLayout } from '@/components/profile';
import { Clock, Bell, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchNotifications } from '@/redux/slices/notificationSlice';

export default function NotificationsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: notifications, loading } = useSelector((state: RootState) => state.notification);

  useEffect(() => {
    dispatch(fetchNotifications({ page: 1, limit: 10 }));
  }, [dispatch]);

  const getIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'order': return '✅';
      case 'delivery': return '🚚';
      case 'sale': return '🎁';
      case 'project': return '🚀';
      case 'membership': return '⭐';
      default: return '🔔';
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Just now';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  return (
    <>
      {/* Desktop View Placeholder */}
      <main className="hidden lg:block bg-white py-8 min-h-screen">
        <div className="container-main">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-[#000000]">Notifications</h1>
            <div className="w-48 h-1 bg-gradient-to-r from-[#E47B25] to-[#B3520A] rounded-full mt-3" />
          </div>
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 min-h-[600px]">
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E47B25]"></div>
                </div>
              ) : notifications.map((notif) => (
                <div key={notif._id || notif.id || Math.random()} className="flex items-center justify-between p-6 bg-[#FAFAFA] rounded-2xl border border-gray-50 hover:border-[#EE9C24] transition-all group">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm border border-gray-100">
                      {getIcon(notif.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0D0C0D]">{notif.title}</h3>
                      <p className="text-gray-500 font-medium">{notif.message || notif.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock size={16} />
                      <span className="text-sm font-medium">{formatTime(notif.createdAt)}</span>
                    </div>
                    <button className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile View - Matching SS Exactly */}
      <MobileProfileLayout title="Notifications">
        <div className="pt-2 pb-24 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E47B25]"></div>
            </div>
          ) : notifications.map((notif) => (
            <div 
              key={notif._id || notif.id || Math.random()} 
              className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-gray-50 overflow-hidden flex relative group active:scale-[0.98] transition-transform"
            >
              {/* Vertical Orange Bar */}
              <div className="w-[5px] bg-[#E47B25] absolute left-4 top-4 bottom-4 rounded-full" />
              
              <div className="flex-1 py-5 pl-8 pr-4">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getIcon(notif.type)}</span>
                    <h3 className="font-bold text-[15px] text-[#0D0C0D] leading-tight">
                      {notif.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-[#A0A0A0]">
                    <Clock size={12} strokeWidth={2.5} />
                    <span className="text-[10px] font-bold whitespace-nowrap">{formatTime(notif.createdAt)}</span>
                  </div>
                </div>
                
                <p className="text-[#666666] text-[12px] font-medium leading-relaxed pr-2">
                  {notif.message || notif.description}
                </p>
              </div>
            </div>
          ))}

          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Bell size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No Notifications Yet</h3>
              <p className="text-sm text-gray-500 mt-1">We'll notify you when something important happens.</p>
            </div>
          )}
        </div>
      </MobileProfileLayout>
    </>
  );
}
