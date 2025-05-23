// ######## Libraries 📦 & Hooks 🪝 ########
import { usePnlSettings } from "@/stores/use-pnl-settings";
import { usePnlTrackerFooterData } from "@/hooks/use-pnl-tracker-footer-data";

// ######## Components 🧩 ########
import Image from "next/image";
import PnLTrackerSettingPopover from "../PnLTrackerSettingsPopover";
import PnLTrackerModalCard from "../PnLTrackerModalCard";

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

// ######## Types 🗨️ ########
import { CommonCardThemeProps, Size } from "../types";
import { imageList } from "../PnLImageSelector";
import {
  formatAmountDollar,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";

type Colors = "default" | "loss" | "profit";

export default function CardTheme9(props: CommonCardThemeProps) {
  const { selectedDisplayUSD, selectedTheme } = usePnlSettings();
  const { totalProfitAndLoss, solPrice, isLoading } = usePnlTrackerFooterData();

  const { size, onClose } = props;
  const theme = imageList.find((theme) => theme.themeId === selectedTheme);

  return (
    <PnLTrackerModalCard minSize={theme?.size as Size} {...props}>
      <div className="relative z-10 flex h-full w-full flex-col">
        {/* Background Image */}
        <div className="absolute inset-[1px] -z-0 bg-black opacity-20" />
        <div className="absolute -z-10 h-full w-full bg-black/50">
          <Image
            src={theme ? theme.src : "/images/pnl-tracker/bg-theme-9.png"}
            alt="PnL Background"
            fill
            quality={100}
            className="object-cover p-[1px]"
          />
        </div>

        {/* Header */}
        <div
          className={`relative flex w-full items-center justify-start ${size.width <= 300 ? "h-8 p-4" : "h-10 p-4"} pb-0`}
        >
          <div
            className={cn(
              "relative h-[24px] flex-shrink-0",
              size.width <= 300 ? "w-[56px]" : "w-[86.25px]",
            )}
          >
            <h2 className="whitespace-nowrap font-geistSemiBold leading-[1.1] tracking-[0px] text-fontColorPrimary opacity-0 duration-100 group-hover:opacity-100">
              P&L Tracker
            </h2>
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

        {/* Main Content */}
        <div className="flex h-full w-full flex-col items-center justify-start">
          <div
            className={cn(
              "flex h-full w-full flex-col items-center justify-center gap-2.5",
              size.height < 300 && "gap-1",
            )}
          >
            <h2
              className={cn(
                "text-center font-geistRegular text-[12px] uppercase leading-[1.2] tracking-[0%] !text-fontColorSecondary",
                {
                  "text-[10px]": size.width < 300,
                  "text-[14]": size.height > 400,
                },
              )}
            >
              Profit & Loss
            </h2>
            {selectedDisplayUSD === "Both" ? (
              <>
                <SolanaView
                  size={size}
                  amount={
                    isLoading
                      ? "-"
                      : formatAmountWithoutLeadingZero(totalProfitAndLoss, 2)
                  }
                  color={totalProfitAndLoss >= 0 ? "profit" : "loss"}
                />
                <USDView
                  size={size}
                  amount={
                    isLoading
                      ? "-"
                      : formatAmountDollar(
                          totalProfitAndLoss * solPrice,
                          "prefix",
                        )
                  }
                  color="default"
                />
              </>
            ) : selectedDisplayUSD === "USD" ? (
              <USDView
                size={size}
                amount={
                  isLoading
                    ? "-"
                    : formatAmountDollar(
                        totalProfitAndLoss * solPrice,
                        "prefix",
                      )
                }
                color={totalProfitAndLoss >= 0 ? "profit" : "loss"}
                isDisplayed
              />
            ) : (
              <SolanaView
                size={size}
                amount={
                  isLoading
                    ? "-"
                    : formatAmountWithoutLeadingZero(totalProfitAndLoss, 2)
                }
                color={totalProfitAndLoss >= 0 ? "profit" : "loss"}
              />
            )}
          </div>
        </div>
      </div>
    </PnLTrackerModalCard>
  );
}

function SolanaView({
  amount,
  size,
  color = "default",
}: {
  size: { width: number; height: number };
  amount: string;
  color: Colors;
}) {
  return (
    <div className="flex items-center justify-center gap-1">
      <Image
        src="/icons/solana.svg"
        alt="Solana Icon"
        quality={100}
        width={32}
        height={32}
        className={cn(
          "pointer-events-none object-contain",
          size.width <= 300 ? "size-6" : "size-10",
        )}
      />
      <h3
        className={cn(
          "font-geistBold font-semibold",
          color === "default"
            ? "text-fontColorPrimary"
            : color === "profit"
              ? "text-success"
              : "text-destructive",
          size.width <= 300
            ? "text-2xl"
            : size.width <= 400
              ? "text-3xl"
              : size.width <= 400 && size.height <= 200
                ? "text-4xl"
                : "text-5xl",
        )}
      >
        {color === "profit" && "+"}
        {amount}
      </h3>
    </div>
  );
}

function USDView({
  amount,
  size,
  color = "default",
  isDisplayed = false,
}: {
  size: { width: number; height: number };
  amount: string;
  color: Colors;
  isDisplayed?: boolean;
}) {
  return (
    <h4
      className={
        isDisplayed
          ? cn(
              "font-geistBold font-semibold",
              color === "default"
                ? "text-fontColorPrimary"
                : color === "profit"
                  ? "text-success"
                  : "text-destructive",
              size.width <= 300
                ? "text-lg"
                : size.width <= 400
                  ? "text-2xl"
                  : size.width <= 400 && size.height <= 200
                    ? "text-3xl"
                    : "text-4xl",
            )
          : cn(
              color === "default"
                ? "text-fontColorPrimary"
                : color === "profit"
                  ? "text-success"
                  : "text-destructive",
              size.width <= 300
                ? "text-base"
                : size.width <= 400
                  ? "text-lg"
                  : "text-xl",
            )
      }
    >
      {amount}
    </h4>
  );
}
