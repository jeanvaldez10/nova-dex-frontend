import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import SocialLinkButton from "./buttons/SocialLinkButton";

import { fetchTruthSocialPosts, TSPost } from "@/apis/rest/social-feed";

import { truncateString } from "@/utils/truncateString";
import { IMAGE_PROXY_URL } from "./AvatarWithBadges";

const getTimeInfo = (timestamp: number | string) => {
  // Handle string dates (like "Sat Mar 29 19:27:06 +0000 2025")
  const parsedTimestamp =
    typeof timestamp === "string" && isNaN(Number(timestamp))
      ? new Date(timestamp).getTime()
      : Number(timestamp);

  const pastDate = new Date(parsedTimestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

  // Determine formatted time
  let formattedTime;
  if (diffInSeconds < 60) {
    formattedTime = "Just Now";
  } else if (diffInSeconds < 3600) {
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    formattedTime = `${diffInMinutes}m`;
  } else if (diffInSeconds < 86400) {
    const diffInHours = Math.floor(diffInSeconds / 3600);
    formattedTime = `${diffInHours}h`;
  } else {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[pastDate.getMonth()];
    const day = pastDate.getDate();
    formattedTime = `${month} ${day}`;
  }

  // Determine next update interval based on content age
  let nextUpdateInterval;
  if (diffInSeconds < 3600) {
    nextUpdateInterval = 60000;
  } else if (diffInSeconds < 86400) {
    nextUpdateInterval = 300000;
  } else {
    nextUpdateInterval = null;
  }

  return { formattedTime, nextUpdateInterval };
};

const unescapeUnicode = (str: string): string => {
  return str.replace(/\\u[\dA-F]{4}/gi, (match) =>
    String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16)),
  );
};

const sanitizeHtml = (rawHtml: string): string => {
  const unescaped = unescapeUnicode(rawHtml);

  const parser = new DOMParser();
  const doc = parser.parseFromString(unescaped, "text/html");

  const cleanNode = (node: Node): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;

      // Remove dangerous tags
      if (["SCRIPT", "STYLE"].includes(el.tagName)) {
        el.remove();
        return;
      }

      // Remove event handler attributes like onclick, onerror, etc.
      Array.from(el.attributes).forEach((attr) => {
        if (/^on/i.test(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });
    }

    // Recursively clean children
    node.childNodes.forEach(cleanNode);
  };

  cleanNode(doc.body);
  return doc.body.innerHTML;
};

const TruthSocialContent = ({ url }: { url: string }) => {
  const { data, isLoading, error } = useQuery<TSPost>({
    queryKey: ["truthsocial", url],
    queryFn: () => fetchTruthSocialPosts(url),
    enabled: !!url,
  });

  if (isLoading) {
    return (
      <div className="mt-4 flex h-24 items-center justify-center">
        <div className="relative size-6 animate-spin">
          <Image
            src="/icons/search-loading.png"
            alt="Loading"
            fill
            unoptimized={true}
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 flex h-24 items-center justify-center">
        <p className="font-geistRegular text-sm font-normal text-[#9191A4]">
          Error loading posts. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4 p-4">
      <div className="flex flex-col gap-y-4">
        <div className="flex items-center gap-x-2">
          <div className="relative aspect-square size-[42px] rounded-full">
            <Image
              src={
                data?.account.avatar ? data?.account?.avatar : ""
                // ? `${IMAGE_PROXY_URL}/proxy?url=${encodeURIComponent(data?.account.avatar)}`
                // : ""
              }
              alt="Profile"
              fill
              quality={100}
              unoptimized={true}
              className="rounded-full object-contain"
            />
          </div>
          <div className="flex flex-1 flex-col gap-y-0">
            <div className="flex items-center gap-x-1">
              <p className="font-geistSemiBold text-base font-semibold text-white">
                {truncateString(data?.account.display_name || "", 16)}
              </p>
              {data?.account.verified && (
                <div className="relative aspect-square size-5">
                  <Image
                    src="/icons/badge-verified.svg"
                    alt="Verified"
                    fill
                    quality={100}
                    className="object-contain"
                    unoptimized={true}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-x-1.5">
              <p className="font-geistRegular text-sm font-normal text-[#9191A4]">
                @{truncateString(data?.account.username || "", 13)}
              </p>
              <span className="block size-0.5 rounded-full bg-[#9191A4]"></span>
              <span className="font-geistRegular text-sm font-normal text-[#9191A4]">
                {getTimeInfo(data?.created_at || "").formattedTime}
              </span>
            </div>
          </div>
          <div className="relative aspect-square size-6">
            <Image
              src="/icons/social/truthsocial.svg"
              alt="Truth Social"
              fill
              quality={100}
              className="object-contain"
              unoptimized={true}
            />
          </div>
        </div>
        <div className="text-sm">
          <div
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(data?.content || ""),
            }}
          />
        </div>
        {data?.media_attachments?.length && (
          <div className="relative size-[252px] rounded-[16px]">
            <Image
              src={
                data.media_attachments[0].url ? data.media_attachments[0].url : ""
              //     ? `${IMAGE_PROXY_URL}/proxy?url=${encodeURIComponent(data.media_attachments[0].url)}`
              //     : ""
              }
              alt="post content image"
              fill
              quality={100}
              className="rounded-[16px] object-contain"
              unoptimized={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const TruthSocialHoverPopover = React.memo(
  ({
    url,
    unoptimized,
    containerSize,
    iconSize,
  }: {
    url: string;
    unoptimized?: boolean;
    containerSize?: string;
    iconSize?: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <TooltipProvider>
        <Tooltip delayDuration={0} onOpenChange={setIsOpen}>
          <TooltipTrigger>
            <SocialLinkButton
              unoptimized={unoptimized}
              variant={"primary"}
              size="sm"
              href={url}
              icon="truthsocial-eye"
              label="Truth Social"
              typeImage="svg"
              containerSize={containerSize}
              iconSize={iconSize}
            />
          </TooltipTrigger>
          <TooltipContent
            isWithAnimation={false}
            align="center"
            side="bottom"
            className="gb__white__popover nova-scroller z-[1000] max-h-[50dvh] w-[284px] rounded-[6px] border border-border bg-[#17171F] p-0 !transition-none"
          >
            {isOpen && (
              <React.Suspense>
                <TruthSocialContent url={url} />
              </React.Suspense>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

TruthSocialHoverPopover.displayName = "TruthSocialHoverPopover";

export default TruthSocialHoverPopover;
