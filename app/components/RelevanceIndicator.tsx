"use client";

import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";

interface RelevanceIndicatorProps {
  score: number;
}

export default function RelevanceIndicator({
  score = 0,
}: RelevanceIndicatorProps) {
  const [relevanceData, setRelevanceData] = useState({
    label: "",
    color: "",
  });

  useEffect(() => {
    // Ensure score is between 0 and 1
    const normalizedScore = Math.max(0, Math.min(1, score));

    let label: string;
    let color: string;

    if (normalizedScore == 1) {
      label = "Most Relevant";
      color = "bg-green-800";
    } else if (normalizedScore >= 0.85) {
      label = "Super Relevant";
      color = "bg-green-700";
    } else if (normalizedScore >= 0.7) {
      label = "Very Relevant";
      color = "bg-green-600";
    } else if (normalizedScore >= 0.5) {
      label = "Somewhat Relevant";
      color = "bg-yellow-600";
    } else {
      label = "Not Very Relevant";
      color = "bg-red-500";
    }

    setRelevanceData({ label, color });
  }, [score]);

  return (
    <Badge
      className={`flex items-center text-sm text-white/80 ${relevanceData.color}`}
    >
      <span
        className={`font-medium`}
        //   ${
        //   relevanceData.color === "bg-green-500"
        //     ? "text-green-600"
        //     : relevanceData.color === "bg-green-400"
        //     ? "text-green-500"
        //     : relevanceData.color === "bg-yellow-400"
        //     ? "text-yellow-500"
        //     : "text-red-500"
        // }
        // `}
      >
        {relevanceData.label}
      </span>
      <span className="text-xs"> - {Math.round(score * 100)}%</span>
    </Badge>
  );
}
