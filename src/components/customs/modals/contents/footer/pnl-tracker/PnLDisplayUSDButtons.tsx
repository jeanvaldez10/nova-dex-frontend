// ######## Libraries 📦 & Hooks 🪝 ########
import * as React from "react";

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

// ######## Types 🗨️ ########
import type { Display } from "./types";

const displayOptions = ["USD", "SOL", "Both"];

const PnLDisplayUSDButtons = ({
  activeDisplay,
  setActiveDisplay,
}: {
  activeDisplay: string | number;
  setActiveDisplay: (preset: Display) => void;
  onDisplaySelect?: () => void;
}) => {
  const handleButtonClick = (option: Display) => {
    setActiveDisplay(option);
  };
  return (
    <div className="flex h-[32px] w-full flex-shrink-0 items-center overflow-hidden rounded-[8px] border border-border">
      <div className="h-full flex-grow p-[3px]">
        <div className="flex h-full w-full items-center gap-[1px] rounded-[6px] bg-white/[6%] p-0.5">
          {displayOptions?.map((option, index) => {
            const isActive = activeDisplay === option;
            return (
              <button
                type="button"
                key={index + option}
                onClick={() => handleButtonClick(option as Display)}
                className={cn(
                  "h-full w-full rounded-[6px] px-3 font-geistSemiBold text-sm leading-3 text-fontColorPrimary duration-300",
                  isActive ? "bg-white/[12%]" : "bg-transparent",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PnLDisplayUSDButtons);
