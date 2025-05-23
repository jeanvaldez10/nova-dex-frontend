// ######## Libraries 📦 & Hooks 🪝 ########
import { usePnlSettings } from "@/stores/use-pnl-settings";

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

export default function CardTheme10(props: CommonCardThemeProps) {
  const { selectedTheme } = usePnlSettings();
  const { size, onClose, isDragging } = props;
  const theme = imageList.find((theme) => theme.themeId === selectedTheme);
  return (
    <PnLTrackerModalCard minSize={theme?.size as Size} {...props}>
      <div className="relative z-10 flex h-full w-full flex-col">
        {/* Background Image */}
        <div className="absolute inset-[1px] -z-0 bg-black opacity-20" />
        <div className="absolute -z-10 h-full w-full bg-black/50">
          <Image
            src="/images/pnl-tracker/bg-theme-10.png"
            alt="PnL Background"
            fill
            quality={100}
            className="object-cover"
          />
        </div>

        {/* Header */}
        <div
          className={`relative flex w-full items-center justify-start ${size.width <= 300 ? "h-8 p-4" : "h-10 p-4"} pb-0`}
        >
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

        {/* Main Content */}
        <PnLTrackerCardContentDefault size={size} isDragging={isDragging} />

        <div className="flex w-full items-start justify-center">
          <Image
            src="/icons/footer/3d-logo-straight.svg"
            alt="3D Logo"
            width={28}
            height={28}
            className="pointer-events-none mb-4"
          />
        </div>
      </div>
    </PnLTrackerModalCard>
  );
}
