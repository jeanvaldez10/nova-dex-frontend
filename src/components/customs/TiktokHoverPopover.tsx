import React, { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import SocialLinkButton from "./buttons/SocialLinkButton";
import Image from "next/image";
import { truncateString } from "@/utils/truncateString";
import { fetchTiktokPosts, TiktokPost } from "@/apis/rest/social-feed";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TiktokContent = ({ url }: { url: string }) => {
  const { data, isLoading, error } = useQuery<TiktokPost>({
    queryKey: ["tiktok", url],
    queryFn: () => fetchTiktokPosts(url),
    enabled: !!url,
  });

  const [current, setCurrent] = useState(0);
  const images = data?.image_urls || [];
  const videoRef = useRef<HTMLVideoElement>(null);

  const next = () => setCurrent((prev) => (prev + 1) % images.length);
  const prev = () =>
    setCurrent((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        videoRef.current.remove();
      }
    };
  }, []);

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
      <div className="flex items-center gap-x-2">
        <div className="flex flex-1 flex-col gap-y-0">
          <div className="flex items-center gap-x-1.5">
            <p className="font-geistRegular text-sm font-normal text-[#9191A4]">
              @{truncateString(data?.posting_account.username || "", 13)}
            </p>
          </div>
        </div>
        <div className="relative aspect-square size-6">
          <Image
            src="/icons/social/tiktok-white.svg"
            alt="Tiktok"
            fill
            quality={100}
            className="object-contain"
            unoptimized={true}
          />
        </div>
      </div>
      <div>
        <div className="relative h-auto w-full overflow-hidden rounded-[6px]">
          {!data?.video_url && data?.image_urls ? (
            images.length > 1 ? (
              <div className="h-64">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={images[current]}
                      alt={`Image-${current}`}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Carousel Controls */}
                <div className="absolute inset-0 flex items-center justify-between px-2">
                  <button
                    title="previous button"
                    onClick={prev}
                    className="rounded-full bg-black/50 p-1 transition hover:bg-black/70"
                  >
                    <ChevronLeft className="size-4 text-white" />
                  </button>
                  <button
                    title="next button"
                    onClick={next}
                    className="rounded-full bg-black/50 p-1 transition hover:bg-black/70"
                  >
                    <ChevronRight className="size-4 text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <Image
                src={images[0]}
                alt="Single Image"
                fill
                className="object-contain"
                unoptimized
              />
            )
          ) : (
            <video
              ref={videoRef}
              key={data?.video_url}
              src={data?.video_url}
              className="rounded-[6px]"
              controls
              width="100%"
              height="auto"
              controlsList="nodownload"
              disablePictureInPicture
              playsInline
              autoPlay
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  );
};

const TiktokHoverPopover = React.memo(
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
              icon="tiktok-eye"
              label="Tiktok"
              typeImage="svg"
              containerSize={containerSize}
              iconSize={iconSize}
            />
          </TooltipTrigger>
          <TooltipContent
            isWithAnimation={false}
            align="center"
            side="bottom"
            className="gb__white__popover z-[1000] max-h-[50dvh] w-[284px] overflow-y-auto rounded-[6px] border border-border bg-[#17171F] p-0 !transition-none"
          >
            {isOpen && <TiktokContent url={url} />}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

TiktokHoverPopover.displayName = "TiktokHoverPopover";

export default TiktokHoverPopover;
