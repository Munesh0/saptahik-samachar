"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Ad {
  id: string;
  name: string;
  image_url: string;
  target_url: string | null;
  start_date: string | null;
  end_date: string | null;
}

export default function AdBanner({
  position,
  maxHeight = 250,
}: {
  position: string;
  maxHeight?: number;
}) {
  const [ad, setAd] = useState<Ad | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchAd = async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("id, name, image_url, target_url, start_date, end_date")
        .eq("position", position)
        .eq("is_active", true);

      if (error || !data || data.length === 0) return;

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const valid = data.find((item: Ad) => {
        if (item.start_date) {
          const start = new Date(item.start_date);
          start.setHours(0, 0, 0, 0);
          if (now < start) return false;
        }
        if (item.end_date) {
          const end = new Date(item.end_date);
          end.setHours(23, 59, 59, 999);
          if (now > end) return false;
        }
        return true;
      });

      if (valid) setAd(valid);
    };

    fetchAd();
  }, [position, supabase]);

  if (!ad) return null;

  return (
    <div className="w-full">
      {ad.target_url ? (
        <a
          href={ad.target_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={ad.image_url}
            alt={ad.name}
            className="w-full h-auto rounded-lg hover:opacity-95 transition-opacity object-contain"
            style={{ maxHeight: `${maxHeight}px` }}
            loading="lazy"
          />
        </a>
      ) : (
        <img
          src={ad.image_url}
          alt={ad.name}
          className="w-full h-auto rounded-lg object-contain"
          style={{ maxHeight: `${maxHeight}px` }}
          loading="lazy"
        />
      )}
    </div>
  );
}