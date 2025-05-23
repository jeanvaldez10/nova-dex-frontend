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
import {
  formatAmountDollar,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";

export default function CardTheme5(props: CommonCardThemeProps) {
  const { selectedDisplayUSD, selectedTheme } = usePnlSettings();
  const {
    totalBalance,
    totalProfitAndLoss,
    totalProfitAndLossPercentage,
    solPrice,
    isLoading,
  } = usePnlTrackerFooterData();

  const { size, onClose } = props;
  const theme = imageList.find((theme) => theme.themeId === selectedTheme);
  return (
    <PnLTrackerModalCard minSize={theme?.size as Size} {...props}>
      <div className="relative z-10 flex h-full w-full flex-col">
        <div
          className={`relative flex w-full items-center justify-center ${size.width <= 300 ? "h-8 p-2" : "h-10 p-4"} pb-0`}
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
        <div className="absolute -z-10 h-full w-full bg-black/50">
          <div
            className={cn(
              "absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden",
              size.width < 300
                ? "gap-4"
                : size.width < 500
                  ? "gap-8"
                  : "gap-10",
            )}
          >
            <div className="flex w-full justify-between px-8">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <Image
                    src="/icons/wallet-yellow.svg"
                    alt="Sol Icon"
                    quality={100}
                    width={16}
                    height={16}
                    className="pointer-events-none size-4 object-contain"
                  />
                  <span className="text-sm text-white/80">My Balance</span>
                </div>
                {selectedDisplayUSD === "SOL" ||
                selectedDisplayUSD === "Both" ? (
                  <DisplayedAmount
                    size={size}
                    amount={
                      isLoading
                        ? "-"
                        : formatAmountWithoutLeadingZero(totalBalance, 2)
                    }
                    color="default"
                  />
                ) : (
                  <DisplayedAmount
                    size={size}
                    amount={
                      isLoading
                        ? "-"
                        : formatAmountDollar(totalBalance * solPrice, "suffix")
                    }
                    color="default"
                    prefix=""
                    display="usd"
                  />
                )}
                <div
                  className={cn(
                    "mt-1 text-sm font-semibold",
                    Number(totalProfitAndLossPercentage) >= 0
                      ? "text-[#0FF7AD]"
                      : "text-[#FF1212]",
                  )}
                >
                  {Number(totalProfitAndLossPercentage) >= 0 ? "↑ " : "↓ "}
                  {isLoading
                    ? "-"
                    : totalProfitAndLossPercentage.toFixed(2)}%{" "}
                  {selectedDisplayUSD === "USD" ||
                  selectedDisplayUSD === "Both" ? (
                    <span
                      className={cn("ml-2 font-normal text-white/60", {
                        hidden: selectedDisplayUSD === "USD",
                      })}
                    >
                      {isLoading
                        ? "-"
                        : formatAmountDollar(totalBalance * solPrice, "suffix")}
                    </span>
                  ) : null}
                </div>
              </div>

              <Image
                src="/icons/footer/3d-logo.svg"
                alt="Nova Icon"
                quality={100}
                width={Math.min(size.width * 0.17, size.height * 0.5)}
                height={Math.min(size.width * 0.17, size.height * 0.5)}
                className="pointer-events-none object-contain"
              />

              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-2">
                  <Image
                    src="/icons/profit.svg"
                    alt="Profit Icon"
                    quality={100}
                    width={16}
                    height={16}
                    className="pointer-events-none size-4 object-contain"
                  />
                  <span className="text-sm text-white/80">Profit Today</span>
                </div>
                {selectedDisplayUSD === "SOL" ||
                selectedDisplayUSD === "Both" ? (
                  <DisplayedAmount
                    size={size}
                    amount={
                      isLoading
                        ? "-"
                        : formatAmountWithoutLeadingZero(totalProfitAndLoss, 2)
                    }
                    color={totalProfitAndLoss >= 0 ? "profit" : "loss"}
                    prefix={totalProfitAndLoss >= 0 ? "+" : ""}
                  />
                ) : (
                  <DisplayedAmount
                    size={size}
                    amount={
                      isLoading
                        ? "-"
                        : formatAmountDollar(
                            totalProfitAndLoss * solPrice,
                            "suffix",
                          )
                    }
                    color={totalProfitAndLoss >= 0 ? "profit" : "loss"}
                    prefix={totalProfitAndLoss >= 0 ? "+" : ""}
                    display="usd"
                  />
                  // <span
                  //   className={cn("ml-2 font-normal text-white/60", {
                  //     "mt-1 font-geistBold text-2xl text-white":
                  //       selectedDisplayUSD === "USD",
                  //   })}
                  // >
                  //   {isLoading
                  //     ? "-"
                  //     : formatAmountDollar(
                  //         totalProfitAndLoss * solPrice,
                  //         "suffix",
                  //       )}
                  // </span>
                )}
                <div
                  className={cn(
                    "mt-1 text-sm font-semibold",
                    Number(totalProfitAndLossPercentage) >= 0
                      ? "text-[#0FF7AD]"
                      : "text-[#FF1212]",
                  )}
                >
                  {Number(totalProfitAndLossPercentage) >= 0 ? "↑ " : "↓ "}
                  {isLoading
                    ? "-"
                    : totalProfitAndLossPercentage.toFixed(2)}%{" "}
                  {selectedDisplayUSD === "USD" ||
                  selectedDisplayUSD === "Both" ? (
                    <span
                      className={cn("ml-2 font-normal text-white/60", {
                        hidden: selectedDisplayUSD === "USD",
                      })}
                    >
                      {isLoading
                        ? "-"
                        : formatAmountDollar(
                            totalProfitAndLoss * solPrice,
                            "suffix",
                          )}
                    </span>
                  ) : null}
                </div>
              </div>

              <Image
                src="/images/pnl-tracker/bg-theme-5.png"
                alt="PnL Background"
                fill
                quality={100}
                className="pointer-events-none -z-10 size-full border-[4px] border-black object-cover p-[1px]"
              />
            </div>
          </div>
        </div>
      </div>
    </PnLTrackerModalCard>
  );
}

function DisplayedAmount({
  amount,
  size,
  prefix = "",
  color,
  display = "sol",
}: {
  size: { width: number; height: number };
  amount: string;
  prefix?: string;
  color: "default" | "profit" | "loss";
  display?: "sol" | "usd";
}) {
  const calculateFontSize = () => {
    const baseSize = Math.min(size.width * 0.3, size.height);
    const fontSize = baseSize * 0.2;
    return Math.min(Math.max(fontSize, 32), 84);
  };

  const fontSize = calculateFontSize();
  return (
    <div className={cn("z-50 flex items-center justify-start gap-2")}>
      <h3
        className={cn(
          "bg-white bg-clip-text py-3 font-outfitBold text-transparent drop-shadow-4xl",
          color === "profit" && "text-[#0FF7AD]",
          color === "loss" && "text-[#FF1212]",
        )}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: `${fontSize}px`,
        }}
      >
        {prefix}
        {amount}
      </h3>
      <Image
        src={
          color === "default"
            ? "/images/pnl-tracker/solana-white.png"
            : color === "profit"
              ? "/images/pnl-tracker/solana-green.png"
              : "/images/pnl-tracker/solana-red.png"
        }
        alt="Solana Icon"
        quality={100}
        width={32}
        height={32}
        className={cn(
          "pointer-events-none object-contain",
          display === "usd" && "hidden",
        )}
        style={{
          width: `${fontSize * 0.8}px`,
          height: `${fontSize * 0.8}px`,
        }}
      />
    </div>
  );
}
