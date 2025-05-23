"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import React, { useEffect, useState, useMemo } from "react";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";
import { useWindowSizeStore } from "@/stores/use-window-size.store";
import { useQuickAmountStore } from "@/stores/dex-setting/use-quick-amount.store";
// ######## Components 🧩 ########
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";
import { Checkbox } from "../ui/checkbox";
import { truncateAddress } from "@/utils/truncateAddress";
import { Wallet } from "@/apis/rest/wallet-manager";

export default React.memo(function WalletSelectionButton({
  value,
  setValue,
  isFullWidth,
  className,
  maxWalletShow,
  isMultipleSelect = true,
  align = "end",
  isReplaceWhenEmpty = true,
  displayVariant = "address",
  showAllOption = true,
  isGlobal = true,
}: {
  value: Wallet[];
  setValue: (value: Wallet[]) => void;
  isFullWidth?: boolean;
  className?: string;
  maxWalletShow?: number;
  isMultipleSelect?: boolean;
  align?: "start" | "center" | "end";
  isReplaceWhenEmpty?: boolean;
  displayVariant?: "name" | "address";
  showAllOption?: boolean;
  isGlobal?: boolean;
}) {
  const { userWalletFullList } = useUserWalletStore();
  const finalWallets = userWalletFullList.filter((w) => !w.archived);
  const width = useWindowSizeStore((state) => state.width);
  const [openPopover, setOpenPopover] = useState(false);
  const [buttonWidth, setButtonWidth] = useState(0);

  const cosmoWallets = useQuickAmountStore((state) => state.cosmoWallets);
  const setCosmoWallets = useQuickAmountStore((state) => state.setCosmoWallets);

  // Add ref for measuring button width
  const buttonRef = React.useRef<HTMLDivElement>(null);

  // Update width when component mounts and on window resize
  useEffect(() => {
    const updateWidth = () => {
      if (buttonRef.current) {
        setButtonWidth(buttonRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const setFinalValue = (val: Wallet[]) => {
    if (isGlobal) {
      setCosmoWallets(val);
    } else {
      setValue(val);
    }
  };

  const finalValue = isGlobal ? cosmoWallets : value;

  // Improved toggle logic
  const toggleSelectWallet = (
    wallet: Wallet,
    isMultipleSelect: boolean,
    finalValue: Wallet[],
  ) => {
    if (!isMultipleSelect) {
      // Single select mode
      setFinalValue([wallet]);
      setOpenPopover(false);
      return;
    }

    // Multiple select mode
    const isSelected = finalValue.some((w) => w.address === wallet.address);
    if (isSelected) {
      // Don't allow deselecting if it's the last wallet and isReplaceWhenEmpty is true
      if (finalValue.length === 1 && isReplaceWhenEmpty) {
        return;
      }
      setFinalValue(finalValue.filter((w) => w.address !== wallet.address));
    } else {
      setFinalValue([...finalValue, wallet]);
    }
  };

  // Improved initialization effect
  useEffect(() => {
    if (finalWallets.length === 0) return;

    // Handle initial state
    if (finalValue.length === 0 && isReplaceWhenEmpty) {
      // If no wallets selected and replacement is enabled, select all wallets
      setFinalValue(finalWallets);
    } else if (!isMultipleSelect && finalValue.length > 1) {
      // If single select mode and multiple wallets selected, keep only first
      setFinalValue([finalValue[0]]);
    }
  }, [finalWallets, isMultipleSelect, isReplaceWhenEmpty]);

  useEffect(() => {
    if (width! > 920 && width! < 1024 && openPopover) {
      setOpenPopover(false);
    }
  }, [width]);

  // Improved wallet display logic
  const displayedWallets = useMemo(() => {
    const maxDisplay = maxWalletShow || (isFullWidth ? 4 : 2);
    return finalValue.slice(0, maxDisplay).map((wallet, index) => (
      <div
        key={wallet.address}
        className={cn(
          "flex h-[24px] flex-shrink-0 items-center justify-center gap-x-1 rounded-[4px] bg-white/[4%] px-[10px]",
        )}
      >
        <span className="font-geistSemiBold text-sm text-fontColorPrimary">
          {wallet.name}
        </span>
      </div>
    ));
  }, [finalValue, maxWalletShow, isFullWidth]);

  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover} modal={true}>
      <PopoverTrigger asChild>
        <div
          ref={buttonRef}
          id="wallet-selection-button"
          className={cn(
            "relative flex w-[280px] flex-grow cursor-pointer items-center justify-center gap-2",
            className,
          )}
        >
          <div
            className={cn(
              "relative flex h-[32px] w-full flex-grow items-center overflow-hidden rounded-[8px] border bg-secondary",
              finalValue.length > 0 && "bg-[#17171F]",
              openPopover ? "border-primary bg-primary/[8%]" : "border-border",
            )}
          >
            <div className="flex h-full flex-shrink-0 items-center justify-center pl-2">
              <div className="relative flex aspect-square h-4 w-4 flex-shrink-0 items-center justify-center">
                <Image
                  src="/icons/wallet.png"
                  alt="Wallet Icon"
                  fill
                  quality={50}
                  unoptimized
                  className="object-contain"
                />
                <span className="absolute top-0 mt-[3px] font-geistSemiBold text-[8px] text-black">
                  {finalValue.length}
                </span>
              </div>
            </div>
            <div className="relative flex h-full flex-grow justify-between gap-x-[4px] p-[2px]">
              <div className="flex h-full flex-grow items-center gap-x-[4px] overflow-hidden truncate">
                {finalValue.length === finalWallets.length ? (
                  <div className="absolute left-1 top-1/2 flex h-[24px] flex-shrink-0 -translate-y-1/2 items-center justify-center gap-x-1 rounded-[4px] bg-white/[4%] px-[10px]">
                    <span className="font-geistSemiBold text-sm text-fontColorPrimary">
                      All Wallets Selected
                    </span>
                  </div>
                ) : (
                  displayedWallets
                )}
              </div>
            </div>
            {/* from-[secondary] from-[60%] to-transparent */}
            <div className="absolute right-0 top-0 flex h-full w-[40px] flex-shrink-0 items-center justify-center bg-gradient-to-l from-secondary from-[60%] to-secondary/0">
              <div className="absolute inset-0 size-full" />
              <div
                title="Select Wallets"
                role="button"
                className="ml-auto mr-[1px] flex h-[26px] w-[26px] cursor-pointer items-center justify-center"
              >
                <div className="relative aspect-square h-6 w-6 flex-shrink-0">
                  <Image
                    src="/icons/pink-chevron-down.png"
                    alt="Pink Chevron Down Icon"
                    fill
                    quality={50}
                    unoptimized
                    className={cn(
                      "object-contain duration-300",
                      openPopover ? "rotate-180" : "rotate-0",
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={10}
        className="gb__white__popover z-[1000] rounded-[8px] border border-border bg-card p-0 py-2 pl-2 shadow-[0_0_20px_0_#000000]"
        style={{ width: Math.max(buttonWidth, 250) }}
      >
        <OverlayScrollbarsComponent
          defer
          element="div"
          className="popover__overlayscrollbar h-[220px] w-full pr-2.5"
        >
          <div className="flex w-full flex-col gap-y-1">
            {showAllOption && (
              <div
                role="button"
                onClick={() => {
                  if (finalValue.length === finalWallets.length) {
                    setFinalValue([finalWallets.find((w) => w.selected)!]);
                  } else {
                    setFinalValue(finalWallets);
                  }
                }}
                className={cn(
                  "flex h-[55px] items-center justify-between rounded-[6px] border border-transparent bg-white/[4%] px-2 py-1.5 duration-300 hover:bg-white/[8%]",
                  finalValue.length === finalWallets.length
                    ? "border-primary bg-white/[8%]"
                    : "",
                )}
              >
                <span className="flex items-center gap-x-[4px]">
                  <div className="relative aspect-square h-4 w-4">
                    <Image
                      src="/icons/wallet.png"
                      alt="Wallet Icon"
                      fill
                      quality={50}
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                  <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                    All
                  </span>
                </span>

                <div className="relative mb-2 aspect-square size-4">
                  <Checkbox
                    checked={finalValue.length === finalWallets.length}
                    onChange={() => setFinalValue(finalWallets)}
                  />
                </div>
              </div>
            )}

            {finalWallets?.map((wallet, index) => {
              const isActive = finalValue.find(
                (w) => w.address === wallet.address,
              );

              return (
                <div
                  role="button"
                  key={index + wallet.address}
                  onClick={() =>
                    toggleSelectWallet(wallet, isMultipleSelect, finalValue)
                  }
                  className={cn(
                    "flex h-[55px] flex-shrink-0 items-center justify-between rounded-[6px] border border-border bg-white/[4%] px-2 py-1.5 duration-300 hover:bg-white/[8%]",
                    isActive ? "border-primary bg-primary/[8%]" : "",
                  )}
                >
                  <span className="flex items-center gap-x-[4px]">
                    <div className="relative aspect-square h-4 w-4">
                      <Image
                        src="/icons/wallet.png"
                        alt="Wallet Icon"
                        fill
                        quality={50}
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                        {truncateAddress(wallet.name)}
                      </span>
                      <span className="inline-block text-nowrap text-xs text-fontColorSecondary">
                        {truncateAddress(wallet.address)}
                      </span>
                    </div>
                  </span>

                  <div className="flex items-center gap-x-2">
                    <div className="flex items-center gap-x-1">
                      <div className="relative aspect-square h-4 w-4 flex-shrink-0">
                        <Image
                          src="/icons/solana-sq.svg"
                          alt="Solana SQ Icon"
                          fill
                          quality={50}
                          unoptimized
                          className="object-contain"
                        />
                      </div>
                      <span className="inline-block text-nowrap font-geistSemiBold text-xs text-fontColorPrimary">
                        {wallet.balance}
                      </span>
                    </div>
                    <div className="relative mb-2 aspect-square size-4">
                      <Checkbox
                        checked={!!isActive}
                        onChange={() =>
                          toggleSelectWallet(
                            wallet,
                            isMultipleSelect,
                            finalValue,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </OverlayScrollbarsComponent>
      </PopoverContent>
    </Popover>
  );
});
