// ######## Libraries 📦 & Hooks 🪝 ########
import { usePnlTrackerFooterData } from "@/hooks/use-pnl-tracker-footer-data";
import { usePnlSettings } from "@/stores/use-pnl-settings";

// ######## Components 🧩 ########
import Image from "next/image";
import PnLTrackerSettingPopover from "../PnLTrackerSettingsPopover";
import PnLTrackerModalCard from "../PnLTrackerModalCard";

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { imageList } from "../PnLImageSelector";
import { formatAmountWithoutLeadingZero } from "@/utils/formatAmount";

// ######## Types 🗨️ ########
import { CommonCardThemeProps, Size } from "../types";

export default function CardTheme6(props: CommonCardThemeProps) {
  const { selectedTheme } = usePnlSettings();
  const { totalBalance, totalProfitAndLoss, isLoading } =
    usePnlTrackerFooterData();

  const getLogoTranslateY = () => {
    return Math.max(17, Math.min(35, size.height * 0.5));
  };

  const getLogoSize = () => {
    return Math.min(size.width * 0.9, size.height * 0.95);
  };

  const { size, onClose } = props;
  const theme = imageList.find((theme) => theme.themeId === selectedTheme);

  return (
    <PnLTrackerModalCard minSize={theme?.size as Size} {...props}>
      <div className="relative z-10 flex h-full w-full flex-col">
        {/* header card */}
        <div
          className={`relative z-[1000] flex w-full items-center justify-between ${size.width <= 300 ? "h-8 p-2" : "h-10 p-4"} pb-0`}
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
        <div className="absolute flex h-full w-full flex-col items-center justify-center gap-3.5 bg-black/50 px-11">
          <div className="relative flex w-full justify-between">
            <div className="items-left relative z-20 flex w-full flex-col justify-center gap-2">
              <h3
                className={cn(
                  "text-left font-geistBold leading-none tracking-[0%] text-white",
                  {
                    "text-xl": size.width > 500,
                  },
                )}
                style={{
                  filter: "drop-shadow(0px 8px 5px rgba(0,0,0,0.8))",
                }}
              >
                My current balance :
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
              className="absolute flex w-1/3 flex-col items-center justify-end"
              style={{
                right: "-2%",
              }}
            >
              <Image
                width={getLogoSize()}
                height={getLogoSize()}
                alt="Nova in Chat"
                src={"/icons/footer/3d-logo.svg"}
                className="pointer-events-none absolute left-1/2 top-0 z-[999] -translate-x-1/2"
                style={{
                  transform: `translateX(-50%) translateY(-${getLogoTranslateY()}%)`,
                }}
              />
            </div>
          </div>
          <div className="z-20 flex w-full items-baseline justify-between">
            <SolanaText
              size={size}
              amount={
                isLoading
                  ? "-"
                  : formatAmountWithoutLeadingZero(totalProfitAndLoss, 2)
              }
              isProfit={totalProfitAndLoss >= 0}
            />
            <div className="z-10 h-fit rounded-full bg-white px-3">
              <span
                className="whitespace-nowrap font-geistBold"
                style={{
                  fontSize: `${Math.min(size.width * 0.03, size.height)}px`,
                }}
              >
                !NOVA IN CHAT
              </span>
            </div>
          </div>

          <Image
            src={"/images/pnl-tracker/bg-theme-6.png"}
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

// Update SolanaWithIcon component for better responsive handling
function SolanaWithIcon({
  amount,
  size,
}: {
  size: { width: number; height: number };
  amount: string;
}) {
  const calculateFontSize = () => {
    const baseSize = Math.min(size.width * 0.3, size.height * 0.82);
    const fontSize = baseSize * 0.4;
    return Math.min(Math.max(fontSize, 24), 84);
  };

  const fontSize = calculateFontSize();
  return (
    <div
      className={cn(
        "justify-baseline z-50 flex items-end",
        size.width <= 400 ? "gap-2" : size.width <= 500 ? "gap-2" : "gap-4",
      )}
    >
      <h3
        className={cn(
          "bg-gradient-to-t from-[#D179F3] via-[#DFA8F5] to-[#EDD8F8] bg-clip-text font-outfitBlack text-transparent",
        )}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: `${fontSize}px`,
          filter: "drop-shadow(0px 8px 5px rgba(0,0,0,0.8))",
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
        className={cn("pointer-events-none mt-2 object-contain")}
        style={{
          width: `${fontSize * 0.85}px`,
          height: `${fontSize * 0.85}px`,
          filter: "drop-shadow(0px 8px 8px rgba(0,0,0,0.8))",
        }}
      />
    </div>
  );
}

// Update SolanaText component for better responsive handling
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
    const baseSize = Math.min(size.width * 0.6, size.height * 0.8);
    const fontSize = baseSize * 0.1;
    return Math.min(Math.max(fontSize, 24), 84);
  };

  const fontSize = calculateFontSize();

  return (
    <h3
      className={cn(
        "whitespace-nowrap py-2 font-outfitBold drop-shadow-4xl",
        isProfit
          ? "bg-gradient-to-t from-[#B0F379] to-[#D5F2D3] bg-clip-text text-transparent"
          : "bg-gradient-to-t from-[#FD2525] to-[#FFA7A9] bg-clip-text text-transparent",
      )}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${fontSize}px`,
        filter: "drop-shadow(0px 8px 7px rgba(0,0,0,0.8))",
      }}
    >
      {isProfit ? "+" : ""}
      {amount} Sol Today
    </h3>
  );
}
