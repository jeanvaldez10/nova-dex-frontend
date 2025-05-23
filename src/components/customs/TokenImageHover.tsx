"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { HiCamera } from "react-icons/hi2";
import { cn } from "@/libraries/utils";

interface AvatarWithBadgesProps {
  src: string;
  handleGoogleLensSearch?: (e: React.MouseEvent, image: string) => void;
}

const IMAGE_PROXY_URL =
  process.env.NEXT_PUBLIC_IMAGE_PROXY_URL ||
  "https://nova-image-proxy.vercel.app";
const MAX_RETRIES = 7;

const TokenImageHover = ({
  src,
  handleGoogleLensSearch,
}: AvatarWithBadgesProps) => {
  const [retryCount, setRetryCount] = useState(0);

  const imageSrc = useMemo(() => {
    if (!src) return undefined;

    // If both direct and proxy approaches failed, use the first character as fallback
    if (retryCount >= MAX_RETRIES || src?.toLowerCase()?.includes("base64"))
      return src;

    // Try proxy if direct image failed
    return `${IMAGE_PROXY_URL}/proxy?url=${encodeURIComponent(src)}`;
  }, [src]);

  useEffect(() => {
    return () => {
      if (imageSrc) {
        const img = document.createElement("img");
        img.src = "";
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  const showFallback = !imageSrc;

  return (
    <>
      <Image
        key={`${imageSrc}-${retryCount >= MAX_RETRIES ? "proxy" : "direct"}-${retryCount}`}
        src={imageSrc as string}
        alt="token image"
        fill
        className="rounded-[8px] object-cover"
        priority
        unoptimized
        quality={50}
      />

      {handleGoogleLensSearch && imageSrc && !showFallback && (
        <button
          onClick={(e) => handleGoogleLensSearch(e, src || "")}
          className={cn(
            "absolute bottom-[8px] right-[8px] flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#000000]/70 opacity-100",
          )}
          aria-label="Search with Google Lens"
        >
          <Image
            src="/icons/token/google-lens-icon.svg"
            alt="Google Lens Icon"
            width={20}
            height={20}
          />
        </button>
      )}
    </>
  );
};

export default React.memo(TokenImageHover);
