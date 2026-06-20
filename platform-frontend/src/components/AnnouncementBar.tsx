"use client";

import { useState, useEffect } from "react";
import { X, Truck, Tag, Gift } from "lucide-react";

interface AnnouncementBarProps {
  accentColor: string;
}

const announcements = [
  {
    icon: Truck,
    text: "Free shipping on orders over $50",
  },
  {
    icon: Tag,
    text: "New arrivals every week - Shop now!",
  },
  {
    icon: Gift,
    text: "Sign up and get 10% off your first order",
  },
];

export function AnnouncementBar({ accentColor }: AnnouncementBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const currentAnnouncement = announcements[currentIndex];
  const Icon = currentAnnouncement.icon;

  return (
    <div
      className="relative py-2 px-4 text-white text-sm font-medium overflow-hidden"
      style={{ backgroundColor: accentColor }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{currentAnnouncement.text}</span>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Close announcement"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pb-1">
        {announcements.map((_, index) => (
          <div
            key={index}
            className={`h-0.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-6 bg-white"
                : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
