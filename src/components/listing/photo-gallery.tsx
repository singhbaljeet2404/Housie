"use client";

import { useState } from "react";
import { ListingPhoto } from "@/components/listing-photo";

export function PhotoGallery({ seed, count, label }: { seed: string; count: number; label: string }) {
  const [index, setIndex] = useState(0);
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-xl">
        <ListingPhoto seed={seed} index={index} label={`${label} — photo ${index + 1} of ${count}`} className="aspect-[16/10] w-full" />
        <button type="button" aria-label="Previous photo" onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1.5 text-lg shadow hover:bg-white">‹</button>
        <button type="button" aria-label="Next photo" onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1.5 text-lg shadow hover:bg-white">›</button>
        <span className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-0.5 text-xs text-white">{index + 1} / {count}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: count }, (_, i) => (
          <button key={i} type="button" aria-label={`Show photo ${i + 1}`} onClick={() => setIndex(i)} className={`shrink-0 overflow-hidden rounded-md ring-2 ${i === index ? "ring-brand-600" : "ring-transparent"}`}>
            <ListingPhoto seed={seed} index={i} className="h-14 w-20" badge={false} />
          </button>
        ))}
      </div>
    </div>
  );
}
