"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchFaqs } from '@/redux/slices/faqSlice';

const FAQPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { faqs, loading, pagination } = useSelector((state: RootState) => state.faq);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    dispatch(fetchFaqs(`search=${searchTerm}&page=${page}&limit=${limit}`));
  }, [dispatch, searchTerm, page]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(1); // Reset to first page on new search
    setOpenIndex(null);
  };

  const handleCancelSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
    setOpenIndex(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:max-w-2xl md:mx-auto md:border-x md:border-gray-100">
      {/* FAQ Header - Only Mobile Styled fixed header */}
      <div className="bg-gradient-to-b from-[#E47B25] to-[#B3520A] px-4 py-8 flex items-center gap-4 sticky top-0 md:top-[70px] z-[100] shadow-md">
        <button 
          onClick={() => router.back()}
          className="text-white hover:bg-white/10 p-1 rounded-full transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xl font-bold text-white tracking-wide">FAQ</h1>
      </div>

      {/* Search Section */}
      <div className="p-4 bg-white flex items-center gap-3 sticky top-[92px] md:top-[162px] z-50">
        <div className="flex-1 flex items-center border border-[#EE9C24] rounded-md overflow-hidden bg-white px-3 py-1 shadow-sm focus-within:ring-1 focus-within:ring-[#E47B25] transition-all">
          <input 
            type="text" 
            placeholder="Search your query here"
            className="w-full text-sm py-2 outline-none text-gray-700 placeholder:text-gray-400"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            onClick={handleSearch}
            className="bg-[#E47B25] text-white p-1.5 rounded-md hover:bg-[#B3520A] transition-colors ml-2"
          >
            <Search size={18} />
          </button>
        </div>
        <button 
          onClick={handleCancelSearch}
          className="text-gray-600 font-bold text-sm px-1 hover:text-[#E47B25] transition-colors whitespace-nowrap"
        >
          Cancel
        </button>
      </div>

      {/* FAQ List */}
      <div className="flex-1 p-4 space-y-4 pb-32 overflow-y-auto bg-gray-50">
        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading FAQs...</div>
        ) : faqs.length === 0 ? (
          <div className="py-20 text-center text-gray-500">No FAQs found matching your criteria.</div>
        ) : (
          faqs.map((faq, idx) => (
            <div 
              key={faq._id || idx} 
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col gap-3 transition-all cursor-pointer"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            >
              <div className="flex items-start gap-4">
                {/* Play-like Orange Icon */}
                <div className="relative mt-1 shrink-0">
                   <div className="w-5 h-5 bg-[#E47B25] rounded-full flex items-center justify-center shadow-sm">
                      <div className={`w-0 h-0 border-t-[3.5px] border-t-transparent border-l-[6.5px] border-l-white border-b-[3.5px] border-b-transparent ml-0.5 transition-transform duration-300 ${openIndex === idx ? 'rotate-90' : ''}`} />
                   </div>
                </div>
                
                <span className={`text-[14px] font-bold leading-snug transition-colors ${openIndex === idx ? 'text-[#E47B25]' : 'text-gray-700'}`}>
                  {faq.question}
                </span>
              </div>

              {/* Answer - Expandable */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
              >
                <div className="pl-9 pr-2 py-1">
                  <p className="text-[14px] text-gray-500 font-medium leading-[1.6] whitespace-pre-wrap">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Pagination Controls */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 pb-2 border-t border-gray-200 mt-4">
            <button 
              disabled={page <= 1}
              onClick={() => { setPage(prev => Math.max(prev - 1, 1)); setOpenIndex(null); }}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500 font-medium">
              Page {page} of {pagination.totalPages}
            </span>
            <button 
              disabled={page >= pagination.totalPages}
              onClick={() => { setPage(prev => Math.min(prev + 1, pagination.totalPages)); setOpenIndex(null); }}
              className="px-4 py-2 text-sm font-medium text-white bg-[#E47B25] rounded-lg disabled:opacity-50 hover:bg-[#B3520A]"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Note for desktop - the standard footer is already present via layout.tsx */}
    </div>
  );
};

export default FAQPage;
