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

export default function CardTheme2(props: CommonCardThemeProps) {
  const { profilePicture, selectedTheme } = usePnlSettings();
  const { totalProfitAndLoss, totalBalance, isLoading } =
    usePnlTrackerFooterData();

  const { size, onClose } = props;
  const theme = imageList.find((theme) => theme.themeId === selectedTheme);

  return (
    <PnLTrackerModalCard minSize={theme?.size as Size} {...props}>
      <div className="relative z-10 flex h-full w-full flex-col">
        <div
          className={cn(
            "pointer-events-none absolute z-[1000] aspect-square rotate-[4deg] drop-shadow-4xl",
            size.width <= 400
              ? "-right-6 -top-4 size-[56px]"
              : size.width <= 500
                ? "-right-7 -top-5 size-[68px]"
                : "-right-10 -top-8 size-[80px]",
          )}
        >
          <Image
            src="/images/pnl-tracker/nova-badge.png"
            alt="Nova Badge"
            fill
            className="pointer-events-none object-cover"
          />
        </div>

        {/* Header Card */}
        <div
          className={`relative z-[1000] flex w-full items-center justify-start ${
            size.width <= 300 ? "h-8 p-2" : "h-10 p-4"
          } pb-0`}
        >
          <div
            className={cn(
              "flex gap-2 opacity-0 duration-100 group-hover:opacity-100",
            )}
          >
            <PnLTrackerSettingPopover alignPopoverContent="start" />
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
        <div className={cn("relative inset-[1px] -z-0 bg-black opacity-20")} />
        <div className="absolute -z-10 h-full w-full bg-black/50">
          <div
            className={cn(
              "absolute inset-0 z-10 flex items-center justify-center overflow-hidden",
              size.width < 300
                ? "gap-4"
                : size.width < 400
                  ? "gap-6"
                  : size.width < 500
                    ? "gap-8"
                    : "gap-10",
            )}
          >
            <div
              className={cn("flex overflow-hidden rounded-xl drop-shadow-4xl")}
              style={{
                width: `${Math.min(size.width * 0.28, size.height * 0.4)}px`,
                transform: "rotate(-6deg)",
                aspectRatio: "1/1",
              }}
            >
              <Image
                src={
                  profilePicture
                    ? profilePicture
                    : "/images/pnl-tracker/nova-logo-pfp-default.png"
                }
                alt="Profile picture"
                fill
                className="pointer-events-none inset-0 size-full object-cover"
              />
            </div>
            <div className="max-w-[65%] space-y-0.5">
              <SolanaWithIcon
                size={size}
                amount={
                  isLoading
                    ? "-"
                    : formatAmountWithoutLeadingZero(totalBalance, 2)
                }
              />
              <SolanaText
                size={size}
                amount={
                  isLoading
                    ? "-"
                    : formatAmountWithoutLeadingZero(totalProfitAndLoss, 2)
                }
                isProfit={totalProfitAndLoss >= 0}
              />
            </div>
          </div>

          <Image
            src={"/images/pnl-tracker/bg-theme-2.png"}
            alt="PnL Background"
            fill
            quality={100}
            className="pointer-events-none h-full w-full border-[4px] border-black object-cover p-[1px]"
          />
        </div>
      </div>
    </PnLTrackerModalCard>
  );
}

function SolanaWithIcon({
  amount,
  size,
}: {
  size: { width: number; height: number };
  amount: string;
}) {
  const calculateFontSize = () => {
    if (size.width <= 300) return Math.min(28, size.width * 0.1);
    if (size.width <= 400) return Math.min(36, size.width * 0.11);
    if (size.width <= 500) return Math.min(48, size.width * 0.12);
    if (size.width <= 600) return Math.min(60, size.width * 0.13);
    return Math.min(72, size.width * 0.14);
  };

  const fontSize = calculateFontSize();
  const iconSize = fontSize * 0.8;

  return (
    <div
      className={cn(
        "z-50 flex items-end justify-start",
        size.width <= 300 ? "gap-1" : size.width <= 400 ? "gap-1.5" : "gap-2",
      )}
    >
      <h3
        className={cn(
          "truncate bg-gradient-to-t from-[#D179F3] via-[#DFA8F5] to-[#EDD8F8] bg-clip-text font-outfitBlack text-transparent drop-shadow-4xl",
        )}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: `${fontSize}px`,
          maxWidth: `${size.width * 0.5}px`,
        }}
      >
        {amount}
      </h3>
      <Image
        src="/images/pnl-tracker/sol-theme-2.png"
        alt="Solana Icon"
        quality={100}
        width={32}
        height={32}
        className={cn("pointer-events-none flex-shrink-0 object-contain")}
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          marginBottom: `${fontSize * 0.1}px`,
        }}
      />
    </div>
  );
}

function SolanaText({
  amount,
  size,
  isProfit = true,
}: {
  size: { width: number; height: number };
  amount: string;
  isProfit?: boolean;
}) {
  const calculateFontSize = () => {
    if (size.width <= 300) return Math.min(22, size.width * 0.08);
    if (size.width <= 400) return Math.min(28, size.width * 0.085);
    if (size.width <= 500) return Math.min(36, size.width * 0.09);
    if (size.width <= 600) return Math.min(42, size.width * 0.095);
    return Math.min(58, size.width * 0.1);
  };

  const fontSize = calculateFontSize();

  return (
    <h3
      className={cn(
        "truncate font-outfitBold drop-shadow-4xl",
        isProfit
          ? "bg-gradient-to-t from-[#B0F379] to-[#D5F2D3] bg-clip-text text-transparent"
          : "bg-gradient-to-t from-[#FD2525] to-[#FFA7A9] bg-clip-text text-transparent",
      )}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${fontSize * 1.2}px`,
        filter: "drop-shadow(0px 4px 3px rgba(0,0,0,0.8))",
        maxWidth: `${size.width * 0.65}px`,
      }}
    >
      {isProfit ? "+" : ""}
      {amount} Sol Today
    </h3>
  );
}
