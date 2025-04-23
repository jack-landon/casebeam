"use client";

import { Star } from "lucide-react";

type StarRatingProps = {
  percentage: number;
};

export default function StarRating({ percentage }: StarRatingProps) {
  const calculateStars = (percent: number) => {
    const validPercent = Math.max(0, Math.min(100, percent));
    return (validPercent / 100) * 5;
  };

  const starRating = calculateStars(percentage);

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(starRating);
    const hasHalfStar = starRating % 1 >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-[50%]">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    }

    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="flex items-center mb-2">
      <div className="flex items-center gap-1">{renderStars()}</div>
      <p className="text-xs font-medium ml-2">({starRating.toFixed(2)} / 5)</p>
    </div>
  );
}
