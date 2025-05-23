import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/libraries/utils";
import truncateCA from "@/utils/truncateCA";
import React from "react";

export const TokenName = React.memo(
  ({
    isSnapOpen,
    name,
    migrating,
  }: {
    name: string;
    isSnapOpen: boolean;
    migrating: boolean;
  }) => {
    return (
      <div className="relative z-30" id="social-links-first">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "text-nowrap text-xs leading-none",
                  migrating
                    ? "text-fontColorPrimary/70"
                    : "text-fontColorSecondary",
                  isSnapOpen && "hidden",
                )}
              >
                {truncateCA(name || "", 10)}
              </span>
            </TooltipTrigger>
            <TooltipContent isWithAnimation={false}>
              <p>{name || ""}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  },
);

TokenName.displayName = "TokenName"; // Optional: Add a display name for debugging
