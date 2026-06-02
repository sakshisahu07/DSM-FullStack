"use client";

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchCompanyData } from '@/redux/slices/companySlice';
import { ChevronLeft, ShieldCheck, FileText, RefreshCcw, Truck, HelpCircle, Info } from 'lucide-react';

const PolicyPage = () => {
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const slug = params.slug as string;

    const { data: companyData, loading, error } = useSelector((state: RootState) => state.company);

    useEffect(() => {
        if (!companyData) {
            dispatch(fetchCompanyData());
        }
    }, [dispatch, companyData]);

    const getPolicyContent = () => {
        if (!companyData) return "";
        switch (slug) {
            case 'about_us': return companyData.about_us;
            case 'term_condition': return companyData.term_condition;
            case 'privacy_policy': return companyData.privacy_policy;
            case 'return_policy': return companyData.return_policy;
            case 'refund_policy': return companyData.refund_policy;
            case 'shippingAndDelivery': return companyData.shippingAndDelivery;
            default: return "";
        }
    };

    const getPolicyTitle = () => {
        switch (slug) {
            case 'about_us': return "About Us";
            case 'term_condition': return "Terms & Conditions";
            case 'privacy_policy': return "Privacy Policy";
            case 'return_policy': return "Return Policy";
            case 'refund_policy': return "Refund Policy";
            case 'shippingAndDelivery': return "Shipping & Delivery";
            default: return "Policy";
        }
    };

    const getPolicyIcon = () => {
        switch (slug) {
            case 'about_us': return <Info className="w-8 h-8 text-[#EE9C24]" />;
            case 'term_condition': return <FileText className="w-8 h-8 text-[#EE9C24]" />;
            case 'privacy_policy': return <ShieldCheck className="w-8 h-8 text-[#EE9C24]" />;
            case 'return_policy': return <RefreshCcw className="w-8 h-8 text-[#EE9C24]" />;
            case 'refund_policy': return <HelpCircle className="w-8 h-8 text-[#EE9C24]" />;
            case 'shippingAndDelivery': return <Truck className="w-8 h-8 text-[#EE9C24]" />;
            default: return <FileText className="w-8 h-8 text-[#EE9C24]" />;
        }
    };

    const content = getPolicyContent();
    const title = getPolicyTitle();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EE9C24]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header / Hero Section */}
            <div className="bg-gradient-to-r from-[#E47B25] to-[#B3520A] pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <button 
                        onClick={() => router.back()}
                        className="mb-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    
                    <div className="flex items-center gap-6 mb-4">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                            {getPolicyIcon()}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                            {title}
                        </h1>
                    </div>
                    <p className="text-white/70 text-lg max-w-2xl">
                        Everything you need to know about our {title.toLowerCase()} and how we serve you better.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto px-4 -mt-10 pb-20">
                <div className="bg-white rounded-3xl shadow-xl shadow-orange-900/5 p-8 md:p-12 border border-gray-100 min-h-[400px]">
                    {content ? (
                        <div 
                            className="prose prose-orange max-w-none text-gray-600 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <FileText className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg">Content not available at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center text-gray-400 text-sm">
                    <p>Last updated: {companyData?.updatedAt ? new Date(companyData.updatedAt).toLocaleDateString() : "Recently"}</p>
                    <p className="mt-2">© {new Date().getFullYear()} {companyData?.site_name || "DSM Online"}. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default PolicyPage;
