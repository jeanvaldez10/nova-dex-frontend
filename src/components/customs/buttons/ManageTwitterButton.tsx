import BaseButton from "@/components/customs/buttons/BaseButton";
import { cn } from "@/libraries/utils";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import Image from "next/image";
import React from "react";

// Memoized ManageTwitterButton component
export const ManageTwitterButton = React.memo(
  ({
    isMobile = false,
    isFullscreen = false,
  }: {
    isMobile?: boolean;
    isFullscreen?: boolean;
  }) => {
    if (isMobile || !isFullscreen) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <BaseButton variant="gray" className="size-[32px]">
                <div className="relative z-30 aspect-square h-4 w-4 flex-shrink-0">
                  <Image
                    src="/icons/footer/setting-primary.svg"
                    alt="Setting Icon"
                    fill
                    quality={100}
                    className="object-contain"
                  />
                </div>
              </BaseButton>
            </TooltipTrigger>
            <TooltipContent className="z-[1000]">
              <p>Add to library</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <BaseButton
        variant="gray"
        className={cn("pl-2 pr-3 md:w-full", isFullscreen ? "h-10" : "h-8")}
        prefixIcon={
          <div
            className={cn(
              "relative aspect-square flex-shrink-0",
              isFullscreen ? "size-5" : "size-4",
            )}
          >
            <Image
              src="/icons/footer/setting-primary.svg"
              alt="Gray Setting Icon"
              fill
              quality={100}
              className="object-contain duration-300"
            />
          </div>
        }
      >
        <span
          className={cn(
            "inline-block whitespace-nowrap font-geistSemiBold text-fontColorPrimary",
            isFullscreen ? "text-base" : "text-sm",
          )}
        >
          Manage Twitter
        </span>
      </BaseButton>
    );
  },
);
ManageTwitterButton.displayName = "ManageTwitterButton";
