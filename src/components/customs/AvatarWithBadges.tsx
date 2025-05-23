"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useState, useMemo, useEffect } from "react";
// ######## Components 🧩 ########
import Image from "next/image";
import { HiCamera } from "react-icons/hi2";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

export type BadgeType =
  | "moonshot"
  | "pumpfun"
  | "launchlab"
  | "raydium"
  | "boop"
  | "dynamic_bonding_curve"
  | "meteora_dlmm"
  | "meteora_dyn"
  | "pumpswap";
export type AvatarSize = "xs" | "sm" | "md" | "lg";

interface AvatarWithBadgesProps {
  symbol?: string;
  src?: string;
  alt: string;
  leftType?: BadgeType;
  rightType?: BadgeType;
  className?: string;
  classNameParent?: string;
  leftClassName?: string;
  rightClassName?: string;
  handleGoogleLensSearch?: (e: React.MouseEvent, image: string) => void;
  cameraIconClassname?: string;
  size?: AvatarSize;
  sizeConstant?: number;
  badgeSizeConstant?: number;
}

// Cache badge image paths to avoid repeated calculations
const BADGE_IMAGE_PATHS: Record<BadgeType, { src: string; alt: string }> = {
  moonshot: { src: "/icons/asset/moonshot.png", alt: "Moonshot Icon" },
  pumpfun: { src: "/icons/asset/pumpfun.png", alt: "Pumpfun Icon" },
  launchlab: { src: "/icons/asset/raydium.png", alt: "LaunchLab Icon" },
  raydium: {
    src: "/icons/asset/raydium.png",
    alt: "Dynamic Bonding Curve Icon",
  },
  boop: {
    src: "/icons/asset/boop.png",
    alt: "Boop Icon",
  },
  dynamic_bonding_curve: {
    src: "/icons/asset/meteora.png",
    alt: "Dynamic Bonding Curve Icon",
  },
  meteora_dlmm: { src: "/icons/asset/meteora.png", alt: "Meteora DLMM Icon" },
  meteora_dyn: { src: "/icons/asset/meteora.png", alt: "Meteora DYN Icon" },
  pumpswap: { src: "/icons/asset/pumpfun.png", alt: "Pumpswap Icon" },
};

// Size mapping constants to avoid repetitive ternary operations
const SIZE_MAPPINGS = {
  xs: {
    avatar: "size-6 md:size-7",
    badge: "size-[10px]",
  },
  sm: {
    avatar: "size-7 md:size-8",
    badge: "size-[12px]",
  },
  md: {
    avatar: "size-10 md:size-10",
    badge: "size-[14px]",
  },
  lg: {
    avatar: "size-12 md:size-[56px]",
    badge: "-bottom-0.5 -right-0.5 size-[17px]",
  },
};

export const IMAGE_PROXY_URL =
  process.env.NEXT_PUBLIC_IMAGE_PROXY_URL ||
  "https://nova-image-proxy.vercel.app";
const MAX_RETRIES = 7;

/**
 * AvatarWithBadges - A customizable avatar component with optional badges
 *
 * @param props - Component properties
 * @returns React component
 */
const AvatarWithBadges = ({
  symbol,
  src,
  alt,
  leftType,
  rightType,
  className,
  classNameParent,
  leftClassName,
  rightClassName,
  handleGoogleLensSearch,
  cameraIconClassname,
  size = "sm",
  sizeConstant,
  badgeSizeConstant,
}: AvatarWithBadgesProps) => {
  const [retryCount, setRetryCount] = useState(0);

  // Memoize the image source to prevent unnecessary re-renders
  const imageSrc = useMemo(() => {
    if (!src) return undefined;

    if (src && src.startsWith("/images/")) return src;

    // If both direct and proxy approaches failed, use the first character as fallback
    if (retryCount >= MAX_RETRIES || src?.toLowerCase()?.includes("base64"))
      return src;

    // Try proxy if direct image failed
    return `${IMAGE_PROXY_URL}/proxy?url=${encodeURIComponent(src)}&fallback=${symbol?.[0] || alt?.[1]}`.trimEnd();
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

  // Get size classes from mapping constants
  const sizeClasses = SIZE_MAPPINGS[size];

  // Render a badge
  const renderBadge = (
    type: BadgeType | undefined,
    position: "left" | "right",
    additionalClassName?: string,
  ) => {
    if (!type) return null;

    const badge = BADGE_IMAGE_PATHS[type];
    const positionClass =
      position === "left"
        ? `bottom-0 left-0 ${additionalClassName}`
        : `bottom-0 right-0 ${additionalClassName}`;

    return (
      <div
        className={cn(
          `absolute z-10 rounded-full bg-black ${sizeClasses.badge}`,
          positionClass,
          type === "pumpswap" && "hue-rotate-[120deg] saturate-150",
          type === "launchlab" && "hue-rotate-[150deg] saturate-200",
          type === "dynamic_bonding_curve" &&
            "brightness-150 hue-rotate-[80deg] saturate-150",
        )}
        aria-label={badge?.alt || "Badge"}
      >
        <Image
          key={badge?.src}
          src={badge?.src}
          alt={badge?.alt || "Badge"}
          {...(badgeSizeConstant
            ? {
                height: badgeSizeConstant,
                width: badgeSizeConstant,
              }
            : { fill: true })}
          unoptimized
          quality={50}
          // priority
          className="object-contain"
          sizes={`${parseInt(sizeClasses.badge)}px`}
        />
      </div>
    );
  };

  // Determine if we're showing the fallback (either no image or failed completely)
  const showFallback = !imageSrc;

  return (
    <>
      {/* <p className="text-white">{imageError ? src : null}</p> */}
      <div
        className={cn(
          "group/avatar avatar-with-badges relative flex aspect-square flex-shrink-0 items-center justify-center rounded-full",
          sizeClasses.avatar,
          classNameParent,
        )}
      >
        <div
          className={cn(
            "relative aspect-square size-full rounded-full",
            className,
            !showFallback &&
              handleGoogleLensSearch &&
              "cursor-pointer transition-opacity duration-300 ease-out hover:opacity-0",
          )}
        >
          {src ? (
            <Image
              key={`${imageSrc}-${retryCount >= MAX_RETRIES ? "proxy" : "direct"}-${retryCount}`}
              src={imageSrc as string}
              alt={alt}
              {...(sizeConstant
                ? {
                    height: sizeConstant,
                    width: sizeConstant,
                  }
                : { fill: true })}
              quality={50}
              // priority
              unoptimized
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className={cn("size-full rounded-full object-cover")}
              onError={() =>
                retryCount < MAX_RETRIES && setRetryCount((prev) => prev + 1)
              }
            />
          ) : (
            <div className="flex size-full items-center justify-center rounded-full">
              {symbol ? (
                <span className="inline-block text-lg font-medium uppercase leading-none text-white md:text-xl">
                  {symbol?.[0]}
                </span>
              ) : (
                <span className="inline-block text-lg font-medium uppercase leading-none text-white md:text-xl">
                  {alt?.[1]}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Left Badge */}
        {renderBadge(leftType, "left", leftClassName)}

        {/* Right Badge */}
        {renderBadge(rightType, "right", rightClassName)}

        {/* Google Lens Search Overlay - only show if we have a valid image */}
        {handleGoogleLensSearch && imageSrc && !showFallback && (
          <button
            onClick={(e) => handleGoogleLensSearch(e, src || "")}
            className={cn(
              "invisible absolute left-1/2 top-1/2 flex h-full w-full -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#360146]/50 opacity-0 duration-100 group-hover/avatar:visible group-hover/avatar:opacity-100",
            )}
            aria-label="Search with Google Lens"
          >
            <HiCamera
              className={cn(
                "text-[28px] text-fontColorPrimary",
                cameraIconClassname,
              )}
            />
          </button>
        )}
      </div>
    </>
  );
};

// Only re-render if props actually change
export default React.memo(AvatarWithBadges);
