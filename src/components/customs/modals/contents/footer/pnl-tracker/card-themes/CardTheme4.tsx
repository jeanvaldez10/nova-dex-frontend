// ######## Libraries 📦 & Hooks 🪝 ########
import { usePnlSettings } from "@/stores/use-pnl-settings";
import { usePnlTrackerFooterData } from "@/hooks/use-pnl-tracker-footer-data";

// ######## Components 🧩 ########
import Image from "next/image";
import PnLTrackerSettingPopover from "../PnLTrackerSettingsPopover";
import PnLTrackerModalCard from "../PnLTrackerModalCard";

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { imageList } from "../PnLImageSelector";

// ######## Types 🗨️ ########
import { CommonCardThemeProps, Size } from "../types";
import { formatAmountWithoutLeadingZero } from "@/utils/formatAmount";

export default function CardTheme4(props: CommonCardThemeProps) {
  const { selectedTheme, profilePicture } = usePnlSettings();
  const { totalBalance, totalProfitAndLoss, isLoading } =
    usePnlTrackerFooterData();

  const { size, onClose } = props;
  const theme = imageList.find((theme) => theme.themeId === selectedTheme);
  return (
    <PnLTrackerModalCard minSize={theme?.size as Size} {...props}>
      <div className="relative z-10 flex h-full w-full flex-col">
        {/* header card */}
        <div
          className={`relative z-[1000] flex w-full items-center justify-end ${size.width <= 300 ? "h-8 p-2" : "h-10 p-4"} pb-0`}
        >
          <div
            className={cn(
              "flex gap-2 opacity-0 duration-100 group-hover:opacity-100",
            )}
          >
            <PnLTrackerSettingPopover alignPopoverContent="end" />
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
        <div className="absolute flex h-full w-full items-center justify-around bg-black/50 px-4 sm:px-6 md:px-8">
          <div className="relative z-20 flex flex-col items-center justify-center">
            <h3
              className="text-center align-middle font-outfitBold font-bold leading-none tracking-[0%] text-[#FFF]"
              style={{
                fontSize: `${calculateHeadingFontSize(size)}px`,
                filter: "drop-shadow(0px 4px 3px rgba(0,0,0,0.8))",
              }}
            >
              Balance
            </h3>
            <SolanaWithIcon
              size={size}
              amount={
                isLoading
                  ? "-"
                  : formatAmountWithoutLeadingZero(totalBalance, 2)
              }
            />
          </div>

          <div
            className={cn(
              "pointer-events-none z-20 -rotate-[4deg] gap-8 overflow-hidden rounded-xl drop-shadow-4xl",
            )}
            style={{
              width: `${Math.min(size.width * 0.23, size.height * 0.38)}px`,
              aspectRatio: "1/1",
            }}
          >
            <Image
              src={
                profilePicture
                  ? profilePicture
                  : "/images/pnl-tracker/nova-badge.png"
              }
              alt="Profile picture"
              fill
              className="pointer-events-none inset-0 size-full object-cover"
            />
          </div>
          <div className="relative z-20 flex flex-col items-center justify-center">
            <h3
              className="text-center align-middle font-outfitBold font-bold leading-none tracking-[0%] text-[#FFF]"
              style={{
                fontSize: `${calculateHeadingFontSize(size)}px`,
                filter: "drop-shadow(0px 4px 3px rgba(0,0,0,0.8))",
              }}
            >
              Profit Today
            </h3>
            <SolanaWithIcon
              size={size}
              amount={
                isLoading
                  ? "-"
                  : formatAmountWithoutLeadingZero(totalProfitAndLoss, 2)
              }
              color={totalProfitAndLoss >= 0 ? "profit" : "loss"}
            />
          </div>

          <Image
            src={theme?.src ?? "/images/pnl-tracker/bg-theme-4.png"}
            alt="PnL Background"
            fill
            quality={100}
            className="pointer-events-none size-full border-[4px] border-black object-cover p-[1px]"
          />
        </div>
      </div>
    </PnLTrackerModalCard>
  );
}

// Helper function to calculate heading font size based on container dimensions
function calculateHeadingFontSize(size: { width: number; height: number }) {
  if (size.width <= 300) return Math.min(12, size.width * 0.04);
  if (size.width <= 400) return Math.min(14, size.width * 0.045);
  if (size.width <= 500) return Math.min(16, size.width * 0.05);
  if (size.width <= 600) return Math.min(18, size.width * 0.055);
  return Math.min(24, size.width * 0.06);
}

function SolanaWithIcon({
  amount,
  size,
  color = "default",
}: {
  size: { width: number; height: number };
  amount: string;
  color?: "default" | "profit" | "loss";
}) {
  const calculateFontSize = () => {
    if (size.width <= 300) return Math.min(20, size.width * 0.08);
    if (size.width <= 400) return Math.min(26, size.width * 0.09);
    if (size.width <= 500) return Math.min(32, size.width * 0.1);
    if (size.width <= 600) return Math.min(40, size.width * 0.11);
    return Math.min(54, size.width * 0.12);
  };

  const fontSize = calculateFontSize();
  const iconSize = fontSize * 0.85;

  return (
    <div
      className={cn(
        "z-50 flex items-center justify-center",
        size.width <= 300 ? "gap-1" : size.width <= 400 ? "gap-1.5" : "gap-2",
      )}
    >
      <h3
        className={cn(
          "truncate bg-gradient-to-t bg-clip-text py-1 font-outfitBlack text-transparent",
          {
            "from-[#D179F3] via-[#DFA8F5] to-[#EDD8F8]": color === "default",
            "from-[#B0F379] to-[#D5F2D3]": color === "profit",
            "from-[#FD2525] to-[#FFA7A9]": color === "loss",
          },
        )}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: `${fontSize}px`,
          filter: "drop-shadow(0px 4px 3px rgba(0,0,0,0.8))",
          maxWidth: `${size.width * 0.25}px`,
        }}
      >
        {color === "profit" && "+"}
        {amount}
      </h3>
      <Image
        src={
          color === "default"
            ? "/images/pnl-tracker/sol-theme-2.png"
            : color === "profit"
              ? "/images/pnl-tracker/sol-theme-2-profit.png"
              : "/images/pnl-tracker/sol-theme-2-loss.png"
        }
        alt="Solana Icon"
        quality={100}
        width={32}
        height={32}
        className={cn("pointer-events-none flex-shrink-0 object-contain")}
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          filter: "drop-shadow(0px 4px 3px rgba(0,0,0,0.8))",
        }}
      />
    </div>
  );
}
