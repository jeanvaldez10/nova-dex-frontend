// ######## Libraries 📦 & Hooks 🪝 ########
import { motion } from "framer-motion";
import { usePnlSettings } from "@/stores/use-pnl-settings";

// ######## Components 🧩 ########
import Image from "next/image";
import Separator from "@/components/customs/Separator";

// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { usePnlTrackerFooterData } from "@/hooks/use-pnl-tracker-footer-data";
import {
  formatAmountDollar,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";

// ######## Types 🗨️ ########
type Colors = "default" | "loss" | "profit";

export default function PnLTrackerCardContentDefault({
  isDragging,
  size,
}: {
  isDragging: boolean;
  size: { width: number; height: number };
}) {
  const { selectedDisplayUSD } = usePnlSettings();
  const { isLoading, totalBalance, solPrice, totalProfitAndLoss } =
    usePnlTrackerFooterData();

  return (
    <div className="relative z-20 flex flex-1 items-center px-4">
      <div className="flex h-full w-full items-center gap-4">
        {/* Balance Card */}
        <motion.div
          id="balance-card"
          className={cn(
            "flex h-full w-full flex-col items-center justify-center",
            size.height <= 250 ? "gap-0" : "gap-2",
          )}
          animate={{
            scale: isDragging ? 0.95 : 1,
            opacity: isDragging ? 0.8 : 1,
          }}
          transition={{
            duration: 0.15,
          }}
        >
          <h2
            className={cn(
              "font-geistRegular text-fontColorSecondary",
              size.width <= 300 ? "text-[10px]" : "text-xs",
            )}
          >
            BALANCE
          </h2>
          {selectedDisplayUSD === "Both" ? (
            <>
              <SolanaView
                size={size}
                amount={
                  isLoading
                    ? "-"
                    : formatAmountWithoutLeadingZero(totalBalance, 2)
                }
                color="default"
              />
              <USDView
                size={size}
                amount={
                  isLoading
                    ? "-"
                    : formatAmountDollar(totalBalance * solPrice, "prefix")
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
                  : formatAmountDollar(totalBalance * solPrice, "prefix")
              }
              color="default"
              isDisplayed
            />
          ) : (
            <SolanaView
              size={size}
              amount={
                isLoading
                  ? "-"
                  : formatAmountWithoutLeadingZero(totalBalance, 2)
              }
              color="default"
            />
          )}
        </motion.div>

        <Separator
          unit="fixed"
          fixedHeight={size.width <= 300 ? 40 : 80}
          orientation="vertical"
        />

        {/* PnL Card */}
        <motion.div
          id="pnl-card"
          className={cn(
            "flex h-full w-full flex-col items-center justify-center",
            size.height <= 250 ? "gap-0" : "gap-2",
          )}
          animate={{
            scale: isDragging ? 0.95 : 1,
            opacity: isDragging ? 0.8 : 1,
          }}
          transition={{
            duration: 0.15,
          }}
        >
          <h2
            className={cn(
              "font-geistRegular text-fontColorSecondary",
              size.width <= 300 ? "text-[10px]" : "text-xs",
            )}
          >
            PROFIT & LOSS
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
                color={Number(totalProfitAndLoss) >= 0 ? "profit" : "loss"}
              />
              <USDView
                size={size}
                amount={
                  isLoading
                    ? "-"
                    : formatAmountDollar(
                        Number(totalProfitAndLoss) * Number(solPrice),
                        "prefix",
                      )
                }
                color={Number(totalProfitAndLoss) >= 0 ? "profit" : "loss"}
              />
            </>
          ) : selectedDisplayUSD === "USD" ? (
            <USDView
              size={size}
              amount={
                isLoading
                  ? "-"
                  : formatAmountDollar(
                      Number(totalProfitAndLoss) * Number(solPrice),
                      "prefix",
                    )
              }
              color={Number(totalProfitAndLoss) >= 0 ? "profit" : "loss"}
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
              color={Number(totalProfitAndLoss) >= 0 ? "profit" : "loss"}
            />
          )}
        </motion.div>
      </div>
    </div>
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
          size.width <= 300 ? "size-4" : "size-8",
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
            ? "text-lg"
            : size.width <= 400
              ? "text-2xl"
              : size.width <= 400 && size.height <= 200
                ? "text-3xl"
                : "text-4xl",
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
                ? "text-sm"
                : size.width <= 400
                  ? "text-base"
                  : "text-lg",
            )
      }
    >
      {amount}
    </h4>
  );
}
