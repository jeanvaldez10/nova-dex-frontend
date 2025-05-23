"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useState } from "react";
import { usePnlSettings } from "@/stores/use-pnl-settings";
import { useUserWalletStore } from "@/stores/wallet/use-user-wallet.store";

// ######## Components 🧩 ########
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import PnLDisplayUSDButtons from "./PnLDisplayUSDButtons";
import PnLImageSelector from "./PnLImageSelector";
import PnLUploadProfilePicture from "./PnLUploadProfilePicture";
import BaseButton from "@/components/customs/buttons/BaseButton";
import { PopoverClose } from "@radix-ui/react-popover";

// ######## Types 🗨️ ########
import { Display } from "./types";
import { usePnlTrackerFooterData } from "@/hooks/use-pnl-tracker-footer-data";
import { cn } from "@/libraries/utils";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { Checkbox } from "@/components/ui/checkbox";
import { truncateAddress } from "@/utils/truncateAddress";
import { CachedImage } from "@/components/customs/CachedImage";
import { Wallet } from "@/apis/rest/wallet-manager";

export default function PnLTrackerSettingPopover({
  alignPopoverContent = "end",
}: {
  alignPopoverContent?: "end" | "start" | "center";
}) {
  const {
    selectedTheme: selectedThemeSetting,
    userName: savedUserName,
    size: selectedSize,
    selectedDisplayUSD,
    handleSavePNLSettings,
    handleResetPNLSettings,
  } = usePnlSettings();

  const { handleWalletSelection } =
    usePnlTrackerFooterData();

  const { userWalletFullList, selectedMultipleActiveWalletPnLTracker } =
    useUserWalletStore();

  const finalWallets = (
    (selectedMultipleActiveWalletPnLTracker &&
    selectedMultipleActiveWalletPnLTracker.length
      ? selectedMultipleActiveWalletPnLTracker
      : []) as Wallet[]
  )?.filter((w) => !w.archived);

  const storedWallets = finalWallets.map((w) => {
    return { balance: Number(w.balance), address: w.address };
  });

  const [selectedTheme, setSelectedTheme] = useState(selectedThemeSetting);
  const [size, setSize] = useState(selectedSize);
  const [userName, setUserName] = useState(savedUserName ?? "");
  const [activeDisplay, setActiveDisplay] = useState<Display>(
    selectedDisplayUSD ?? "Both",
  );
  const [isOpenSelectWallet, setIsOpenSelectWallet] = useState<boolean>(false);
  const [profilePicture, setProfilePicture] = useState<string>("");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="size-6 flex-shrink-0 rounded-full bg-white/[8%] p-1 hover:bg-white/20">
          <Image
            src="/icons/white-setting.png"
            alt="Setting Icon"
            quality={100}
            width={16}
            height={16}
            className="size-4 object-contain"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={alignPopoverContent}
        className="gb__white__popover relative z-[1000] flex h-full w-[360px] flex-col overflow-hidden rounded-[8px] border border-b border-border bg-[#080811] p-0 shadow-[0_0_20px_0_#000000] duration-300"
      >
        <div
          className={`flex h-[56px] w-full items-center justify-between gap-5 border-b border-border px-4 py-3.5`}
        >
          <h4 className="text-nowrap font-geistSemiBold text-[18px] text-fontColorPrimary">
            Settings
          </h4>
          <PopoverClose asChild>
            <button className="relative size-6 flex-shrink-0">
              <Image
                src="/icons/close.png"
                alt="Close Icon"
                fill
                quality={100}
                className="object-contain"
              />
            </button>
          </PopoverClose>
        </div>
        <div className="flex flex-col gap-4 overflow-hidden border-b border-border p-4">
          <div className="hidden h-[32px] w-full flex-shrink-0 items-center lg:flex">
            <Popover
              onOpenChange={(isOpen) => setIsOpenSelectWallet(isOpen)}
              open={isOpenSelectWallet}
            >
              <PopoverTrigger asChild className="h-full w-full cursor-pointer">
                <button
                  className={cn(
                    "flex h-full w-full items-center gap-x-3 rounded-[8px] border border-border bg-white bg-white/[4%] px-2 transition-all duration-200 ease-out active:border-primary active:bg-primary/[6%]",
                  )}
                >
                  <div className="relative flex aspect-square h-4 w-4 items-center justify-center">
                    <Image
                      src="/icons/wallet.png"
                      alt="Wallet Icon"
                      fill
                      quality={50}
                      className="object-contain"
                    />
                    <span className="absolute top-0 mt-[3px] font-geistSemiBold text-[8px] text-black">
                      {finalWallets.length}
                    </span>
                  </div>

                  <div className="my-auto flex h-full w-[92px] flex-shrink-0 flex-col justify-center text-start">
                    <div className="flex w-fit cursor-pointer items-center justify-between">
                      <div className="w-auto space-x-2 overflow-hidden text-ellipsis whitespace-nowrap font-geistSemiBold text-sm text-fontColorPrimary">
                        {finalWallets.length ===
                        userWalletFullList?.filter((w) => !w.archived)
                          .length ? (
                          <span
                            className={cn(
                              "inline-block rounded-md bg-white/[4%] px-2 py-[2px]",
                            )}
                          >
                            All Wallet Selected
                          </span>
                        ) : (
                          finalWallets?.slice(0, 3).map((wallet, index) => (
                            <span
                              key={index}
                              className={cn(
                                "inline-block rounded-md bg-white/[4%] px-2 py-[2px]",
                              )}
                            >
                              {wallet.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "relative mb-auto ml-auto mt-auto size-5 flex-shrink-0 transition-all duration-200 ease-out",
                      isOpenSelectWallet && "rotate-180",
                    )}
                  >
                    <Image
                      src="/icons/pink-chevron-down.png"
                      alt="Dropdown Pink Arrow Icon"
                      fill
                      quality={50}
                      className="object-contain"
                    />
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent
                sideOffset={24}
                className={cn(
                  "z-[1200] mt-[-0.8rem] rounded-[8px] border border-border bg-card py-2 pl-2 pr-1 shadow-[0_0_20px_0_#000000]",
                )}
              >
                <OverlayScrollbarsComponent
                  defer
                  element="div"
                  className="popover__overlayscrollbar h-[240px] w-full pr-2.5"
                >
                  <div className="flex w-full flex-col gap-y-1">
                    <button
                      onClick={() =>
                        handleWalletSelection(
                          userWalletFullList.filter((w) => !w.archived),
                        )
                      }
                      className={cn(
                        "flex h-[55px] flex-shrink-0 items-center justify-between rounded-[6px] border border-transparent bg-white/[4%] px-2 py-1.5 duration-300 hover:bg-white/[8%]",
                        finalWallets?.length ==
                          userWalletFullList?.filter((w) => !w.archived).length
                          ? "border-primary bg-primary/[8%]"
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
                            className="object-contain"
                          />
                        </div>
                        <span className="inline-block text-nowrap text-sm text-fontColorPrimary">
                          All
                        </span>
                      </span>

                      <div className="relative mb-2 aspect-square size-4">
                        <Checkbox
                          checked={
                            finalWallets?.length ==
                            userWalletFullList?.filter((w) => !w.archived)
                              .length
                          }
                        />
                      </div>
                    </button>

                    {userWalletFullList
                      ?.filter((w) => !w.archived)
                      ?.map((wallet, index) => {
                        const isActive = finalWallets?.find(
                          (w) => w.address === wallet.address,
                        );

                        return (
                          <button
                            key={index + wallet.address}
                            onClick={() => handleWalletSelection([wallet])}
                            className={cn(
                              "flex h-[55px] flex-shrink-0 items-center justify-between rounded-[6px] border border-transparent bg-white/[4%] px-2 py-1.5 duration-300 hover:bg-white/[8%]",
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
                                  <CachedImage
                                    src="/icons/solana-sq.svg"
                                    alt="Solana SQ Icon"
                                    fill
                                    quality={50}
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
                                  onClick={() =>
                                    handleWalletSelection([wallet])
                                  }
                                />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </OverlayScrollbarsComponent>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-geistRegular text-xs text-fontColorSecondary">
                Enter Username
              </Label>
              <div className="flex gap-0.5 rounded bg-[#9191A41F]/20 p-0.5 pr-2">
                <Image
                  src="/icons/optional.png"
                  alt="Close Icon"
                  quality={100}
                  width={16}
                  height={16}
                  className="size-4 object-contain"
                />
                <p className="text-xs text-fontColorSecondary">optional</p>
              </div>
            </div>
            <Input
              type="text"
              placeholder="Enter your username"
              className="min-h-8 border-[#FCFCFD14]/[8%] bg-[#FFFFFF]/[2%] px-3 py-[14px] text-sm"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div className="w-full gap-4">
            <Label className="font-geistRegular text-xs text-fontColorSecondary">
              Display USD
            </Label>
            <PnLDisplayUSDButtons
              activeDisplay={activeDisplay}
              setActiveDisplay={setActiveDisplay}
            />
          </div>
          <div className="w-full">
            <PnLImageSelector
              selectedTheme={selectedTheme}
              setSelectedTheme={setSelectedTheme}
              setSize={setSize}
            />
          </div>
          <div className="w-full items-center justify-center">
            <PnLUploadProfilePicture setProfilePicture={setProfilePicture} />
          </div>
        </div>

        <div className="flex flex-col gap-3 overflow-hidden p-4">
          <PopoverClose asChild>
            <BaseButton
              variant="primary"
              onClick={() => {
                handleSavePNLSettings({
                  selectedTheme,
                  selectedDisplayUSD: activeDisplay,
                  userName,
                  profilePicture,
                  size,
                });
              }}
            >
              Save
            </BaseButton>
          </PopoverClose>
          <PopoverClose asChild>
            <BaseButton
              variant="gray"
              className="bg-[#F65B9326]/15 text-destructive hover:bg-[#F65B9326]/25"
              onClick={() => {
                handleResetPNLSettings(storedWallets);
              }}
            >
              Reset P&L
            </BaseButton>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
