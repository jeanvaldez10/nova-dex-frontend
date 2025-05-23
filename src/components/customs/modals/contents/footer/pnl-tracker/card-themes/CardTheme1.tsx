// ######## Libraries 📦 & Hooks 🪝 ########

// ######## Components 🧩 ########
import Image from "next/image";
import PnLTrackerSettingPopover from "../PnLTrackerSettingsPopover";
import PnLTrackerCardContentDefault from "../PnLTrackerCardContentDefault";
import PnLTrackerModalCard from "../PnLTrackerModalCard";

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { imageList } from "../PnLImageSelector";

// ######## Types 🗨️ ########
import { CommonCardThemeProps, Size } from "../types";
import { usePnlSettings } from "@/stores/use-pnl-settings";

export default function CardTheme1(props: CommonCardThemeProps) {
  const { selectedTheme } = usePnlSettings();
  const { size, onClose, isDragging } = props;
  const theme = imageList.find((theme) => theme.themeId === selectedTheme);
  return (
    <PnLTrackerModalCard minSize={theme?.size as Size} {...props}>
      <div className="relative z-10 flex h-full w-full flex-col">
        {/* Background Image */}
        <div className="absolute inset-[1px] -z-0 bg-black opacity-50" />
        <div className="absolute -z-10 h-full w-full bg-black/50">
          <Image
            src="/images/pnl-tracker/bg-theme-1.png"
            alt="PnL Background"
            fill
            quality={100}
            className="h-full w-full object-cover p-[1px]"
          />
        </div>

        {/* Header */}
        <div
          className={`relative z-[1000] flex w-full items-center justify-center ${size.width <= 300 ? "h-8 p-2" : "h-10 p-4"} pb-0`}
        >
          <div
            className={cn(
              "relative h-[24px] flex-shrink-0",
              size.width <= 300 ? "w-[56px]" : "w-[86.25px]",
            )}
          >
            <Image
              src="/images/pnl-tracker/logo-with-text.png"
              alt="Logo with text"
              fill
              quality={100}
              className="pointer-events-none object-contain"
            />
          </div>
          <div
            className={cn(
              "absolute right-4 flex gap-2 opacity-0 duration-100 group-hover:opacity-100",
            )}
          >
            <PnLTrackerSettingPopover />
            <button
              title="Close"
              onClick={onClose}
              className="relative size-6 flex-shrink-0 rounded-full bg-white/[8%] p-1 hover:bg-white/20"
            >
              <Image
                src="/icons/white-close.png"
                alt="Close Icon"
                quality={100}
                width={16}
                height={16}
                className="size-4 object-contain"
              />
            </button>
          </div>
        </div>

        {/* Main content */}
        <PnLTrackerCardContentDefault size={size} isDragging={isDragging} />
      </div>
    </PnLTrackerModalCard>
  );
}
