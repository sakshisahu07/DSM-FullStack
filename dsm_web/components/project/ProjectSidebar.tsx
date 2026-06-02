"use client";

import { useState } from "react";
import { ChevronRight, Star } from "lucide-react";

const categories = [
  { label: "All Projects", value: "" },
  { label: "Beginner Level", value: "beginner" },
  { label: "Intermidate Level", value: "intermediate" },
  { label: "Advanced Level", value: "advance" },
];

interface ProjectSidebarProps {
  activeCategory?: string;
  onCategoryChange?: (value: string) => void;
}

export default function ProjectSidebar({ activeCategory = "", onCategoryChange }: ProjectSidebarProps) {
  const [selectedRating, setSelectedRating] = useState(5);

  return (
    <aside className="w-full">
      {/* Categories */}
      <div className="card rounded-2xl overflow-hidden mb-4">
        {categories.map((cat) => (
          <button
            key={cat.label}
            onClick={() => onCategoryChange && onCategoryChange(cat.value)}
            className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors border-b border-[var(--border-light)] last:border-0 ${
              activeCategory === cat.value
                ? "bg-primary-gradient text-white"
                : "text-heading hover:bg-[#EE9C24]"
            }`}
          >
            {cat.label}
            <ChevronRight size={15} />
          </button>
        ))}
      </div>

      {/* Rating Filter */}
      <div className="card rounded-2xl p-4">
        <h4 className="text-heading font-semibold text-sm mb-3">Rating</h4>
        <div className="flex flex-col gap-2.5">
          {[5, 4, 3, 2, 1].map((star) => (
            <label
              key={star}
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setSelectedRating(star)}
            >
              {/* Custom checkbox */}
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-colors ${
                  selectedRating === star
                    ? "bg-primary-gradient border-[#EE9C24]"
                    : "border-gray-300 group-hover:border-[#EE9C24]"
                }`}
              >
                {selectedRating === star && (
                  <svg width="8" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-heading font-medium w-3">{star}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={
                      i < star
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-300"
                    }
                  />
                ))}
              </div>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
