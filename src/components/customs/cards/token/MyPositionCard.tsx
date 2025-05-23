"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useMyPositionTableSettingStore } from "@/stores/table/token/use-my-position-table-setting.store";
import { useSolPriceMessageStore } from "@/stores/use-solprice-message.store";
// ######## Components 🧩 ########
import Image from "next/image";
import Link from "next/link";
import Copy from "@/components/customs/Copy";
import AvatarWithBadges from "@/components/customs/AvatarWithBadges";
import MyPositionButtons from "@/components/customs/buttons/token/MyPositionButtons";
import SocialLinkButton from "@/components/customs/buttons/SocialLinkButton";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { truncateAddress } from "@/utils/truncateAddress";
import { truncateString } from "@/utils/truncateString";
import {
  formatAmount,
  formatAmountDollar,
  formatAmountWithoutLeadingZero,
} from "@/utils/formatAmount";
import { HoldingsTokenData } from "@/types/ws-general";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useTokenMessageStore } from "@/stores/token/use-token-messages.store";
import PnLScreenshot from "../../token/PnL/PnLScreenshot";
import { useCurrentTokenChartPriceStore } from "@/stores/token/use-current-token-chart-price.store";
import { CachedImage } from "../../CachedImage";
import { usePopupStore } from "@/stores/use-popup-state";

interface TokenInfo {
  name: string;
  symbol: string;
  dex: string;
  mint: string;
  supply: number;
  image: string;
  twitter: string;
  telegram: string;
  website: string;
}

interface TokenData {
  token: TokenInfo;
  price: number;
  invested: number;
  sold: number;
}

interface MyPositionCardProps {
  wallet: string;
  tokenData: HoldingsTokenData;
}

export default function MyPositionCard({
  wallet,
  tokenData,
}: MyPositionCardProps) {
  const userWalletFullList = useUserWalletStore(
    (state) => state.userWalletFullList,
  );
  const finalWallet = userWalletFullList.filter((w) => !w.archived);
  const {
    token,
    investedSolStr,
    investedSol,
    balance,
    price,
    investedUsdStr,
    soldSol,
  } = tokenData;

  const initialTokenPriceSol = useTokenMessageStore(
    (state) => state.priceMessage.price_sol,
  );
  const currentGlobalChartPrice = useCurrentTokenChartPriceStore(
    (state) => state.price,
  );
  const finalPrice =
    currentGlobalChartPrice === "" ||
      isNaN(Number(initialTokenPriceSol)) ||
      !currentGlobalChartPrice
      ? initialTokenPriceSol
      : currentGlobalChartPrice;

  // Sold
  const soldUsd = soldSol * Number(finalPrice);

  // Remanining
  const remainingSol = balance * Number(finalPrice);
  const remainingUsd = balance * price.price_usd;

  const prevCalc = soldSol + balance * Number(finalPrice);
  const pnlSol = prevCalc - investedSol;
  const pnlUsd = pnlSol * Number(finalPrice);
  const pnlPercentage = (pnlSol / investedSol) * 100;
  const { remainingScreenWidth } = usePopupStore();

  return (
    <>
      <div
        className={cn(
          "flex-shrink-0 items-center overflow-hidden from-background to-background-1",
          "max-xl:rounded-[8px] max-xl:border max-xl:border-border max-xl:bg-card",
          "transition-colors duration-200 ease-out xl:flex xl:h-[92px] xl:min-w-max xl:py-4 xl:pl-[16px] xl:pr-[16px] xl:odd:bg-shadeTable xl:hover:bg-shadeTableHover",
          remainingScreenWidth <= 1280 && "max-xl:rounded-none max-xl:border-none max-xl:bg-transparent xl:flex xl:h-auto xl:min-w-fit xl:py-0 xl:pl-0 xl:pr-0",
        )}
      >
        <>
          <div className={cn("hidden h-full w-full min-w-[205px] flex-col justify-center xl:flex",
            remainingScreenWidth <= 1280 && "xl:hidden"
          )}>
            <div className="flex items-center gap-x-4">
              <AvatarWithBadges
                src={token.image}
                alt={`${token.name} Image`}
                size="lg"
              />

              <div className="flex flex-col gap-y-1">
                <div className="flex items-center gap-x-[4px]">
                  <h4 className="text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                    {truncateString(token.name, 8)}
                  </h4>
                  <span className="text-nowrap text-xs text-fontColorSecondary">
                    {token?.symbol}
                  </span>
                </div>

                <div className="-mt-0.5 flex items-center gap-x-[4px]">
                  <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
                    {truncateAddress(token.mint)}
                  </span>
                  <Copy value={token.mint} dataDetail={token} />
                </div>

                <div className="flex items-center gap-x-1">
                  {token.twitter && (
                    <SocialLinkButton
                      href={token.twitter}
                      icon="twitter"
                      label="Twitter"
                      typeImage="svg"
                    />
                  )}
                  {token.telegram && (
                    <SocialLinkButton
                      href={token.telegram}
                      icon="telegram"
                      label="Telegram"
                      typeImage="png"
                    />
                  )}
                  {token.website && (
                    <SocialLinkButton
                      href={token.website}
                      icon="website"
                      label="Website"
                      typeImage="svg"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={cn("hidden h-full w-full min-w-[137px] flex-col justify-center self-stretch xl:flex",
            remainingScreenWidth <= 1280 && "xl:hidden"
          )}>
            <div className="flex items-center gap-x-[4px]">
              <h4 className="text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                {finalWallet.find((item) => item.address === wallet)?.name}
              </h4>
            </div>
            <div className="flex items-center gap-x-[4px]">
              <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
                {truncateAddress(wallet)}
              </span>
              <Copy value={wallet} />
            </div>
          </div>

          <div className={cn("hidden h-full w-full min-w-[170px] flex-col justify-center self-stretch xl:flex",
            remainingScreenWidth <= 1280 && "xl:hidden"
          )}>
            <div className="flex items-center gap-x-1">
              <div className="relative aspect-auto size-4 flex-shrink-0">
                <CachedImage
                  src="/icons/solana-sq.svg"
                  alt={"Solana Icon"}
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                {formatAmountWithoutLeadingZero(Number(investedSolStr))}
              </span>
            </div>
            <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
              {Number(investedUsdStr) > 1
                ? formatAmountDollar(Number(investedUsdStr))
                : `$${formatAmountWithoutLeadingZero(Number(investedUsdStr))}`}
            </span>
          </div>

          <div className={cn("hidden h-full w-full min-w-[137px] flex-col justify-center self-stretch xl:flex",
            remainingScreenWidth <= 1280 && "xl:hidden"
          )}>
            <div className="flex items-center gap-x-1">
              <div className="relative aspect-auto size-4 flex-shrink-0">
                <CachedImage
                  src="/icons/solana-sq.svg"
                  alt="Solana Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                {formatAmountWithoutLeadingZero(Number(remainingSol))}
              </span>
            </div>
            <span className="flex w-fit items-center justify-center text-nowrap text-xs text-fontColorSecondary">
              {/* {balance} - {Number(finalPrice)} */}
              {remainingUsd > 1
                ? formatAmountDollar(Number(remainingUsd))
                : `$${formatAmountWithoutLeadingZero(Number(remainingUsd))}`}
            </span>
          </div>

          <div className={cn("hidden h-full w-full min-w-[137px] flex-col justify-center self-stretch xl:flex",
            remainingScreenWidth <= 1280 && "xl:hidden"
          )}>
            <div className="flex items-center gap-x-1">
              <div className="relative aspect-auto size-4 flex-shrink-0">
                <CachedImage
                  src="/icons/solana-sq.svg"
                  alt="Solana Icon"
                  fill
                  quality={100}
                  className="object-contain"
                />
              </div>
              <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                {formatAmountWithoutLeadingZero(Number(soldSol))}
              </span>
            </div>
            <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
              {soldUsd > 1
                ? formatAmountDollar(Number(soldUsd))
                : `$${formatAmountWithoutLeadingZero(Number(soldUsd))}`}
            </span>
          </div>

          <div className={cn("hidden h-full w-full min-w-[137px] flex-col justify-center self-stretch xl:flex",
            remainingScreenWidth <= 1280 && "xl:hidden"
          )}>
            <span
              className={cn(
                "inline-block text-nowrap font-geistSemiBold text-xs",
                pnlSol >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {pnlSol >= 0 ? "+" : ""}
              {pnlPercentage.toFixed(2)}%
            </span>
            <span
              className={cn(
                "inline-block text-nowrap text-xs text-fontColorSecondary",
                pnlSol >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {formatAmountWithoutLeadingZero(pnlSol)}
            </span>
          </div>

          <div className={cn("mr-auto hidden h-full w-full min-w-[137px] items-center justify-start gap-2 self-stretch xl:flex",
            remainingScreenWidth <= 1280 && "xl:hidden"
          )}>
            <div>
              <PnLScreenshot
                title={"$" + token?.symbol}
                image={token?.image || ""}
                mint={token.mint}
                solPrice={Number(finalPrice)}
                invested={investedSol}
                sold={soldSol}
                profitAndLoss={pnlSol}
                profitAndLossPercentage={pnlPercentage}
                isWithDialog
                trigger={<MyPositionButtons />}
                remaining={remainingSol}
              />
            </div>
          </div>
        </>
        {/* MOBILE */}
        <div className={cn("flex w-full flex-col xl:hidden",
          remainingScreenWidth <= 1280 && "xl:flex"
        )}>
          {/* Header */}
          <div className="relative flex h-12 w-full items-center justify-between overflow-hidden bg-white/[4%] px-3 py-3">
            <div className="flex items-center gap-x-3">
              <AvatarWithBadges
                src={token.image}
                alt={`${token.name} Image`}
                size="sm"
              />
              <div className="flex items-center gap-x-2">
                <h4 className="text-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                  {token.name}
                </h4>
                {/* <Copy value={token.mint} /> */}
                <span className="text-xs leading-3 text-fontColorSecondary">
                  {token?.symbol}
                </span>
                <div className="flex items-center gap-x-1">
                  <span className="text-xs leading-3 text-fontColorSecondary">
                    {truncateAddress(wallet)}
                  </span>
                  <Copy value={wallet} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-x-2">
              {token.twitter && (
                <SocialLinkButton
                  href={token.twitter}
                  icon="twitter"
                  label="Twitter"
                  typeImage="svg"
                />
              )}
              {token.telegram && (
                <SocialLinkButton
                  href={token.telegram}
                  icon="telegram"
                  label="Telegram"
                  typeImage="png"
                />
              )}
              {token.website && (
                <SocialLinkButton
                  href={token.website}
                  icon="website"
                  label="Website"
                  typeImage="svg"
                />
              )}
            </div>
          </div>

          {/* Market Data Grid */}
          <div className="flex gap-x-4 p-3">
            {[
              {
                label: "Invested",
                value: formatAmountWithoutLeadingZero(Number(investedSol)),
                icon: "/icons/solana.svg",
                subValue:
                  Number(investedUsdStr) > 1
                    ? formatAmountDollar(Number(investedUsdStr))
                    : `$${formatAmountWithoutLeadingZero(Number(investedUsdStr))}`,
              },
              {
                label: "Remaining",
                value: formatAmountWithoutLeadingZero(Number(remainingSol)),
                icon: "/icons/solana.svg",
                subValue: (
                  <span className="flex w-fit items-center justify-center">
                    {remainingUsd > 1
                      ? formatAmountDollar(Number(remainingUsd))
                      : `$${formatAmountWithoutLeadingZero(Number(remainingUsd))}`}
                  </span>
                ),
              },
              {
                label: "Sold",
                value: formatAmountWithoutLeadingZero(Number(soldSol)),
                subValue:
                  soldUsd > 1
                    ? formatAmountDollar(Number(soldUsd))
                    : `$${formatAmountWithoutLeadingZero(Number(soldUsd))}`,
                valueClassName:
                  soldSol > 0 ? "text-success" : "text-destructive",
                icon: "/icons/solana.svg",
              },
              {
                label: "P&L",
                value: `${pnlPercentage > 0 ? "+" : ""}${pnlPercentage.toFixed(2)}%`,
                subValue: formatAmount(pnlSol, 2),
                valueClassName:
                  pnlSol > 0 ? "text-success" : "text-destructive",
              },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-y-0.5">
                <span className="mb-0.5 text-nowrap text-xs text-fontColorSecondary">
                  {item.label}
                </span>
                <div className="flex items-center gap-x-1">
                  {item.icon && (
                    <div className="relative aspect-auto h-3 w-3">
                      <Image
                        src={item.icon}
                        alt="Icon"
                        fill
                        quality={100}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <span
                    className={cn(
                      "font-geistSemiBold text-xs text-fontColorPrimary",
                      item.valueClassName,
                    )}
                  >
                    {item.value}
                  </span>
                </div>
                {item.subValue && (
                  <span className="text-xs text-fontColorSecondary">
                    {item.subValue}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between border-t border-border px-3 py-2">
            <div className="flex items-center gap-x-1">
              <span className="font-geistSemiBold text-xs text-fontColorPrimary">
                {finalWallet.find((item) => item.address === wallet)?.name}
              </span>
              <span className="text-xs text-fontColorSecondary">
                {truncateAddress(wallet)}
              </span>
              <Copy value={wallet} className="size-3" />
            </div>
            <div className="ml-auto flex gap-2">
              <PnLScreenshot
                title={"$" + token?.symbol}
                mint={token.mint}
                solPrice={Number(finalPrice)}
                invested={investedSol}
                sold={soldSol}
                profitAndLoss={pnlSol}
                profitAndLossPercentage={pnlPercentage}
                isWithDialog
                trigger={<MyPositionButtons />}
                remaining={remainingSol}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
