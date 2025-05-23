"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TwitterUserStatusData } from "@/apis/rest/twitter";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { truncateString } from "@/utils/truncateString";
import { cn } from "@/libraries/utils";
import { fetchInstagramStatus } from "@/apis/rest/instagram";
import Link from "next/link";
export const renderTextWithInstagramLinks = (text: string) => {
  const urlRegex =
    /(https?:\/\/(?:www\.)?(?:instagram\.com|instagr\.am)\/[^\s]+|https?:\/\/[^\s]+|www\.[^\s]+|trib\.al\/[^\s]+|bit\.ly\/[^\s]+|tinyurl\.com\/[^\s]+)/g;
  const mentionRegex = /@([a-zA-Z0-9_.]+)/g;

  const parts = text.split(/(\s+)/);

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      const href = part.startsWith("http") ? part : `https://${part}`;
      return (
        <Link
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#E1306C] no-underline hover:underline"
        >
          {part}
        </Link>
      );
    }

    if (mentionRegex.test(part)) {
      let hasColon = false;
      let username = part.replace("@", "");

      if (username.includes(":")) {
        hasColon = true;
        username = username.slice(0, username.length - 1);
      }

      return (
        <React.Fragment key={index}>
          <Link
            href={`https://www.instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#405DE6] no-underline hover:underline"
          >
            @{username}
          </Link>
          {hasColon && <span>:</span>}
        </React.Fragment>
      );
    }

    return <span key={index}>{part}</span>;
  });
};

const InstagramPopoverContent = React.memo(
  ({
    href,
    setIsFetched,
  }: {
    href?: string;
    data?: TwitterUserStatusData | undefined;
    setIsFetched?: React.Dispatch<React.SetStateAction<boolean>>;
    isFetched?: boolean;
  }) => {
    const {
      data: fetchData,
      isLoading,
      error,
    } = useQuery({
      queryKey: ["instagram-status", href],
      queryFn: async () => {
        const res = await fetchInstagramStatus(href as string);
        setIsFetched?.(true);
        return res;
      },
      retry: 0,
    });

    return (
      <>
        {isLoading && !error && (
          <div className="flex h-24 items-center justify-center">
            <div className="relative size-6 animate-spin">
              <Image
                src="/icons/search-loading.png"
                alt="Loading"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        {(error || !fetchData?.posting_account?.username) && !isLoading && (
          <div className="flex h-24 items-center justify-center">
            <p className="font-geistRegular text-sm font-normal text-[#9191A4]">
              Error loading posts. Please try again later.
            </p>
          </div>
        )}

        {!isLoading && (
          <>
            {fetchData?.posting_account?.username ? (
              <div className="flex flex-col gap-y-4 p-4">
                <div className="flex items-center gap-x-2">
                  <div className="relative aspect-square size-[42px] rounded-full">
                    <Image
                      src={fetchData?.posting_account?.profile_pic_url || ""}
                      alt="Profile"
                      fill
                      quality={100}
                      className="rounded-full object-contain"
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-y-0">
                    <div className="flex items-center gap-x-1">
                      <p className="font-geistSemiBold text-base font-semibold text-white">
                        {truncateString(
                          fetchData?.posting_account?.username || "",
                          16,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="relative aspect-square size-6">
                    <Image
                      src="/icons/social/instagram.svg"
                      alt="X"
                      fill
                      quality={100}
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="nova-scroller max-h-[300px] text-sm">
                  {fetchData?.text_content?.split("\n").map((line, index) => (
                    <React.Fragment key={`content-${index}`}>
                      {renderTextWithInstagramLinks(line)}
                      <br />
                    </React.Fragment>
                  ))}
                </div>

                {Boolean(fetchData?.thumbnail?.length) && (
                  <div className="relative size-[252px] rounded-[16px]">
                    <Image
                      src={fetchData?.thumbnail}
                      alt="twitter content image"
                      fill
                      quality={100}
                      className="rounded-[16px] object-contain"
                    />
                  </div>
                )}
              </div>
            ) : null}
          </>
        )}
      </>
    );
  },
);

InstagramPopoverContent.displayName = "InstagramPopoverContent";

const InstagramPopover = React.memo(
  ({
    href,
    align = "center",
    variant = "primary",
    data,
    containerSize,
    iconSize,
  }: {
    href?: string;
    align?: "center" | "end" | "start";
    variant?: "primary" | "secondary";
    data?: TwitterUserStatusData;
    containerSize?: string;
    iconSize?: string;
  }) => {
    const [isFetched, setIsFetched] = useState(false);

    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              href={href as string}
              target="_blank"
              className={cn(
                "gb__white__btn_xs relative flex h-[20px] flex-shrink-0 items-center justify-center rounded-[4px] duration-300 hover:bg-white/[12%]",
                variant === "primary" ? "bg-white/[6%]" : "bg-[#272734]",
                !isFetched
                  ? "aspect-square size-[20px]"
                  : "w-auto gap-0.5 p-1.5",
                containerSize,
              )}
            >
              <div
                className={cn(
                  "relative aspect-square size-[16px] flex-shrink-0",
                  iconSize,
                )}
              >
                <Image
                  src="/icons/social/instagram-eye.svg"
                  alt="Instagram Social Icon"
                  fill
                  quality={100}
                  loading="lazy"
                  className="object-contain"
                />
              </div>
            </Link>
          </TooltipTrigger>

          <TooltipContent
            isWithAnimation={false}
            align={align}
            side="bottom"
            className="gb__white__popover z-[1000] w-[284px] rounded-[6px] border border-border bg-[#17171F] p-0 !transition-none"
          >
            <InstagramPopoverContent
              setIsFetched={setIsFetched}
              isFetched={isFetched}
              href={href as string}
            />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

InstagramPopover.displayName = "InstagramPopover";

export default InstagramPopover;
