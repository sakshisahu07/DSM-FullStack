"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, ThumbsUp, Download, Star } from "lucide-react";

interface ProjectCardProps {
  id: string | number;
  title: string;
  image: string;
  views: number;
  likes: number;
  downloads: number;
  rating: number;
  ratingCount: number;
  price: number;
  originalPrice: number;
}

export default function ProjectCard({
  id,
  title,
  image,
  views,
  likes,
  downloads,
  rating,
  ratingCount,
  price,
  originalPrice,
}: ProjectCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : i < rating
            ? "fill-yellow-200 text-yellow-400"
            : "fill-gray-200 text-gray-300"
        }
      />
    ));
  };

  return (
    <div className="card rounded-2xl overflow-hidden flex flex-col bg-white hover:shadow-lg transition-shadow duration-200">
      {/* Image */}
      <div className="relative w-full h-44">
        <Image src={!image || image === "false" || image === "null" ? "/placeholder.png" : image} alt={title} fill className="object-cover" />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 px-3 pt-3 text-gray-500 text-xs">
        <span className="flex items-center gap-1">
          <Eye size={13} /> {views}
        </span>
        <span className="flex items-center gap-1">
          <ThumbsUp size={13} /> {likes}
        </span>
        <span className="flex items-center gap-1">
          <Download size={13} /> {downloads}
        </span>
      </div>

      {/* Content */}
      <div className="px-3 pt-2 pb-3 flex flex-col flex-grow">
        <h3 className="text-heading font-semibold text-sm leading-snug mb-1 line-clamp-2">
          {title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs text-gray-500">{rating}/5 student ratings</span>
          <div className="flex items-center gap-0.5">{renderStars(rating)}</div>
        </div>

        {/* Price + Button */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-[10px] text-gray-400">Price</p>
            <div className="flex items-center gap-1.5">
              <span className="text-heading font-bold text-sm">₹{price}</span>
              <span className="text-gray-400 line-through text-xs">₹{originalPrice}</span>
            </div>
          </div>
          <Link
            href={`/project/${id}`}
            className="bg-primary-gradient text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            View full project
          </Link>
        </div>
      </div>
    </div>
  );
}
